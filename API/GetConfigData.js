const path = require('path')
const fs = require('fs');

// Wczytaj Configurację endpointów API z pliku
function getConfigData(){
    try {
        const filePath = path.join(__dirname, '', 'ApiConfig.json');
        const rawData = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(rawData);
        return JSON.parse(JSON.stringify(parsed));
      } catch (err) {
        console.error('Błąd ładowania configuracji:', err);
        return {};
      }
}

module.exports = { getConfigData };