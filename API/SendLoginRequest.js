const fs = require('fs');
const axios = require('axios');

async function sendLoginRequest(credentials) {
  try {
    const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
    const loginUrl = config.login;

    const response = await axios.post(loginUrl, {
      username: credentials.username,
      password: credentials.password
    });

    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { sendLoginRequest };