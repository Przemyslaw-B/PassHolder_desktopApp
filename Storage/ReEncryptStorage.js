const {encryptUserPassword, decryptUserPassword, encryptWithKey, decryptWithKey} = require('./../Encryption/EncryptUserPassword.js');
const {setSecurityPassword,getSecurityPassword, clearSecurityPassword} = require('./../SecurityPassword/SecurityPassword.js');
const {setUserEncryptionKey,getUserEncryptionKey} = require('./../Encryption/UserPasswordEncryptionKey.js');

async function reEncryptStorage(securityPassword, newSecurityPassword, storage) {
    if (!Array.isArray(storage) || storage.length === 0 || !securityPassword || !newSecurityPassword) {
        return [];
    }
    for(const record of storage){
        const tempOldPass = record.password;
        clearSecurityPassword();
        setSecurityPassword(securityPassword);
        //let key = await getUserEncryptionKey();
        let result = await decryptUserPassword(tempOldPass);
        const tempDecryptedPass = result.data;
        clearSecurityPassword(); 
        setSecurityPassword(newSecurityPassword);
        const tempEncryptedPass = await encryptUserPassword(tempDecryptedPass);
        record.password = tempEncryptedPass;
    }
    return storage;
}

module.exports = {reEncryptStorage};