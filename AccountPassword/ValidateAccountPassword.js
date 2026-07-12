
function validatAccountPassword(password) {
    if(!password || password===null){
        return {success: false, data: "Brak podanego hasła"};
    } else{
        let result = checkLength(password);
        if(result && result.success===false){
            return result;
        }
        result = checkCapital(password);
        if(result && result.success===false){
            return result;
        }
        result = checkNumbers(password);
        if(result && result.success===false){
            return result;
        }
        return {success: true, data: ""};
    }
}
    
function checkLength(password){
    if(password !== null && password.length>=10){return {success: true, data: ""};}
    return {success: false, data: "Hasło musi mieć minimum 10 znaków"};
}

function checkCapital(password){
    if(password !== null){
        let capital = /\p{Lu}/u.test(password);
        if(capital===true){return {success: true, data: ""};}
    }
    return {success: false, data: "Hasło musi zawierać dużą literę"};
}

function checkNumbers(password){
    if(password !== null){
        let number = /[0-9]/.test(password);
        if(number===true){return {success: true, data: ""};}
    }
    return {success: false, data: "Hasło musi zawierać cyfrę"};
}

module.exports = { validatAccountPassword };