const {app} = require('electron')
const {selectLanguage} = require('./LanguageSelector.js')

function defaultLanguage(){
    const systemLocale = app.getLocale();   //odczytanie języka systemowego
    switch(systemLocale){
        case "pl":
            selectedLanguage = "pl"
            break

        default: 
            selectedLanguage = "en";  
    }
    languageData = selectLanguage(selectedLanguage);
    return selectedLanguage, languageData;
}

module.exports = { defaultLanguage };