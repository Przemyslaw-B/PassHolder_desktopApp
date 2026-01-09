function getCredentialModDate(db, userId, passId){
    const statement = db.prepare("SELECT modification_date FROM credentials WHERE id=? AND id_user=?");
    const row = statement.get(passId, userId);
    return row ? row.modification_date : null;
}

module.exports={getCredentialModDate}