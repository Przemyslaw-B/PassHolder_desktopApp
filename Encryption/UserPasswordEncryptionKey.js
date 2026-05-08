const crypto = require("crypto");
const {encrypt, decrypt} = require('./../Encryption/Encrypt.js');

let encryptionKey = null;

async function setUserEncryptionKey(userPassword) {
    if (!userPassword) {
        throw new Error("Brak hasła użytkownika");
    }
    encryptionKey = crypto.scryptSync(
        userPassword,
        "app-static-salt",
        32
    );
    return true;
}

async function getUserEncryptionKey() {
    if (!encryptionKey) {
        return null;
    }
    return encryptionKey;
}

module.exports = {setUserEncryptionKey,getUserEncryptionKey};