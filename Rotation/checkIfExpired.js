const {getRotationTime} = require("./../LocalDB/StoredCredentials/Read/GetRotationTime.js");
const {getCredentialModDate} = require("../LocalDB/StoredCredentials/Read/GetCredentialModDate.js");

async function checkIfExpired(db, userId, idPass){
    const rotationTime = await getRotationTime(db, userId);
    const expDateTimeStamp = await getCredentialModDate(db, userId, idPass)
    if(!rotationTime || !expDateTimeStamp){  //Sprawdź czy są dane
        return false;
    }
    const expDate = new Date(expDateTimeStamp);
    const today = new Date();
    
    expDate.setDate(expDate.getDate() + rotationTime);
    if(today>=expDate){
        return true;
    }
    return false;
}


module.exports={checkIfExpired}