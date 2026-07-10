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

    const response = await axios.post(
        url,{
            "password": data.password,
            "passwordChangeToken": data.passwordChangeToken,
            "authCode": data.authCode
        });
    return { success: true, data: response.data};
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { setNewAccountPassword };