//const fs = require('fs');
const axios = require('axios');
const {getToken} = require('./../SecureStorage/tokenStorage.js');
const {getConfigData} = require('./GetConfigData.js');

async function saveSecurityPasswordToApi(newSecurityPassword) {
    if(newSecurityPassword===null || newSecurityPassword === ""){
        return { success: false, error: "brak nowego hasła"};
    }
  try {
    const tempUrls = await getConfigData();
    const url = tempUrls.setSecurityPassword;
    const token = await getToken();
    if(token === null){
      return { success: false, error: "brak zapisanego tokenu"};
    }
    if(url===null || url === ""){
      return { success: false, error: "brak zapisanego url"};
    }
    const response = await axios.post(
        url, {
        'newSecurityPassword': newSecurityPassword
        },
        {
        headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return { success: true};
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { saveSecurityPasswordToApi };