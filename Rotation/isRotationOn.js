const {getRotationTime} = require("./../LocalDB/StoredCredentials/Read/GetRotationTime.js");

async function isRotationOn(db, userId){
    const rotationTime = await getRotationTime(db, userId);

    if(!rotationTime || rotationTime === 0){
        return false;
    }
    return true;
}

module.exports = {isRotationOn}