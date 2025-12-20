const {getUserId} = require('./getUserId.js');
const {isUserExist} = require("./IsUserExist.js");

function createNewUserIfNotExist(db, login){
    if(!isUserExist(db, login)){
        const statement = db.prepare("INSERT OR IGNORE INTO user (username) VALUES(?);");
        statement.run(login);
    }
    id = getUserId(db, login);
    return id;
}

module.exports = {createNewUserIfNotExist}