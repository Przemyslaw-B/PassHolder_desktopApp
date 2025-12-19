const { app, BrowserWindow, ipcMain } = require('electron');
const Database = require('better-sqlite3');

function initCredentialTable(db){
    db.exec(`
        CREATE TABLE IF NOT EXISTS credentials (
            id_user INTEGER PRIMARY KEY,
            url TEXT NOT NULL,
            access_login TEXT NOT NULL, 
            access_pwd TEXT NOT NULL,
            modification_date TEXT DEFAULT (datetime('now'))
        );
        `);
}

module.exports = {initCredentialTable}