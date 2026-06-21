const {BrowserWindow,screen} = require('electron')
const path = require('path')

const pathPage = path.join(__dirname, '../../Pages/Login/login.html');
const setWidth = 0.23;
const setHeigh = 0.65;

function makeLoginWindow(){
    const {width, height} = screen.getPrimaryDisplay().workAreaSize;
    
    console.log("parametry ekranu..");
    const display = screen.getPrimaryDisplay();
    const scale = display.scaleFactor;

    const newWidth = Math.round((width * setWidth));
    const newHeight = Math.round((height * setHeigh));

    const workAreaSize = display.workAreaSize;
    //console.log(display.scaleFactor);
    //console.log(display.workAreaSize);
    //console.log("szerokosc okna:", newWidth);
    //console.log("wysokosc okna:", newHeight);

    loginWindow=new BrowserWindow({
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
    loginWindow.loadFile(pathPage);
    return loginWindow;
}

module.exports = { makeLoginWindow };