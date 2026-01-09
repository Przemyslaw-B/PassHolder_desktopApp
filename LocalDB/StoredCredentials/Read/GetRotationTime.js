function getRotationTime(db, userId){
    const statement = db.prepare("SELECT rotation FROM user WHERE id_user=?");
    const row = statement.get(userId)
    return row ? row.rotation : null;
}

module.exports={getRotationTime}