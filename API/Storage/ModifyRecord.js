const axios = require('axios');
const {getToken} = require('./../../SecureStorage/tokenStorage.js');
const {getConfigData} = require('./../GetConfigData.js');


async function modifyStorageRecord(recordToModify, newLogin, newPassword, newUrl) { 
  try {
    const tempUrls = await getConfigData();
    const url = tempUrls.modifyRecord;
    //console.log('Weryfikacja url:', url);
    const token = await getToken();
    //console.log("Sprawdzenie tokenu?", token);
    if(token === null){
      console.log("Brak tokenu?", token);
      return { success: false, error: "brak zapisanego tokenu"};
    }
    if(url===null || url === ""){
      return { success: false, error: "brak zapisanego url"};
    }

    const response = await axios.post(url, {
      'recordId': recordToModify,
      'login': newLogin,
      'password': newPassword,
      'url': newUrl
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

module.exports = { modifyStorageRecord };