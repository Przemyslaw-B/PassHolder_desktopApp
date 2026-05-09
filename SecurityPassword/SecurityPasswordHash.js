const {encrypt, decrypt} = require('./../Encryption/Encrypt.js');


let securityPasswordHash=null;

function getSecurityPasswordHash(){
    if(securityPasswordHash){
        let temp = decrypt(securityPasswordHash);
        if(temp){
            return temp;
        }
    }
    return null;
}

function setSecurityPasswordHash(input){
    if(input){
        let  securityPasswordHash = encrypt(input);
    }
}

module.exports = {setSecurityPasswordHash, getSecurityPasswordHash};