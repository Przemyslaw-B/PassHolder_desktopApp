const keytar=require('keytar'); //Vault windowsowy
const {encrypt, decrypt} = require("./../Encryption/Encrypt");

const SERVICE_NAME = 'PassHolder';  //nazwa aplikacji
const SECURITY_PASSWORD = "SecurityPassword";      //nazwa pod którą będzie token

//zapis hasła
async function saveSecurityPassword(securityPassword){   
    const password_enc = encrypt(securityPassword);
    await keytar.setPassword(SERVICE_NAME, SECURITY_PASSWORD, password_enc);
}
//odczyt hasła
async function getSecurityPassword(){
    const password_enc = await keytar.getPassword(SERVICE_NAME, SECURITY_PASSWORD);
    const password = decrypt(password_enc);
    return password;
}

//kasowanie zapisanego hasła
async function clearSecurityPassword(){
    await keytar.deletePassword(SERVICE_NAME, SECURITY_PASSWORD);
}

module.exports = {saveSecurityPassword, getSecurityPassword, clearSecurityPassword};
