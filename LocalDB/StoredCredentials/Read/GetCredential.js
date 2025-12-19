const {getCredentialPassword} = require('./GetCredentialPassword.js')
const {getCredentialLogin} = require('./GetCredentialLogin.js')
const {getCredentialId} = require('./GetCredentialId.js')
const {isCredentialExist} = require('./IsCredentialExist.js')

const credentialData = new Map()

function getCredential(db, url){
    clearMap();
    if(isRecordExist(db, url)){
        id = getCredentialId(db, url);
        login = getCredentialLogin(db, id);
        password = getCredentialPassword(db, id);
        saveMap(id, url, login, password);
        return credentialData;
    }
    return null;
}

function isRecordExist(db, url){
    return isCredentialExist(db, url);
}

function clearMap(){
    credentialData.clear();
}

function saveMap(id, url, login, password){
    credentialData.set("id", id);
    credentialData.set("url", url);
    credentialData.set("login", login);
    credentialData.set("password", password);
}

module.exports = { getCredential };