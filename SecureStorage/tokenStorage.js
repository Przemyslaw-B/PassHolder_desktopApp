const keytar=require('keytar'); //Vault windowsowy
const {encrypt, decrypt} = require("./../Encryption/Encrypt");

const SERVICE_NAME = 'PassHolder';  //nazwa aplikacji
const TOKEN_KEY = "userToken";      //nazwa pod którą będzie token

//zapis tokenu
async function saveToken(token){   
    const token_enc = encrypt(token);
    await keytar.setPassword(SERVICE_NAME, TOKEN_KEY, token_enc);
}
//odczyt tokenu
async function getToken(){
    const token_enc = await keytar.getPassword(SERVICE_NAME, TOKEN_KEY);
    const token = decrypt(token_enc);
    return token
}

//kasowanie tokenu
async function clearToken(){
    await keytar.deletePassword(SERVICE_NAME, TOKEN_KEY);
}

module.exports = {saveToken, getToken, clearToken};
