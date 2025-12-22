function isCredentialExist(db, url){
    statement = db.prepare("SELECT COUNT(*) AS count FROM credentials WHERE url=?");
    const sql = statement.get(url);
    if(sql.count>0){return true;}
    return false;
}

function isCredentialExistById(db, id){
    statement = db.prepare("SELECT COUNT(*) AS count FROM credentials WHERE id=?");
    sql = statement.get(id);
    if(sql.count>0){return true;}
    return false;
}

function isCredentialExistByCloudId(db, cloudId){
    statement = db.prepare("SELECT COUNT(*) AS count FROM credentials WHERE id_cloud=?");
    sql = statement.get(cloudId);
    if(sql.count>0){return true}
    return false;
}

function isCredentialExistByCloudIdAndUserId(db, userId, cloudId){
    statement = db.prepare("SELECT COUNT(*) AS count FROM credentials WHERE id_cloud=? AND id_user=?");
    sql = statement.get(cloudId, userId);
    if(sql.count>0){return true}
    return false;
}

module.exports = {isCredentialExist, isCredentialExistById, isCredentialExistByCloudId, isCredentialExistByCloudIdAndUserId}