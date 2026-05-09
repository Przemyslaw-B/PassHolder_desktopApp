const {app, Menu} = require('electron')

let currentWindow;

function loadTray(tray){
    if(tray != null){
            const contextMenu = Menu.buildFromTemplate([
            { label: "Otwórz", click: () => trayOpenFunction() },   // Otwarcie ukrytego okna
            { label: "Wyjście", click: () => app.quit() },              // Zamknięcie całkowite aplikacji
            ]);
            tray.setToolTip("PassHolder");
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

module.exports = {loadTray, setCurrentWindowForTray, trayOpenFunction};