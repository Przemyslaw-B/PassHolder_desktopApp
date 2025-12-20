const { app, BrowserWindow, ipcMain } = require('electron');
const Database = require('better-sqlite3');

function initCredentialTable(db){
    db.exec(`
        CREATE TABLE IF NOT EXISTS credentials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_user INTEGER NOT NULL,
            id_cloud INTEGER,
            url TEXT NOT NULL,
            access_login TEXT NOT NULL, 
            access_pwd TEXT NOT NULL,
            exp_date TEXT,
            modification_date TEXT DEFAULT (datetime('now'))
        );
        `);
}

module.exports = {initCredentialTable}