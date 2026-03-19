const { app, BrowserWindow, ipcMain } = require('electron');
const Database = require('better-sqlite3');
const path = require('path');
const userTable = require('./Tables/UserTable');
const credentialsTable = require('./Tables/CredentialsTable');
const initModificationDateTrigger = require('./Triggers/modificationDateTrigger');
let db;

function initDatabase(){
    const dbPath = path.join(app.getPath('userData'), 'passholderdata.db');
    db = new Database(dbPath);
    initTables();
    //initTriggers();
    return db;
}

function initTables(){
   initUserTable();
   //initCredentialsTable();
}

function initUserTable(){
    userTable.userTableInit(db);
}

function initCredentialsTable(){
    credentialsTable.initCredentialTable(db);
}

function initTriggers(){
    initModificationDateTrigger.initModificationDateTrigger(db)
}

module.exports = {initDatabase}