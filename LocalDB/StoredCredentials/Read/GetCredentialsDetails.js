
function getAllCredentialsDetails(db, userId){
    const statement = db.prepare("SELECT * FROM credentials WHERE id_user=?");
    const rows = statement.all(userId);
    return rows;
}

module.exports = {getAllCredentialsDetails}