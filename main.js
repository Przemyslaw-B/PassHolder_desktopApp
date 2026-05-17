const {app, BrowserWindow, ipcMain, Tray, Menu} = require('electron');
const { config } = require('process');
const { ServerResponse } = require('http');

//const path = require('path')
//const fs = require('fs');
//const {selectLanguage} = require('./Language/LanguageSelector.js');
//const {defaultLanguage} = require('./Language/DefaultLanguage.js');
//const {initDatabase} = require('./LocalDB/DataBaseInitialization/InitDB.js');
//const {getUserId} = require("./LocalDB/DataBaseInitialization/User/getUserId.js");
//const {createNewUserIfNotExist}=require("./LocalDB/DataBaseInitialization/User/createUser.js");
//const {checkChangesAndUpdate, checkLocalChangesAndUpdate} = require("./StorageParser/updateChanges.js");
//const {addNewRecordToLocal} = require("./StorageParser/addNewRecordToLocal.js");
//const {getAllCredentialsDetails} = require("./LocalDB/StoredCredentials/Read/GetCredentialsDetails.js");
//const {removeCredential} = require("./LocalDB/StoredCredentials/Delete/RemoveCredential.js");
//const {changeRotationTime} = require("./Rotation/changeRotationTime.js");
//const {checkIfExpired} = require("./Rotation/checkIfExpired.js");
//const {calculateExpirationDate} = require("./Rotation/calculateExpirationDate.js");
//const {isRotationOn} = require("./Rotation/isRotationOn.js");
//const {getUserRotationTime} = require("./Rotation/getUserRotationTime.js");
//const {saveSecurityPassword, getSecurityPassword, clearSecurityPassword} = require('./SecureStorage/securityPasswordStorage.js');

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

const {runTray} = require('./Tray/RunTray.js');

const {loadTray, setCurrentWindowForTray, trayOpenFunction} = require('./Tray/LoadTrayLanguage.js');
const {makeLoginWindow} = require('./WindowsMakers/Login/MakeLoginWindow.js');
const {makeMainWindow} = require('./WindowsMakers/Main/MakeMainWindow.js');


const {saveToken, getToken, clearToken} = require('./SecureStorage/tokenStorage.js');

const {encryptUserPassword, decryptUserPassword} = require('./Encryption/EncryptUserPassword.js');

const {getSecurityPasswordIfExist, saveNewSecurityPassword, updateSecurityPasswordToNewOne, validateNewSecurityPassword} = require('./SecurityPassword/SecurityPasswordManagement.js');
const {setSecurityPassword,getSecurityPassword} = require('./SecurityPassword/SecurityPassword.js');
const {setUserEncryptionKey,getUserEncryptionKey} = require('./Encryption/UserPasswordEncryptionKey.js');

const {getUserAuthMethode} = require("./API/AuthMethodes/GetUserAuthMethode.js");
const {getAllAuthMethodes} = require("./API/AuthMethodes/GetAllAuthMethodes.js");

const {getUsermailFilterData} = require('./API/Roles/GetUsermailFilterData.js');
const {setUserRoleToDefault} = require('./API/Roles/setUserRoleToDefault.js');
const {getRolesData} = require('./API/Roles/GetRolesData.js');
const {getAllRolesList} = require('./API/Roles/GetAllRolesList.js');

const {getLogFiltersData} = require('./API/Logs/GetLogFiltersData.js');
const {getLogsData} = require('./API/Logs/GetLogsData.js');

const appName="PassHolder";

let loginWindow;
let mainWindow;
let currentWindow;

let tray;
//const trayIconPath = path.join(__dirname, 'Icons', './tray.png');
//let main_icon = { width: 1200, height: 800, icon: path.join(__dirname, 'Icons', './ikona.ico')};
let securityPassword;
let isLoggedIn = false; //flaga zalogowania
let isQuitting = false; // Flaga zamknięcia aplikacji

//let selectedLanguage;
//let languageData; 
let user;
let userId;
//let db;

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
    //initDB();                       //Inicjalizacja lokalnej Bazy Danych
    //selectDefaultLanguage();        //Domyślny język
    //clearSecurityPassword();        //Usuń zapisane Security Password
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

/*
// Ustawienie języka domyślnego.
function selectDefaultLanguage(){
   selectedLanguage, languageData = defaultLanguage();
}
   */

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

/*
//  Załadowanie wersji językowej. (Domyślnie język systemowy (pl) lub en)
ipcMain.handle('load-language', async (event, lang) => {    
    try{
        selectedLanguage = lang;
        //languageData = selectLanguage(lang);
        trayReload(); // Załaduj język do menu Tray
        return { success: true, data: languageData };
    }catch (error) {
    console.error('Błąd:', error);
    return { success: false, error: error.message };
  }
});

//Zwróć używaną paczkę językową
ipcMain.handle('get-language-pack', async(event)=>{
    try{
        return languageData;
    }catch (error) {
    console.error('Błąd:', error);
    return { success: false, error: error.message };
  }
});
*/

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
        return {success: true, data: result.data}
    }catch(error){
        console.error('Błąd logowania:', error);
        return { success: false, error: error.message };
    }
});

//Wyślij otrzymany kod autoryzacyjny
ipcMain.handle('send-authentication-code', async (event, authCode) =>{
    try{
        if(authCode){
            let result = await authenticateUser(authCode);
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

//zmień rolę użytkownika z wyższej na usera
ipcMain.on('set-user-role-to-default', async (event, userModMail)=>{
    let message;
    if(userModMail && userModMail !== null){
        return await setUserRoleToDefault(userModMail);
    }
    message = "nie podano użytkownika";
    return {success: false, message: message}
});

//Zmień rolę użytkownika
ipcMain.on('set-user-role', async (event, userModMail, roleName)=>{
    let message;
    if(userModMail && userModMail !== null && roleName && roleName !== null){

    }
    message = "nie podano użytkownika lub roli";
    return {success: false, message: message}
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
            if(result && result.success && result.data){
                return {success: true, data: result.data};
            }
            return {success: false, error: "nie można pobrać danych"};
        }
        return {success: false, error: "niekompletne dane"};
    }catch(error){
        console.error("błąd pobierania danych logów", error);
    }
});

/*
ipcMain.handle('update-storage', async (event, cloudData)=>{
    try{
        const configData = getConfigData();
        const token = await getToken();
        checkChangesAndUpdate(db, cloudData, userId, configData, token);
    } catch(err){
        console.error("Błąd aktualizacji danych haseł storage.", err);
        return {success: false};
    }
});
*/

/*
ipcMain.handle('remove-storage', async (event, data)=>{
    try{
        removeCredential(db, data);
    }catch(err){
        console.err("Błąd usuwania rekordu ze storage.");
        return {success: false}
    }
});
*/

/*
ipcMain.handle('save-local-storage', async (event, data)=>{
    try{
        const configData = getConfigData();     
        const token = await getToken();
        await addNewRecordToLocal(db, userId, data);
        await checkLocalChangesAndUpdate(db, userId, configData, token);
        return {success: true};
    }catch(err){
        console.error("Błąd zapisu do lokalnej DB", err)
        return {success: false};
    }
});
*/

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
        //await saveSecurityPassword(securityPassword);
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

ipcMain.handle('user-password-encryption-key', async (event, userPassword)=>{
    try{
        console.log("user-password-encryption-key userPassword:", userPassword);
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

ipcMain.handle('validateNewSecurityPassword', (event, newSecurityPassword)=>{
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

/*
ipcMain.handle('clear-security-password', async ()=>{
    try{
        await clearSecurityPassword();
        return {success: true};
    } catch(err){
        console.error("Błąd kasowania tokenu:", err);
        return {success: false};
    }
});
*/

ipcMain.handle('get-user-auth-methode', async ()=>{
    try{
        let result = await getUserAuthMethode();
        return result;
    } catch(err){
        console.error("Błąd odczytu metody autoryzacji użytkownika", err);
        return {success: false, error: err};
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

/*
// czy rotacja jest włączona
ipcMain.handle('is-rotation-on', async ()=>{
    const isOn = await isRotationOn(db, userId);
    return isOn;
});
*/

/*
// Pobierz aktualną wartość rotation time
ipcMain.handle('get-rotation-time', async ()=>{
    const val = await getUserRotationTime(db, userId);
    return val;
});
*/

/*
// pobierz datę wygaśnięcia hasła
ipcMain.handle('get-expiration-date', async (event, idPass)=>{
    const calculatedDate = await calculateExpirationDate(db, userId, idPass);
    return calculatedDate;
});
*/

/*
// aktualizacja ilości dni wygasania haseł
ipcMain.handle('update-rotation-time', async (event, newTime)=>{
    changeRotationTime(db, userId, newTime);
});
*/

/*
// Sprawdź czy hasło wygasło
ipcMain.handle('is-password-expired', async (event, idPass)=>{
    const isExpiretd = await checkIfExpired(db, userId, idPass);
    return isExpiretd
});
*/

// Inicjalizacja lokalnej bazy danych
/*
function initDB(){
    db = initDatabase();
}  
*/ 

// Wywołanie aplikacji w Tray - menu ukrytych ikon
function startInTray(){
    if(tray==null){
        tray = runTray();  
        trayReload();
    }
}

// Ładowanie języka Tray
function trayReload(){
    tray = loadTray(tray);
}

// Zamknięcie aplikacji
app.on('before-quit', () => {
    isQuitting = true;
})