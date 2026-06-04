const axios = require('axios');
const {getToken} = require('./../../SecureStorage/tokenStorage.js');
const {getConfigData} = require('./../GetConfigData.js');


async function removeSecurityPassword(code) { 
  try {
    const tempUrls = await getConfigData();
    const url = tempUrls.removeSecurityPassword;
    const token = await getToken();
    if(token === null){
      console.log("Brak tokenu?", token);
      return { success: false, error: "brak zapisanego tokenu"};
    }
    if(url===null || url === ""){
      return { success: false, error: "brak zapisanego url"};
    }

    const response = await axios.post(url, {
      'code': code
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return { success: true, data: response.data};
  } catch (error) {
    console.error("AXIOS ERROR:", error);
    return { success: false, error: error.message };
  }
}

module.exports = { removeSecurityPassword };