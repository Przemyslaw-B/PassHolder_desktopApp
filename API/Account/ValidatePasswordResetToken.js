const axios = require('axios');
const {getConfigData} = require('../GetConfigData.js');3

async function validatePasswordResetToken(mail, token) {
  try {
    const tempUrls = await getConfigData();
    const url = tempUrls.restorePasswordValidateToken;

    if(!url || url===null || url === ""){
      return { success: false, error: "brak zapisanego url"};
    }

    const response = await axios.post(
        url,{
            "email": mail,
            "token": token
        });
    return { success: true, data: ""};
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { validatePasswordResetToken };