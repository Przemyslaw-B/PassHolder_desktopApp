const axios = require('axios');
const {getToken} = require('../../../SecureStorage/tokenStorage.js');
const {getConfigData} = require('../../GetConfigData.js');


async function authenticateUser(email, authCode) {
  try {
    const tempUrls = await getConfigData();
    const url = tempUrls.authentication;
    //const token = await getToken();
    //console.log("token:", token);
    //if(token === null){
    //  console.log("Brak tokenu?", token);
    //  return { success: false, error: "brak zapisanego tokenu"};
    //}
    if(url===null || url === ""){
      return { success: false, error: "brak zapisanego url"};
    }

    const response = await axios.post(
            url, {
            'email': email,
            'authKey': authCode
            },
            {
            //headers: {
           // Authorization: `Bearer ${token}`
          //}
        });
    return { success: true, data: response.data };
  } catch (error) {
    //console.error("AUTH ERROR FULL:", error);
    //console.error("RESPONSE DATA:", error.response?.data);
    //console.error("STATUS:", error.response?.status);
    return { success: false, error: error.message };
  }
}

module.exports = { authenticateUser };