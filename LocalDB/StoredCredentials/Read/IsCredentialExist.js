function isCredentialExist(db, url){
    statement = db.prepare("SELECT COUNT(*) FROM credentials WHERE url=?");
    const sql = statement.get(url);
    if(sql>0){return true;}
    return false;
}

function isCredentialExistById(db, id){
    statement = db.prepare("SELECT COUNT(*) FROM credentials WHERE id=?");
    sql = statement.get(id);
    if(sql>0){return true;}
    return false;
}

function isCredentialExistByCloudId(db, cloudId){
    statement = db.prepare("SELECT COUNT(*) FROM credentials WHERE id_cloud=?");
    sql = statement.get(cloudId);
    if(sql>0){return true}
    return false;
}

module.exports = {isCredentialExist, isCredentialExistById, isCredentialExistByCloudId}