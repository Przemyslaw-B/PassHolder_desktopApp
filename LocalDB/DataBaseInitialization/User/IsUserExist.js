function isUserExist(db, username){
    const statement = db.prepare("SELECT COUNT(*) FROM user WHERE username=?");
    const row = statement.get(username);
    if(row.count>0){return true;}
    return false;
}

module.exports = {isUserExist}