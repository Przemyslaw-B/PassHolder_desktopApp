const isExist = require('./../Read/IsCredentialExist.js');

function addNewCredential(db, url, login, password){
    if(isUrlAlreadyInBase){return false;}   //Blokuj możliwość dodania rekordu jeśli podany URL jest już w bazie
    statement = `INSERT INTO credentials (url, login, password) VALUES(${url}, ${login}, ${password});`;
    db.prepare(statement).run();
    return true;
}

// Możliwość dodania tylko jednych danych logowania na dany adres URL
function isUrlAlreadyInBase(db, url){
    return isExist.isCredentialExist(db, url);
}

module.exports = {addNewCredential}