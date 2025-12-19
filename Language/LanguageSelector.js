const path = require('path')
const fs = require('fs');

//Obsługa funkcji wyboru wersji językowej.
function selectLanguage(lang){
    try {
    const filePath = path.join(__dirname, 'Languages', `${lang}.json`);
    const rawData = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(rawData);
    return JSON.parse(JSON.stringify(parsed));
  } catch (err) {
    console.error('Błąd ładowania języka:', err);
    return {};
  }
}

module.exports = { selectLanguage };