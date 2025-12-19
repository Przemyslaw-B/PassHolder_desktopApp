function isUserExist(db, username){
    statement = `SELECT COUNT(*) FROM user WHERE username=${username}`;
    sql = db.prepare(statement).get();
    if(sql>0){return true;}
    return false;
}

module.exports = {isUserExist}