const {encrypt, decrypt} = require('./../Encryption/Encrypt.js');

let securityPassword = null;
let timeout = null;

function setSecurityPassword(password) {
    if(password && password !== null){
        let encryptedPass = encrypt(password);
        if(encryptedPass && encryptedPass !== null){
            securityPassword = encryptedPass;
            //Czyszczenie hasła po 60s
            timeout=setTimeout(() => {
                clearSecurityPassword();
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

function clearSecurityPassword(){
    securityPassword = null;
    timeout=null;
}


module.exports = {setSecurityPassword,getSecurityPassword, clearSecurityPassword};