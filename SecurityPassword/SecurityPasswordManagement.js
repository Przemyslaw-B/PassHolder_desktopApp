const { read } = require('original-fs');
const {getSecurityPasswordFromApi} = require('../API/SecurityPassword/GetSecurityPasswordFromApi.js');
const {saveSecurityPasswordToApi} = require('../API/SecurityPassword/SaveSecurityPasswordToApi.js');
const {setSecurityPassword,getSecurityPassword} = require('./SecurityPassword.js');
const {setSecurityPasswordHash, getSecurityPasswordHash} = require('./SecurityPasswordHash.js');
const {encrypt, decrypt} = require('./../Encryption/Encrypt.js');
const {hash} = require('./../Encryption/Hash.js');
//const {saveSecurityPassword, getSecurityPassword} = require('./../SecureStorage/securityPasswordStorage.js');

async function getSecurityPasswordIfExist(){
    let pass = await getSecurityPasswordHash();
    if(pass && pass !== null){
        return {success: true, securityPassword: pass};
    }
    const result = await getSecurityPasswordFromApi();
    if(result.success){
        if(result.data && result.data.map.securityPassword !== null){
            const recievedPassword = result.data.map.securityPassword;
            //let decryptedPass = await decrypt(recievedPassword);
            await setSecurityPasswordHash(recievedPassword);
            return {success: true, securityPassword: recievedPassword};
        } else{
            return {success: true, securityPassword: null};
        }
    } 
    return {success: false, error: "brak hasła"};
}

async function saveNewSecurityPassword(newSecurityPassword){
    let result = await getSecurityPasswordFromApi();
    if(result && result.success && result.data && (!result.data.map.securityPassword || result.data.map.securityPassword === null)){
        //let encryptedPass = await encrypt(newSecurityPassword);
        let hashPass = await hash(newSecurityPassword);
        await saveSecurityPasswordToApi(hashPass);
        await setSecurityPassword(hashPass);
        return {success: true};
    }
    return {success: false, error: "hasło już istnieje"};
}

async function updateSecurityPasswordToNewOne(oldSecurityPassword, newSecurityPassword){
    let result = await getSecurityPasswordFromApi();
    if(result && result.success && result.data && result.data.map.securityPassword){
        let passwordInStorage = result.data.map.securityPassword; //await decrypt(result.data.map.securityPassword);
        oldSecurityPassword = await hash(oldSecurityPassword);
        if(oldSecurityPassword && newSecurityPassword){
            if(oldSecurityPassword === passwordInStorage){
                newSecurityPassword = await hash(newSecurityPassword);
                const reult = await saveSecurityPasswordToApi(newSecurityPassword);
                if(result.success){
                    await setSecurityPassword(newSecurityPassword);
                    return {success: true};
                }
                return {success: false, data: result.success};
            } else{
            return {success: false, error: "Podane hasła są różne."};
        }
        } else {
            return {success: false, error: "brak hasła na wejściu"};
        }
    } else{
        return {success: false, error: "brak zapisanego hasła"};
    }
    return {success: false, error: "brak hasła"};
}

function validateNewSecurityPassword(newSecurityPassword){
    //console.log('validateNewSecurityPassword:', newSecurityPassword);
    if(!newSecurityPassword){
        return {success: false, message: "Brak podanego hasła."}
    }
    if(newSecurityPassword.length < 7){ //długość minimalna hasła
        return {success: false, message: "Podane hasło jest zbyt krótkie."}
    }
    if(hasUpperCase(newSecurityPassword)===false){
        return {success: false, message: "Wymagana wielka litera."}
    }
     return {success: true}
}

function hasUpperCase(password){
return /\p{Lu}/u.test(password);
}

module.exports = { getSecurityPasswordIfExist, saveNewSecurityPassword, updateSecurityPasswordToNewOne, validateNewSecurityPassword };