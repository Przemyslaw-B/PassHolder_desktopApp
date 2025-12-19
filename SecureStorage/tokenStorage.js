const keytar=require('keytar'); //Vault windowsowy

const SERVICE_NAME = 'PassHolder';  //nazwa aplikacji
const TOKEN_KEY = "userToken";      //nazwa pod którą będzie token

//zapis tokenu
async function saveToken(token){    
    await keytar.setPassword(SERVICE_NAME, TOKEN_KEY, token);
}
//odczyt tokenu
async function getToken(){  
    return await keytar.getPassword(SERVICE_NAME, TOKEN_KEY);
}

//kasowanie tokenu
async function clearToken(){
    await keytar.deletePassword(SERVICE_NAME, TOKEN_KEY);
}

module.exports = {saveToken, getToken, clearToken};
