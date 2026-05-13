const axios = require('axios');
const {getToken} = require('../../SecureStorage/tokenStorage.js');
const {getConfigData} = require('../GetConfigData.js');


async function createNewAccount(email, name, password) {
  try {
    const tempUrls = await getConfigData();
    const url = tempUrls.creatingAccount;
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

    const response = await axios.post(
            url, {
            'email': email,
            'name': name,
            'password': password
            });

    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { createNewAccount };