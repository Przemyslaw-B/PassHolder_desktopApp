function isCredentialExist(db, url){
    statement = `SELECT COUNT(*) FROM credentials WHERE url=${url}`;
    sql = db.prepare(statement).get();
    if(sql>0){return true;}
    return false;
}

function isCredentialExistById(db, id){
    statement = `SELECT COUNT(*) FROM credentials WHERE id=${id}`;
    sql = db.prepare(statement).get();
    if(sql>0){return true;}
    return false;
}

module.exports = {isCredentialExist, isCredentialExistById}