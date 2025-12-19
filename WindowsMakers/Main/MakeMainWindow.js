const {BrowserWindow} = require('electron')
const path = require('path')

const pathPage = path.join(__dirname, '../../Pages/MainPage/main.html');
const setWidth = 800;
const setHeigh = 600;

function makeMainWindow(){
    mainWindow=new BrowserWindow({
            width: setWidth,
            heigh: setHeigh,
            resizable: false,
            autoHideMenuBar: true, // Ukryj pasek narzędzi.
    
            webPreferences: {
                preload: path.join(__dirname, '../../preload.js'),
                contextIsolation: true,
                nodeIntegration: false,
                sandbox: true, 
                webTools: false //Blokuj możliwość otwarcia devTools
            }
        });
        mainWindow.loadFile(pathPage);
    return mainWindow;
}

module.exports = { makeMainWindow };