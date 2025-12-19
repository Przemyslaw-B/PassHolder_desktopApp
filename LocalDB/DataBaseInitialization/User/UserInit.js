const isUserExist = require('./IsUserExist.js');

function initUserInDataBase(db, username){
    if(isUserAlreadyInDataBase(db, username)){
        return false;
    }
    statement = `INSERT INTO user (username) VALUES(${username});`;
    db.prepare(statement).run();
    return true;
}

function isUserAlreadyInDataBase(db, username){
    return isUserExist(db, username);
}

module.exports = {initUserInDataBase}