const axios = require('axios');
const {getToken} = require('./../../SecureStorage/tokenStorage.js'); 
const {getConfigData} = require('./../GetConfigData.js');

async function getUserAuthMethode() {
  try {
    const tempUrls = await getConfigData();
    const url = tempUrls.getUserAuthenticationMethode;
    const token = await getToken();
    if(!token || token === null){
      return { success: false, error: "brak zapisanego tokenu"};
    }
    if(!url || url===null || url === ""){
      return { success: false, error: "brak zapisanego url"};
    }
    const response = await axios.get(
        url,
        {
        headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return { success: true, data: response.data.methode};
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { getUserAuthMethode };