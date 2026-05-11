const axios = require('axios');
const {getToken} = require('./../../SecureStorage/tokenStorage.js'); 
const {getConfigData} = require('./../GetConfigData.js');

async function getUserPhoneNumber() {
  try {
    const tempUrls = await getConfigData();
    const url = tempUrls.getUserPhoneNumber;
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
    const tempNumber = anonimate(response.data.methode);
    return { success: true, data: tempNumber};
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function anonimate(number){
    if(number){
        const visible = number.slice(-3);
        const hidden = "*".repeat(number.length-3);
        return hidden + visible;
    }
    return null;
}   

module.exports = { getUserAuthMethode };