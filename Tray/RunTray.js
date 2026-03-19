const {app, Tray} = require('electron')
const path = require('path')
const trayIconPath = path.join(__dirname, '..', 'Icon', './ikona.ico');

function runTray(){
    tray = new Tray(trayIconPath); // Utworzenie nowego
    return tray;
}

module.exports = { runTray };