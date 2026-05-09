const {encrypt, decrypt} = require('./../Encryption/Encrypt.js');

let securityPassword = null;

function setSecurityPassword(password) {
    if(password && password !== null){
        let encryptedPass = encrypt(password);
        if(encryptedPass && encryptedPass !== null){
            securityPassword = encryptedPass;
            //Czyszczenie hasła po 60s
            setTimeout(() => {
                securityPassword = null;
            }, 60 * 1000);
        }
    }
    return null;
}

function getSecurityPassword() {
    if(securityPassword && securityPassword !== null){
        let decryptedPass = decrypt(securityPassword);
        if(decryptedPass && decryptedPass !== null){
            return decryptedPass;
        }
    }
  return null;
}


module.exports = {setSecurityPassword,getSecurityPassword};