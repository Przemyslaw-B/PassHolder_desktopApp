const axios = require('axios');
const {getToken} = require('./../SecureStorage/tokenStorage.js');
const {getConfigData} = require('./GetConfigData.js');

async function getSecurityPasswordFromApi() {
  try {
    const tempUrls = await getConfigData();
    const url = tempUrls.getSecurityPassword;
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
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    //console.log("mapa z api?", response.data.map);
    //console.log("hasło bezpieczeństwa z api?", response.data.map.securityPassword);
    return { success: true, data: response.data};
  } catch (error) {
    console.error("AXIOS ERROR:", error);
    return { success: false, error: error.message };
  }
}

module.exports = { getSecurityPasswordFromApi };