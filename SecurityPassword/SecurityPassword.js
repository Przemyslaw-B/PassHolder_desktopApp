const {encrypt, decrypt} = require('./../Encryption/Encrypt.js');

let securityPassword = null;

async function setSecurityPassword(password) {
    if(password && password !== null){
        let encryptedPass = await encrypt(password);
        if(encryptedPass && encryptedPass !== null){
            this.securityPassword = encryptedPass;
        }
    }
    return null;
}

async function getSecurityPassword() {
    if(securityPassword && securityPassword !== null){
        let decryptedPass = await decrypt(securityPassword);
        if(decryptedPass && decryptedPass !== null){
            return decryptedPassword;
        }
    }
  return null;
}

module.exports = {setSecurityPassword,getSecurityPassword};