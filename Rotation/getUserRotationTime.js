const {getRotationTime} = require("../LocalDB/StoredCredentials/Read/GetRotationTime.js");

async function getUserRotationTime(db, userId) {
    return await getRotationTime(db, userId);
}

module.exports={getUserRotationTime}