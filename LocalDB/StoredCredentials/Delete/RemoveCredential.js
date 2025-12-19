const isExist = require('./../Read/IsCredentialExist.js');

function removeCredential(db, id){
    if(isRecordInDataBase(db, id)){
        sql = `DELETE FROM credentials WHERE id=${id}`;
        db.prepare(sql).run();
        return true;
    }
    return false;
}

function isRecordInDataBase(db, id){
    return isExist.isCredentialExistById(db, id);
}
module.exports = {removeCredential}