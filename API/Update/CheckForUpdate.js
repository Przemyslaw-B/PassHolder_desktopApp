const axios = require('axios');
const {getToken} = require('../../SecureStorage/tokenStorage.js');
const {getConfigData} = require('../GetConfigData.js');

async function checkForUpdate(currentVersion) {
  try {
    const tempUrls = await getConfigData();
    const url = tempUrls.checkForUpdate;
    const token = await getToken();
    if(token === null){
      console.log("Brak tokenu?", token);
      return { success: false, error: "brak zapisanego tokenu"};
    }
    if(url===null || url === ""){
      return { success: false, error: "brak zapisanego url"};
    }
    if(!currentVersion || currentVersion === ""){
        return { success: false, error: "brak zapisanej bieżądcej wersji"};
    }
    const response = await axios.get(
      `${url}?version=${encodeURIComponent(currentVersion)}`,
      {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (response.status !== 200) {
        return { success: false, error: "Invalid response from server" };
    }
    return { success: true, data: response.data};
  } catch (error) {
    console.error("AXIOS ERROR:", error);
    return { success: false, error: error.message };
  }
}

module.exports = { checkForUpdate };