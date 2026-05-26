const axios = require('axios');
const {getToken} = require('./../../SecureStorage/tokenStorage.js'); 
const {getConfigData} = require('./../GetConfigData.js');3

async function activatePhone(phone, code) {
  try {
    const tempUrls = await getConfigData();
    const url = tempUrls.activatePhone;
    const token = await getToken();
    if(!token || token === null){
      return { success: false, error: "brak zapisanego tokenu"};
    }
    if(!url || url===null || url === ""){
      return { success: false, error: "brak zapisanego url"};
    }
    const response = await axios.post(
        url,{
            "phone": phone,
            "activationKey": code
        },
        {
        headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return { success: true, data: response.data};
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { activatePhone };