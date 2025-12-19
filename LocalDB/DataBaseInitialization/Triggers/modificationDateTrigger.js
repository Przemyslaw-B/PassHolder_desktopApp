
function initModificationDateTrigger(db){
    db.exec(`CREATE TRIGGER IF NOT EXISTS update_modification_date 
        AFTER UPDATE ON credentials 
        FOR EACH ROW 
        BEGIN 
        UPDATE credentials 
        SET modification_date = datetime('now') 
        WHERE id_user = NEW.id_user; 
        END;`);
}


module.exports = {initModificationDateTrigger}