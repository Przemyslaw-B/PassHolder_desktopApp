const isExist = require('./../Read/IsCredentialExist.js');

async function addNewCredentialToLocal(db, userId, url, login, password){
    statement = `INSERT INTO credentials (id_user, url, access_login, access_pwd) VALUES(?,?,?,?);`;
    db.prepare(statement).run(userId, url, login, password);
    return true;
}

function addNewCredentialWithExpDateModDate(db, userId, cloudId, url, login, password, expDate, modDate){
    const statement = `INSERT INTO credentials (id_user, id_cloud, url, access_login, access_pwd, exp_date, modification_date) VALUES(?,?,?,?,?,?,?);`;
    db.prepare(statement).run(userId, cloudId, url, login, password, expDate, modDate);
    return true;
}

// Możliwość dodania tylko jednych danych logowania na dany adres URL
function isUrlAlreadyInBase(db, url){
    return isExist.isCredentialExist(db, url);
}

module.exports = {addNewCredentialToLocal, addNewCredentialWithExpDateModDate}