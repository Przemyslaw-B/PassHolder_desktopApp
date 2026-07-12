const axios = require('axios');
const {getToken} = require('../../SecureStorage/tokenStorage.js'); 
const {getConfigData} = require('../GetConfigData.js');3

async function setNewAccountPassword(data) {
  try {
    const tempUrls = await getConfigData();
    const url = tempUrls.restorePasswordSaveNewPassword;

    if(!url || url===null || url === ""){
      return { success: false, error: "brak zapisanego url"};
    }
    console.log("SetNewAccountPassword data.inputs:");
    console.log("new password:",data.newPassword);
    console.log("email:",data.email);
    console.log("change token",data.passwordChangeToken);
    console.log("auth code:",data.authCode);
    console.log("------ END PRINT ------");
    const response = await axios.post(
        url,{
            "newPassword": data.newPassword,
            "email": data.email,
            "passwordChangeToken": data.passwordChangeToken,
            "authCode": data.authCode
        });
        console.log(response.data);
    return { success: true, data: response.data};
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { setNewAccountPassword };