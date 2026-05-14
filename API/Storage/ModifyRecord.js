const axios = require('axios');
const {getToken} = require('./../../SecureStorage/tokenStorage.js');
const {getConfigData} = require('./../GetConfigData.js');


async function modifyStorageRecord(recordToModify, data) {
  if(data && data.recordId && data.url && data.login && data.password){
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
      'recordId': data.recordId,
      'url': data.url,
      'login': data.login,
      'password': data.password
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
  return { success: false, error: "dane niekompletne"};
}

module.exports = { modifyStorageRecord };