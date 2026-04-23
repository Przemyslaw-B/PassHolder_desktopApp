const {BrowserWindow,screen} = require('electron')
const path = require('path')

const pathPage = path.join(__dirname, '../../Pages/MainPage/main.html');
const setWidth = 0.7;
const setHeigh = 0.75;

function makeMainWindow(){
    const {width, height} = screen.getPrimaryDisplay().workAreaSize;
    const newWidth = width * setWidth;
    const newHeight = height * setHeigh;
    mainWindow=new BrowserWindow({
        title: "PassHolder",
        width: newWidth,
        height: newHeight,
        resizable: false,
        autoHideMenuBar: true, // Ukryj pasek narzędzi.
        icon: path.join(__dirname, '../../Icon/ikona.ico'),

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