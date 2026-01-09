function changeRotationTime(db, userId, newTime){
    const statement = "UPDATE user SET rotation=? WHERE id_user=?";
    db.prepare(statement).run(newTime, userId);
}

module.exports={changeRotationTime}