const axios = require('axios');
const {getToken} = require('../../SecureStorage/tokenStorage.js');
const {getConfigData} = require('../GetConfigData.js');

async function getLogsData(filtersData) {
  try {
    console.log("GetLogsData filtry:", filtersData);
    const tempUrls = await getConfigData();
    const url = tempUrls.getLogs;
    const token = await getToken();
    if(token === null){
      console.log("Brak tokenu?", token);
      return { success: false, error: "brak zapisanego tokenu"};
    }
    if(url===null || url === ""){
      return { success: false, error: "brak zapisanego url"};
    }

    const response = await axios.post(url,{
        'pageNumber': filtersData.pageNumber,
        'pageSize': filtersData.pageSize,
        'typeName': filtersData.typeFilter,
        'adminMail': filtersData.adminMail,
        'fromDate': filtersData.fromDate,
        'toDate': filtersData.toDate
      },
      {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return { success: true, data: response.data.logs};
  } catch (error) {
    console.error("AXIOS ERROR:", error);
    return { success: false, error: error.message };
  }
}

module.exports = { getLogsData };