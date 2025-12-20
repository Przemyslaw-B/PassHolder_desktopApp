function getUserId(db, username){
    const statement = db.prepare("SELECT id_user FROM user WHERE username=?");
    const row = statement.get(username);
    if(row){
        return row.id_user;
    }
    return null;
}

module.exports = {getUserId}