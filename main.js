const {app, BrowserWindow, ipcMain, Tray, Menu} = require('electron')
const {selectLanguage} = require('./Language/LanguageSelector.js')
const {getConfigData} = require('./API/GetConfigData.js')
const {encrypt,decrypt} = require('./Encryption/Encrypt.js')
const {hash} = require('./Encryption/Hash.js')
const {defaultLanguage} = require('./Language/DefaultLanguage.js')
const {runTray} = require('./Tray/RunTray.js')
const {loadTrayLanguage, setCurrentWindowForTray, trayOpenFunction} = require('./Tray/LoadTrayLanguage.js')
const {makeLoginWindow} = require('./WindowsMakers/Login/MakeLoginWindow.js')
const {makeMainWindow} = require('./WindowsMakers/Main/MakeMainWindow.js')
const {initDatabase} = require('./LocalDB/DataBaseInitialization/InitDB.js')
const {saveToken, getToken, clearToken} = require('./SecureStorage/tokenStorage.js')
const {getUserId} = require("./LocalDB/DataBaseInitialization/User/getUserId.js");
const {createNewUserIfNotExist}=require("./LocalDB/DataBaseInitialization/User/createUser.js");
const {checkChangesAndUpdate, checkLocalChangesAndUpdate} = require("./StorageParser/updateChanges.js");
const {addNewRecordToLocal} = require("./StorageParser/addNewRecordToLocal.js");
const {getAllCredentialsDetails} = require("./LocalDB/StoredCredentials/Read/GetCredentialsDetails.js");
const {removeCredential} = require("./LocalDB/StoredCredentials/Delete/RemoveCredential.js");


const path = require('path')
const fs = require('fs');
const { config } = require('process')

let loginWindow;
let mainWindow;
let currentWindow;

let tray;
const trayIconPath = path.join(__dirname, 'Icons', './tray.png');

let isLoggedIn = false; //flaga zalogowania
let isQuitting = false; // Flaga zamknięcia aplikacji

let selectedLanguage;
let languageData; 
let user;
let userId;
let db;


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

// Kolejność ładowania  
app.whenReady().then(() => {
    //disableDevTools();            //Wyłącz DevTools w aplikacji
    initDB();                       //Inicjalizacja lokalnej Bazy Danych
    selectDefaultLanguage();        //Domyślny język
    createLoginWindow();            //Otwarcie okna Logowania
    startInTray();                  //Uruchomienie Aplikacji w Tray
    trayOpenFunction();             //Otwieranie okien z paska ukrytych ikon
});

// Ustawienie języka domyślnego.
function selectDefaultLanguage(){
   selectedLanguage, languageData = defaultLanguage();
}

// Wyłącz wyłączanie aplikacji, gdy wszystkie okna są wyłączone
app.on('window-all-closed', (event) => {
  event.preventDefault(); // zatrzymuje domyślne zamknięcie
});

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
    setCurrentWindowForTray(currentWindow)
    // Jeśli aplikacja nie jest zamykana z Tray, to zamiast zamknąć aplikację schowa się na dole do tray
    mainWindow.on('close', (event) =>{
        if(!isQuitting){
            event.preventDefault();
            mainWindow.hide();
        }
    });
}



//  Załadowanie wersji językowej. (Domyślnie język systemowy (pl) lub en)
ipcMain.handle('load-language', async (event, lang) => {    
    try{
        selectedLanguage = lang;
        languageData = selectLanguage(lang);
        trayLanguageReload(); // Załaduj język do menu Tray
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
        return decrypt(password);
    }catch(error){
        console.error('Bład:', error);
        return { success: false, error: error.message };
    }
});

//Hashowanie hasła
ipcMain.handle('hash', async (event, password)=>{
    try{
        return hash(password);
    }catch(error){
        console.error('Błąd:', error);
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

// Ustaw nazwę zalogowanego użytkownika
ipcMain.on('set-user', (event, username)=>{
    if(loginWindow){
        user=username;
        userId = createNewUserIfNotExist(db, user);
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
       const storageList = await getAllCredentialsDetails(db, userId);
       return storageList;
    }catch(err){
        console.error("Błąd pobierania danych z lokalnej BD.");
        return {success: false};
    }
});

ipcMain.handle('update-storage', async (event, cloudData)=>{
    try{
        const configData = getConfigData();
        const token = await getToken();
        checkChangesAndUpdate(db, cloudData, userId, configData, token);
    } catch(err){
        console.error("Błąd aktualizacji danych haseł.", err);
        return {success: false};
    }
});

ipcMain.handle('remove-storage', async (event, data)=>{
    try{
        removeCredential(db, data);
    }catch(err){
        console.err("Błąd usuwania rekordu z lokalnej BD.");
        return {success: false}
    }
});

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


// Inicjalizacja lokalnej bazy danych
function initDB(){
    db = initDatabase();
}   

// Wywołanie aplikacji w Tray - menu ukrytych ikon
function startInTray(){
    if(tray==null){
        tray = runTray();  
        trayLanguageReload();
    }
}

// Ładowanie języka Tray
function trayLanguageReload(){
    tray = loadTrayLanguage(tray, languageData);
}

// Zamknięcie aplikacji
app.on('before-quit', () => {
    isQuitting = true;
})