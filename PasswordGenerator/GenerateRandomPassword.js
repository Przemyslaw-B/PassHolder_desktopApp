const PASSWORD_LENGTH = 15;
const lowercase = "abcdefghijklmnopqrstuvwxyz";
const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const special = "!@#$%^&*?";

function generateRandomPassword(){
    let password = "";
    const allChars = lowercase + uppercase + special;
    for(let i=0; i< PASSWORD_LENGTH; i++){
        const random = Math.floor(Math.random() * allChars.length);
        password += allChars[random];
    }
    if(password && password.length>0){
        return {success: true, data: password};
    }
    return {success: false, error: "błąd generowania hasła"}
}

module.exports = { generateRandomPassword };