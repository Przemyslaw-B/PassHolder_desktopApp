const {addNewCredentialToLocal} = require("./../LocalDB/StoredCredentials/Create/AddNewCredential.js");

async function addNewRecordToLocal(db, idUser, data){
    const url = data.url;
    const login = data.login
    const password = data.password;
    await addNewCredentialToLocal(db, idUser, url, login, password);
}

module.exports={addNewRecordToLocal}