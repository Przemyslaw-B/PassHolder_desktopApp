const axios = require('axios');
const {getToken} = require('../../SecureStorage/tokenStorage.js');
const {getConfigData} = require('../GetConfigData.js');

async function removeRoleFromUser(userModMail) { 
  try {
    const tempUrls = await getConfigData();
    const url = tempUrls.deleteRole;
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
        "user": userModMail
    },{
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

module.exports = { removeRoleFromUser };