const QRCode = require("qrcode");
const {app, BrowserWindow, ipcMain, Tray, Menu} = require('electron');
const { config } = require('process');
const { ServerResponse } = require('http');

const { initUpdater, getAppVersion } = require("./Updates/Updater.js");

const {getConfigData} = require('./API/GetConfigData.js');

const {generateRandomPassword} = require('./PasswordGenerator/GenerateRandomPassword.js');

const {createNewAccount} = require('./API/Account/CreateNewAccount.js');

const {sendLoginRequest} = require('./API/Login/LoginRequest/SendLoginRequest.js');
const {authenticateUser} = require('./API/Login/Authentication/AuthenticateUser.js');

const {encrypt,decrypt} = require('./Encryption/Encrypt.js');
const {hash} = require('./Encryption/Hash.js');

const {getStorage} = require('./API/Storage/GetStorage.js');
const {modifyStorageRecord} = require('./API/Storage/ModifyRecord.js');
const {addNewStorageRecord} = require('./API/Storage/AddNewStorageRecord.js');
const {removeStorageRecord} = require('./API/Storage/RemoveStorageRecord.js');
const {reEncryptStorage} = require('./Storage/ReEncryptStorage.js');

const {runTray} = require('./Tray/RunTray.js');

const {loadTray, setCurrentWindowForTray, trayOpenFunction} = require('./Tray/LoadTrayLanguage.js');
const {makeLoginWindow} = require('./WindowsMakers/Login/MakeLoginWindow.js');
const {makeMainWindow} = require('./WindowsMakers/Main/MakeMainWindow.js');


const {saveToken, getToken, clearToken} = require('./SecureStorage/tokenStorage.js');

const {encryptUserPassword, decryptUserPassword} = require('./Encryption/EncryptUserPassword.js');

const {haveSecurityPassword} = require('./API/SecurityPassword/HaveSecurityPassword.js');
const {getSecurityPasswordIfExist, saveNewSecurityPassword, updateSecurityPasswordToNewOne, validateNewSecurityPassword} = require('./SecurityPassword/SecurityPasswordManagement.js');
const {setSecurityPassword,getSecurityPassword} = require('./SecurityPassword/SecurityPassword.js');
const {setUserEncryptionKey,getUserEncryptionKey} = require('./Encryption/UserPasswordEncryptionKey.js');
const {changeSecurityPassword} = require('./API/SecurityPassword/ChangeSecurityPassword.js');
const {removeSecurityPassword} = require('./API/SecurityPassword/RemoveSecurityPassword.js');

const {getUserAuthMethode} = require("./API/AuthMethodes/GetUserAuthMethode.js");
const {getUserPhoneNumber} = require("./API/User/GetPhoneNumber.js");
const {getAllAuthMethodes} = require("./API/AuthMethodes/GetAllAuthMethodes.js");
const {getQrCode} = require("./API/AuthMethodes/GetQrCode.js");
const {changeAuthMethodeVerifyUser} = require('./API/AuthMethodes/ChangeMethodeVerifyUser.js');
const {sendNewMethodeActivationCode} = require('./API/AuthMethodes/SendNewMethodeActivationCode.js');
const {setUserNewAuthMethode} = require('./API/AuthMethodes/SetUserNewAuthMethode.js');


const {getUsermailFilterData} = require('./API/Roles/GetUsermailFilterData.js');
const {setUserRole} = require('./API/Roles/SetUserRole.js');
const {getRolesData} = require('./API/Roles/GetRolesData.js');
const {getAllRolesList} = require('./API/Roles/GetAllRolesList.js');
const {removeRoleFromUser} = require('./API/Roles/RemoveRoleFromUser.js');

const {getLogFiltersData} = require('./API/Logs/GetLogFiltersData.js');
const {getLogsData} = require('./API/Logs/GetLogsData.js');
const {requestPhoneCode} = require('./API/AuthMethodes/RequestPhoneCode.js');
const { activatePhone } = require("./API/AuthMethodes/ActivatePhone.js");
const { setSecurityPasswordHash } = require("./SecurityPassword/SecurityPasswordHash.js");

const {validatePassword} = require("./API/Password/ValidatePassword.js");

const {validatAccountPassword} = require("./AccountPassword/ValidateAccountPassword.js");
const {setNewAccountPassword} = require("./API/Account/SetNewAccountPassword.js");
const {sendAccountPasswordResetRequest} = require("./API/Account/SendAccountPasswordResetRequest.js");
const {validatePasswordResetToken} = require("./API/Account/ValidatePasswordResetToken.js");

const appName="PassHolder";

let loginWindow;
let mainWindow;
let currentWindow;

let tray;
let securityPassword;
let isLoggedIn = false; //flaga zalogowania
let isQuitting = false; // Flaga zamknięcia aplikacji

let user;
let userId;
let role;

const getInstanceLock = app.requestSingleInstanceLock();

if(!getInstanceLock){
    //jeśli aplikacja już uruchomiona
    app.quit(); // ponowne uruchomienie nic nie otworzy
} else{
    //kolejna instancja
    app.on('second-instance', () => {
        // Przywróć okno logowania lub główne, jeśli jest zminimalizowane
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        } else if (loginWindow) {
            if (loginWindow.isMinimized()) loginWindow.restore();
            loginWindow.focus();
        }
    });
    //Ustawienie nazwy
    app.setName(appName);
    // Kolejność ładowania  
    app.whenReady().then(() => {
    //disableDevTools();            //Wyłącz DevTools w aplikacji
    initUpdater();                  // Aktualizacja przed uruchomieniem
    createLoginWindow();            //Otwarcie okna Logowania
    startInTray();                  //Uruchomienie Aplikacji w Tray
    trayOpenFunction();             //Otwieranie okien z paska ukrytych ikon
});
}

// Blokuj skróty klawiszove DevTools
function disableDevTools(){
app.on('browser-window-created', (_, window) => {
  window.webContents.on('before-input-event', (event, input) => {
    const key = input.key.toLowerCase();
    if (
      (input.control && input.shift && key === 'i') || // Ctrl+Shift+I
      key === 'f12'
    ) {
      event.preventDefault();
    }
  });
});
}

// Wyłącz wyłączanie aplikacji, gdy wszystkie okna są wyłączone
app.on('window-all-closed', (event) => {
  event.preventDefault(); // zatrzymuje domyślne zamknięcie
});

//zapisz securityPassword
async function securityPasswordLocalSave(){
    const temp = await getSecurityPasswordIfExist();
    if(temp.success){
        if(temp.securityPassword !== null){
            securityPassword = temp.data;
        } else {
            console.log("Security Password nie ma w bazie danych");
        }
    } else{
        console.log("Nie udalo się pobrac hasla bezpieczentwa, success: ", temp.success);
    }
}

// Utworzenie okna logowania programu.
function createLoginWindow(){
    loginWindow = makeLoginWindow(isLoggedIn, isQuitting);
    currentWindow = loginWindow;
    setCurrentWindowForTray(currentWindow);
    loginWindow.on('close', (event) =>{ //Domyślnie zamiast zamykać to chowa do Tray
        if(!isLoggedIn && !isQuitting){ 
            event.preventDefault();
            loginWindow.hide();
        }
    });
}

// Utworzenie okna głównego programu.
function createMainWindow(){
    mainWindow = makeMainWindow();
    currentWindow = mainWindow;
    setCurrentWindowForTray(currentWindow);  // Jeśli aplikacja nie jest zamykana z Tray, to zamiast zamknąć aplikację schowa się na dole do tray
    securityPasswordLocalSave(); //Załaduj hasło bezpieczeństwa z serwera
    mainWindow.on('close', (event) =>{
        if(!isQuitting && isLoggedIn){
            event.preventDefault();
            mainWindow.hide();
        }
    });
}

//Zakładanie nowego konta użytkownika
ipcMain.handle('create-user-account', async (event, email, name, password) =>{
    try{
        if(email && name && password){
            let result = await createNewAccount(email, name, password);
            return {success: true, data: result};
        }
        return {success: false, error: "data not complete"};
    }catch(error){
        console.error('Błąd zakladania konta:', error);
        return { success: false, error: error.message };
    }
});

//Wyślij request logowania
ipcMain.handle('send-login-request', async (event, email, password)=>{
    try{
        let result = await sendLoginRequest(email, password);
        return {success: true, data: result.data};
    }catch(error){
        console.error('Błąd logowania:', error);
        return { success: false, error: error.message };
    }
});

//Wyślij otrzymany kod autoryzacyjny
ipcMain.handle('send-authentication-code', async (event, email, authCode) =>{
    try{
        if(authCode){
            let result = await authenticateUser(email, authCode);
            return {success: true, data: result.data};
        } else{
            return {success: false, error: "no code recieverd"};
        }
    }catch(error){
        console.error('Błąd autoryzacji:', error);
        return { success: false, error: error.message };
    }
});

// Załaduj plik konfiguracji endpointów api
ipcMain.handle('load-apiConfig', async (event) => {
    try{
        const configData = getConfigData();
        return {success: true, config: configData};
    }catch(error){
        console.error('Błąd:', error);
        return { success: false, error: error.message };
    }
});

//Generowanie losowego hasła
ipcMain.handle('generate-random-password', ()=>{
    let result = generateRandomPassword();
    if(result && result.success && result.data){
        return {success: true, data: result.data};
    }
    return {success: false, error: "błąd generowania hasła"};
});

// Szyfrowanie Hasła
ipcMain.handle('encrypt-password', async (event, password)=>{
    try{
        return encrypt(password);
    }catch(error){
        console.error('Bład:', error);
        return { success: false, error: error.message };
    }
});

// Odszyfrowanie Hasła
ipcMain.handle('decrypt-password', async(event, password)=>{
    try{
        let result = decrypt(password);
        if(result){
            if(result.success){
                return {success: true, data: result.data};
            } else{
                return {success: false, error: result.error};
            }
        }
    }catch(error){
        console.error('Bład:', error);
        return { success: false, error: error.message };
    }
    return {success: false, error: "nie można odszyfrować hasła"};
});

//Hashowanie hasła
ipcMain.handle('hash', async (event, password)=>{
    try{
        await setUserEncryptionKey(password);
        return hash(password);
    }catch(error){
        console.error('Błąd:', error);
    }
});

//szyfrowanie hasła użytkownika
ipcMain.handle('encrypt-user-password', async (event,password, key)=>{
    let message = "";
    if(!key){
        key = getSecurityPassword();
    }
    if(password && key &&  password !== null){
        let encryptedPass = await encryptUserPassword(password);
        return {success: true, password: encryptedPass};
    }
    message = "Błąd zapisu hasła.";
    return {success: false, message: message};
});

//odszyfrowanie hasła użytkownika
ipcMain.handle('decrypt-user-password', async (event, password)=>{
    let message = "";
    let inputSecurityPassword = getSecurityPassword();
    if(!inputSecurityPassword){
        message = "Wymagane hasło bezpieczeństwa";
        return {success: false, message: message}
    }
    if(password && password !== null && inputSecurityPassword && inputSecurityPassword !== null){
        let result = await getSecurityPasswordIfExist();
        let userSecurityPassword = result.securityPassword;
        if(userSecurityPassword && userSecurityPassword !== null){
            let hashSecPass = await hash(inputSecurityPassword);
            if(userSecurityPassword === hashSecPass){
                let result = await decryptUserPassword(password);
                if(result && result.success){
                    return {success: true, password: result.data};
                } else{
                    return {success: false, message: "błąd odczytu hasła"};
                }
            } else{
                message = "Podane hasło jest nieprawidłowe.";
                return {success: false, message: message}
            }
        } else {
            message = "Błąd odczytu hasła bezpieczeństwa";
            return {success: false, message: message}
        }
    }
    message = "Błąd odczytu danych";
    return {success: false, message: message}
});

//Pobierz ogólną listę dostępnych ról
ipcMain.handle('get-all-roles-list', async ()=>{
    try{
        let result = await getAllRolesList();
        if(result && result.success && result.data){
            return {success: true, data: result.data};
        }
        return {success: false, error: "błąd pobierania listy dostępnych ról."}
    }catch(error){
        console.log("Błąd pobierania listy dostępnych ról.");
        return {success: false, error: "błąd pobierania listy dostępnych ról."}
    }
});

//pobierz listę ról
ipcMain.handle('get-all-roles', async ()=>{
    try{
        let result = await getRolesData();
        if(result && result.success && result.data){
            return {success: true, data: result.data};
        }
        return {success: false, error: "błąd pobierania listy ról."}
    }catch(error){
        console.log("Błąd pobierania listy ról.");
        return {success: false, error: "błąd pobierania listy ról."}
    }
}); 

//Wyszukaj użytkowników przy dodawaniu ról
ipcMain.handle('get-role-usermail-search-list', async(event, userMail) =>{
    if(!userMail || userMail.length<3){
        return {success: false, error: "zbyt mało danych."}
    }
    try{
        let result = await getUsermailFilterData(userMail);
        if(result && result.success && result.data){
            return {success: true, data: result.data};
        }
        return {success: false, error: "błąd pobierania listy użytkowników."}
    }catch(error){
        console.log("Błąd pobierania listy ról.");
        return {success: false, error: "błąd pobierania listy użytkowników do ról."}
    }
});

//Zmień rolę użytkownika
ipcMain.on('set-user-role', async (event, userModMail, roleName)=>{
    if(userModMail && roleName){
        let result = await setUserRole(roleName, userModMail);
        if(result){
            if(result.success){
                return {success: true, data: result.data};
            }
            return {success: false, error: result.error};
        }
        return {success: false, error: "błąd przyznawania roli"};
    }
    return {success: false, error: "nie podano użytkownika lub roli"};
});

//zdegraduj użytkownika do zwykłego usera
ipcMain.handle('remove-role-from-user', async(event, user)=>{
    try{
        if(!user){
            return {success: false, error: "brak danych"};
        }
        let result = await removeRoleFromUser(user);
        if(result){
            if(result.success){
                return {success: true, data: result.data};
            }else{
                return {success: false, error: result.data};
            }
        } else{
            return {success: false, error: "błąd pobierania danych"};
        }
    }catch(error){
        console.error("błąd usuwania roli użytkownika: ", error);
        return {success: false, error: "błąd usuwania roli użytkownika"};
    }
});

// Zmień okno z logowania na główne
ipcMain.on('login-success', ()=>{
    if(loginWindow){
        isLoggedIn = true;
        loginWindow.close();
        loginWindow=null;
    }
    createMainWindow();
});

//Wylogowanie
ipcMain.on('logout', ()=>{
    isLoggedIn = false;
    mainWindow.close();
    mainWindow=null;
    createLoginWindow();
});

// Ustaw nazwę zalogowanego użytkownika
ipcMain.on('set-user', (event, username)=>{
    if(loginWindow){
        user=username;
        //userId = createNewUserIfNotExist(db, user);
    }
});

// Przełączanie zakładek
ipcMain.on('switch-card', (event, pageName)=>{
    let filePath;
    switch (pageName) {
        case 'home':
            filePath = path.join(__dirname, 'Pages', '/Home/home.html');
            break;
        case 'storage':
            filePath = path.join(__dirname, 'Pages', '/Storage/storage.html');
            break;
        case 'settings':
            filePath = path.join(__dirname, 'Pages', '/Settings/settings.html');
            break;
        default:
            filePath = path.join(__dirname, 'Pages', '/Home/home.html');
    }
    if (mainWindow) {
        mainWindow.loadFile(filePath);
    }
});

ipcMain.handle('get-storage', async (event)=>{
    try {
       let result = await getStorage();
       if(result){
        return {success: true, data: result.data};
       }
       return {success: false, error: "data not found"};
    }catch(err){
        console.error("Błąd pobierania danych storage.");
        return {success: false};
    }
});

ipcMain.handle('add-new-storage-record', async (event, data)=>{
    try{
        if(data && data.url && data.login && data.password){
            let result = await addNewStorageRecord(data.url, data.login, data.password);
            return {success: true, data: result};
        }
        else{
            return {success: false, error: "data not found"};
        }
    } catch(error){
        console.error("Błąd dodawania nowego rekordu storage");
        return {success: false};
    }
});

ipcMain.handle('remove-storage-record', async (event, record)=>{
    try{
        if(record){
            const result = await removeStorageRecord(record);
            if(result){
                return {success: true, data: result};
            } else{
                return {success: false, error: "błąd usuwania rekordu."};
            }
        } else{
            return {success: false, error: "nie otrzymano danych rekordu do usunięcia"};

        }
    }catch(error){
        console.error("Błąd usuwania pozycji.", error);
        return {success: false};
    }

});

ipcMain.handle('modify-storage-record', async (event, data)=>{
    try{
        if(data){
            let result = await modifyStorageRecord(data);
            return {success: true, data: result};
        } else{
            return {success: false, error: "brak otrzymanych danych"};
        }
    } catch(err){
        console.error("Błąd aktualizacji danych haseł storage.", err);
        return {success: false};
    }
});

//Pobieranie danych do wypełnienia filtrów logów 
ipcMain.handle('get-log-filters-data', async()=>{
    try{
        let result = await getLogFiltersData();
        if(result && result.success && result.data){
            return {success: true, data: result.data};
        }
        return {success: false, error: "nie można pobrać danych"};
    }catch(error){
        console.error("błąd pobierania danych do filtrów logów", error);
    }
});

//Pobieranie danych logów z uwzględnieniem filtrów
ipcMain.handle('get-logs-data', async(event, filtersData)=>{
    try{
        if(filtersData){
            let result = await getLogsData(filtersData);
            if(result && result.success && result.data && result.pageNumber){
                return {success: true, data: result.data, pageNumber: result.pageNumber, lastPage: result.lastPage};
            }
            return {success: false, error: "nie można pobrać danych"};
        }
        return {success: false, error: "niekompletne dane"};
    }catch(error){
        console.error("błąd pobierania danych logów", error);
    }
});

ipcMain.handle('save-token', async (event, token)=>{
    try{
        await saveToken(token);
        return {success: true};
    }catch(err){
        console.error("Błąd zapisu tokenu:", err);
        return {success: false};
    }
});

ipcMain.handle('load-token', async ()=>{
    try{
        const token = await getToken();
        return {success: true, token: token};
    }catch(err){
        console.error("Błąd odczytu tokenu:", err);
        return {success: false, token: null};
    }
});

ipcMain.handle('clear-token', async ()=>{
    try{
        await clearToken();
        return {success: true};
    }catch(err){
        console.error("Błąd kasowania tokenu:", err);
        return {success: false};
    }
});

ipcMain.handle('get-security-password-hash', async ()=>{
    try{
        let response = await getSecurityPasswordIfExist();
        if(response && response.success && response.securityPassword){
            securityPassword = response.securityPassword;
            return {success: true, securityPassword: response.securityPassword};
        }
        return {success: false};
    } catch(err){
        console.error("Błąd kasowania tokenu:", err);
        return {success: false};
    }
});

ipcMain.handle('have-security-password', async ()=>{
    try{
        let response = await haveSecurityPassword();
        if(response && response.success && response.data && response.data===true){
            return true;
        }
        return false;
    } catch(err){
        console.error("Błąd odczytu", err);
        return false;
    }
});

ipcMain.handle('compare-security-password', async (event, userInput)=>{
    try{
        let userInputHashed = await hash(userInput);
        let oldPassHash = await getSecurityPasswordIfExist();
        if(userInputHashed && oldPassHash && oldPassHash.success&& oldPassHash.success===true && userInputHashed===oldPassHash.securityPassword){return true;}
        return false;
    } catch(err){
        console.error("Błąd odczytu", err);
        return false;
    }
});

ipcMain.handle('get-security-password', ()=>{
    try{
        let response = getSecurityPassword();
        if(response){
            return response;
        }
        return null;
    } catch(err){
        console.error("Błąd kasowania tokenu:", err);
        return null;
    }
});

ipcMain.handle('set-security-password', (event, input)=>{
    try{
        if(input){
            setSecurityPassword(input);
        }
    } catch(err){
        console.error("Błąd kasowania tokenu:", err);
    }
});

ipcMain.handle('save-security-password', async (event, securityPassword)=>{
    try{
        await saveSecurityPassword(securityPassword);
        return {success: true};
    } catch(err){
        console.error("Błąd kasowania tokenu:", err);
        return {success: false};
    }
});

ipcMain.handle('validate-security-password', async (event, recivedSecurityPassword) => {
    try{
        let response = await getSecurityPasswordIfExist();
        if(response && response.success && response.securityPassword && recivedSecurityPassword){
            let recivedPass = await hash(recivedSecurityPassword);
            if(recivedPass === securityPassword){
                return true;
            }
        }
        return false;
    } catch(err){
        console.error("Błąd weryfikacji hasła:", err);
        return false;
    }
});

ipcMain.handle('is-security-password-required', () =>{
    try{
        let response = getSecurityPassword();
        if(response && response !== null){
            return false;
        }
        return true;
    } catch(err){
        console.error("Błąd weryfikacji hasła:", err);
        return true;
    }
});

ipcMain.handle('remove-security-password', async(event, code)=>{
    try{
        let result = await removeSecurityPassword(code);
        if(result && result.data && result.data.success===true){return {success: true};}
        return {success: false};
    }catch(error){
        console.error("Błąd usuwania hasła bezpieczeństwa");
        return {success: false};
    }
});

ipcMain.handle('change-security-password', async(event, newSecurityPassword, oldSecurityPassword, code, storage)=>{
    try{
        if(!newSecurityPassword || !oldSecurityPassword || !code ){return {success: false};}
        const hashNewPass = await hash(newSecurityPassword);
        let resultStorage = await getStorage();
        if(!resultStorage || !resultStorage.success || resultStorage.success===false || !resultStorage.data){return {success: false};}
        let newStorage = reEncryptStorage(oldSecurityPassword, resultStorage.data);
        let hashSecPass = hash(newSecurityPassword);
        let result = await changeSecurityPassword(hashSecPass, code, newStorage);
        setSecurityPassword(newSecurityPassword);
        return{success: true};
    }catch(error){
        console.error("Błąd zmiany hasła bezpieczeństwa");
        return{success: false};
    }
});

ipcMain.handle('user-password-encryption-key', async (event, userPassword)=>{
    try{
        if(userPassword){
            let result = await setUserEncryptionKey(userPassword);  
        }else{
            console.log('Brak podanego hasła użytkownika.');
            return {success: false, error: 'Brak podanego hasła użytkownika.'};
        }
    }catch(err){
        console.error("Błąd ustawiania hasła szyfrowania użytkownika:", err);
        return {success: false, error: "Błąd ustawiania hasła szyfrowania użytkownika:"};
    }
});

ipcMain.handle('validate-new-security-password', (event, newSecurityPassword)=>{
    const response = validateNewSecurityPassword(newSecurityPassword);
    return response;
});

ipcMain.handle('set-new-security-password', async (event, newSecurityPassword)=>{
    const response = await getSecurityPasswordIfExist();
    if(response.success === true && (!response.securityPassword || response.securityPassword === null)){
        const response2 = await saveNewSecurityPassword(newSecurityPassword);
        if(response2.success){
            let response3 = await getSecurityPasswordIfExist();
            if(response3.success && response3.securityPassword){
                securityPassword = response3.securityPassword;
                return true;
            }
        }
    }
    return false;
});

ipcMain.handle('auth-methode-change-validate-user', async (event, password)=>{
    try{
        let result = await changeAuthMethodeVerifyUser(password);
        if(result && result.success && result.data.success){
            return {success: true};
        }
        return {success: false, error: "błąd weryfikacji"}
    }catch(error){
        console.error("Błąd weryfikacji użytkownika", err);
        return {success: false, error: err};
    }
});

ipcMain.handle('send-new-auth-methode-activation-code', async (event, methode)=>{
    try{
        let result = await sendNewMethodeActivationCode(methode);
        if(result){
            if(result.success){
                return {success: true};
            } else{
                return {success: false};
            }
        }
        return {success: false, error: "błąd wysyłko kodu aktywacyjnego"}
    }catch(error){
        console.error("Błąd weryfikacji użytkownika", err);
        return {success: false, error: err};
    }
});

ipcMain.handle('request-phone-code', async (event, phone)=>{
    try{
        let result = await requestPhoneCode(phone);
        if(result){
            if(result.success && result.data.success){
                return {success: true};
            } else{
                return {success: false};
            }
        }
        return {success: false, error: "błąd wysyłki kodu aktywacyjnego"}
    }catch(error){
        console.error("Błąd wysyłania żądania", err);
        return {success: false, error: err};
    }
});

ipcMain.handle('activate-phone', async (event, phone,code)=>{
    try{
        let result = await activatePhone(phone,code)
        if(result){
            if(result.success && result.data.success){
                return {success: true};
            } else{
                return {success: false};
            }
        }
        return {success: false, error: "błąd wysyłki kodu aktywacyjnego"}
    }catch(error){
        console.error("Błąd weryfikacji numeru", err);
        return {success: false, error: err};
    }
});

ipcMain.handle('activate-new-auth-methode', async (event, methode, code)=>{
    try{
        let result = await setUserNewAuthMethode(methode, code);
        if(result){
            if(result.success && result.data.success){
                return {success: true};
            } else{
                return {success: false};
            }
        }
        return {success: false, error: "błąd wysyłko kodu aktywacyjnego"}
    }catch(error){
        console.error("Błąd weryfikacji użytkownika", err);
        return {success: false, error: err};
    }
});

ipcMain.handle('get-user-auth-methode', async ()=>{
    try{
        let result = await getUserAuthMethode();
        return result;
    } catch(err){
        console.error("Błąd odczytu metody autoryzacji użytkownika", err);
        return {success: false, error: err};
    }
});

ipcMain.handle('get-user-phone', async ()=>{
    try{
        let result = await getUserPhoneNumber();
        if(result && result.success){
            return {success: true, data: result.data};
        }
        return {success: false, error: result.error};
    }catch(error){
        console.error("Błąd odczytu metody numeru tel.", error);
        return {success: false, error: error};
    }
});

ipcMain.handle('get-all-auth-methodes', async ()=>{
    try{
        let result = await getAllAuthMethodes();
        return result;
    } catch(err){
        console.error("Błąd odczytu dostępnych metod autoryzacji.", err);
        return {success: false, error: err};
    }
});

ipcMain.handle('is-security-password-set', async()=>{
    try{
        let response = await getSecurityPasswordIfExist();
        if(response){
            securityPassword = response.securityPassword;
            if(securityPassword && securityPassword !== null){
                return true;
            }
        }
        return false;
    }catch(err){
        console.error("Błąd weryfikacji zapisu securityPassword:", err);
        return {success: false};
    }
});

ipcMain.handle('get-qr-code', async ()=>{
    try{
        const result = await getQrCode();
        if(!result || result.success===false || !result.data){
            return {success: false, error: "nie można pobrać QR kodu"}; 
        }
        const qr = await QRCode.toDataURL(result.data.qrCode);
        return {success: true, data: qr};
    } catch(error){
        console.log("error:", error);
        return {success: false, error: error};
    }
});

//Zwróć aktualną uruchomioną wersję aplikacji
ipcMain.handle('get-app-version', ()=>{
    try{
        let result = getAppVersion();
        return {success: true, data: result};
    }catch(error){
        console.error("error:", error);
        return {success: false, data: result};
    }
});

ipcMain.handle('validate-password', async (event, input)=>{
    try{
        let result = await validatePassword(input);
        if(result && result.data.validated === true){
            return true;
        }
        return false;
    }catch(error){
        console.error("error", error);
        return false;
    }
});

ipcMain.handle('set-role', (event, input)=>{
    try{
        if(input){
            role=input;
        }
    }catch(error){
        console.error("error", error);
        return;
    }
});

ipcMain.handle('get-role', ()=>{
    try{
        return role;
    }catch(error){
        console.error("error", error);
        return;
    }
});

//wyślij żądanie resetu hasła użytkownika
ipcMain.handle('send-password-reset-request', async (event, mail)=>{
    if(mail && mail !== null){
        let result = await sendAccountPasswordResetRequest(mail);
        return {success: true, data: ""};
    }
    return {success: false, data: "Brak danych"};
});

//zweryfikuj poprawność tokenu resetowania hasła
ipcMain.handle('validate-password-reset-token', async (event, mail, token)=>{
    if(mail && token && mail!==null && token!== null){
        let result = await validatePasswordResetToken(mail, token);
        return {success: result.data.success, data: result.data};
    }
    return {success: false, data: "Brak danych"};
});

//zmień hasło użytkownika na nowe
ipcMain.handle('set-new-user-password', async (event, data)=>{
    if(data && data.password!==null && data.passwordChangeToken !== null && data.authCode !== null){
        let result = await setNewAccountPassword(data);
        return {success: result.success, data: result.data};
    }
    return {success: false, data: "Błąd wysyłania formularza."};
});

//zweryfikuj hasło użytkownika do konta
ipcMain.handle('validate-account-password', (event, password)=>{
    if(password === null){return {success: false, data: "nie podano hasła"};}
    let result = validatAccountPassword(password);
    if(result !== null){return result;}
    return {success: false, data: "nie podano hasła"};
});

// Wywołanie aplikacji w Tray - menu ukrytych ikon
function startInTray(){
    if(tray==null){
        tray = runTray();  
        trayReload();
    }
}

// Ładowanie Tray
function trayReload(){
    tray = loadTray(tray);
}

// Zamknięcie aplikacji
app.on('before-quit', () => {
    isQuitting = true;
})