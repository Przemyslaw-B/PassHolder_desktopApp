const {app, Menu} = require('electron')

let currentWindow;

function loadTrayLanguage(tray, languageData){
    if(tray != null && languageData != null){
            const contextMenu = Menu.buildFromTemplate([
            { label: languageData.openApp, click: () => trayOpenFunction() },   // Otwarcie ukrytego okna
            { label: languageData.exit, click: () => app.quit() },              // Zamknięcie całkowite aplikacji
            ]);
            tray.setToolTip(languageData.appName);
            tray.setContextMenu(contextMenu);
            // Obsługa podwójnego kliknięcia
            tray.on('double-click', () => {
                trayOpenFunction();
            });
        }
    return tray; 
}

// Otwieranie Aplikacji schowanej w Tray
function trayOpenFunction(){
    if(currentWindow != null){
        currentWindow.show();
    }
}

function setCurrentWindowForTray(newWindow){
    currentWindow = newWindow;
}

module.exports = {loadTrayLanguage, setCurrentWindowForTray, trayOpenFunction};