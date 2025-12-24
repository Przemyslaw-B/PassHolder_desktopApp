function updateLocalCredentialCloudId(db, rowId, cloudId){
    const statement = "UPDATE credentials SET id_cloud=? WHERE id=?";
    db.prepare(statement).run(cloudId, rowId);
}

module.exports={updateLocalCredentialCloudId}