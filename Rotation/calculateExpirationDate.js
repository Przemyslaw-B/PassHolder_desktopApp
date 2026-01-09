const {getRotationTime} = require("./../LocalDB/StoredCredentials/Read/GetRotationTime.js");
const {getCredentialModDate} = require("../LocalDB/StoredCredentials/Read/GetCredentialModDate.js");


async function calculateExpirationDate(db, userId, passId){
    const rotationTime =  await getRotationTime(db, userId);
    const expDateTimeStamp = await getCredentialModDate(db, userId, passId);
    if(!rotationTime || !expDateTimeStamp){
        return null;
    }

    const expDate = new Date(expDateTimeStamp);
    //console.log("expDate:", expDate);
    //Obliczenie daty wygaśnięcia
    const expirationDate = new Date(expDate);
    expirationDate.setDate(expirationDate.getDate() + rotationTime);
    return expirationDate.toISOString();
}

module.exports={calculateExpirationDate}