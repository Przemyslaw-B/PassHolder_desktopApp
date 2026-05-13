const axios = require('axios');
const {getToken} = require('../../SecureStorage/tokenStorage.js');
const {getConfigData} = require('../GetConfigData.js');

async function setUserRoleToDefault(userModMail) { 
  try {
    const tempUrls = await getConfigData();
    const url = tempUrls.setUserRoleToDefault;
    //console.log('Weryfikacja url:', url);
    const token = await getToken();
    //console.log("Sprawdzenie tokenu?", token);
    if(!token || token === null){
      console.log("Brak tokenu?", token);
      return { success: false, error: "brak zapisanego tokenu"};
    }
    if(!url || url===null || url === ""){
      return { success: false, error: "brak zapisanego url"};
    }
    const response = await axios.get(url, {
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

module.exports = { setUserRoleToDefault };