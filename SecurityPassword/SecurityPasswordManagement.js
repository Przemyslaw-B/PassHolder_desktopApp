const { read } = require('original-fs');
const {getSecurityPasswordFromApi} = require('./../API/GetSecurityPasswordFromApi.js');
const {saveSecurityPasswordToApi} = require('./../API/SaveSecurityPasswordToApi.js');
const {setSecurityPassword,getSecurityPassword} = require('./SecurityPassword.js');
const {encrypt, decrypt} = require('./../Encryption/Encrypt.js');
//const {saveSecurityPassword, getSecurityPassword} = require('./../SecureStorage/securityPasswordStorage.js');

async function getSecurityPasswordIfExist(){
    let pass = await getSecurityPassword();
    if(pass && pass !== null){
        return {success: true, securityPassword: pass};
    }
    const result = await getSecurityPasswordFromApi();
    if(result.success){
        if(result.data && result.data.map.securityPassword !== null){
            const recievedPassword = result.data.map.securityPassword;
            let decryptedPass = await decrypt(recievedPassword);
            await setSecurityPassword(decryptedPass);
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
        let encryptedPass = await encrypt(newSecurityPassword);
        await saveSecurityPasswordToApi(encryptedPass);
        await setSecurityPassword(newSecurityPassword);
        return {success: true};
    }
    return {success: false, error: "hasło już istnieje"};
}

async function updateSecurityPasswordToNewOne(oldSecurityPassword, newSecurityPassword){
    let result = await getSecurityPasswordFromApi();
    if(result && result.success && result.data && result.data.map.securityPassword){
        let passwordInStorage = await decrypt(result.data.map.securityPassword);
        if(oldSecurityPassword && newSecurityPassword){
            if(oldSecurityPassword === passwordInStorage){
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