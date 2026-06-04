const {encryptWithKey,decryptWithKey} = require('./../Encryption/EncryptUserPassword.js');

function reEncryptStorage(securityPassword, newSecurityPassword, storage) {
    if (!Array.isArray(storage) || storage.length === 0 || !securityPassword || !newSecurityPassword) {
        return [];
    }
    storage.forEach(record => {
        let tempOldPass = record.password;
        let tempEncryptedPass = decryptWithKey(tempOldPass, securityPassword);
        let tempNewPass = encryptWithKey(tempEncryptedPass, newSecurityPassword);
        record.password = tempNewPass;
    });
    return storage;
}


module.exports = {reEncryptStorage};