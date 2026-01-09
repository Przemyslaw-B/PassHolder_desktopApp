const { app, BrowserWindow, ipcMain } = require('electron');
const Database = require('better-sqlite3');

function userTableInit(db){
    db.exec(`
        CREATE TABLE IF NOT EXISTS user (
            id_user INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            access_pwd TEXT,
            rotation INTEGER DEFAULT 0
        );
        `);
}

module.exports = {userTableInit}