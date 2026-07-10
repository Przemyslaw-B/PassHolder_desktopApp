const axios = require('axios');
const {getConfigData} = require('../GetConfigData.js');3

async function sendAccountPasswordResetRequest(mail) {
  try {
    const tempUrls = await getConfigData();
    const url = tempUrls.restorePassword;

    if(!url || url===null || url === ""){
      return { success: false, error: "brak zapisanego url"};
    }

    const response = await axios.post(
        url,{
            "email": mail,
        });
    return { success: true, data: ""};
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { sendAccountPasswordResetRequest };