const axios = require('axios');
const {getToken} = require('../../../SecureStorage/tokenStorage.js');
const {getConfigData} = require('../../GetConfigData.js');


async function sendLoginRequest(email, password) {
  try {
    const tempUrls = await getConfigData();
    const url = tempUrls.loginValidation;
    //const token = await getToken();
    /*
    if(token === null){
      console.log("Brak tokenu?", token);
      return { success: false, error: "brak zapisanego tokenu"};
    }
    */
   
    if(url===null || url === ""){
      return { success: false, error: "brak zapisanego url"};
    }

    const response = await axios.post(url, {
      "username": email,
      "password": password
    });

    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { sendLoginRequest };