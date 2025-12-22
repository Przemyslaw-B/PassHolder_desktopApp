const isExist = require('./../Read/IsCredentialExist.js');

function addNewCredential(db, userId, cloudId, url, login, password){
    if(isUrlAlreadyInBase){return false;}   //Blokuj możliwość dodania rekordu jeśli podany URL jest już w bazie
    statement = `INSERT INTO credentials (url, login, password) VALUES(${url}, ${login}, ${password});`;
    db.prepare(statement).run();
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

module.exports = {addNewCredentialWithExpDateModDate}