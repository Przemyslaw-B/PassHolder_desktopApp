const {BrowserWindow} = require('electron')
const path = require('path')

const pathPage = path.join(__dirname, '../../Pages/Login/login.html');
const setWidth = 400;
const setHeigh = 600;

function makeLoginWindow(){
    loginWindow=new BrowserWindow({
            width: setWidth,
            height: setHeigh,
            resizable: false,
            autoHideMenuBar: true, // Ukryj pasek narzędzi.
            icon: path.join(__dirname, '/../../Icons/ikona.ico'),
    
            webPreferences: {
                preload: path.join(__dirname, '../../preload.js'),
                contextIsolation: true,
                nodeIntegration: false,
                sandbox: true, 
                webTools: false //Blokuj możliwość otwarcia devTools
            }
        });
        loginWindow.loadFile(pathPage);
    return loginWindow;
}

module.exports = { makeLoginWindow };