const axios = require('axios');
const {getToken} = require('../../SecureStorage/tokenStorage.js');
const {getConfigData} = require('../GetConfigData.js');


async function createNewAccount(email, name, password) {
  try {
    const tempUrls = await getConfigData();
    const url = tempUrls.creatingAccount;
    if(url===null || url === ""){
      return { success: false, error: "brak zapisanego url"};
    }
    console.log("Zakladanie konta..");
    console.log("email:", email);
    console.log("nazwa:", name);
    console.log("haslo:", password);
    const response = await axios.post(
            url, {
            'email': email,
            'name': name,
            'password': password
            });
    console.log("zakładanie konta response:", response);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("=== BŁĄD AXIOS ===");
    console.error("message:", error.message);
    console.error("code:", error.code);
    console.error("status:", error.response?.status);
    console.error("statusText:", error.response?.statusText);
    console.error("response data:", error.response?.data);
    console.error("response headers:", error.response?.headers);
    console.error("request:", error.request);
    console.error("config URL:", error.config?.url);
    console.error("config method:", error.config?.method);
    return { success: false, error: error.message };
  }
}

module.exports = { createNewAccount };