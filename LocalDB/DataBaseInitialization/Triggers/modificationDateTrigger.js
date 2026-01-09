
function initModificationDateTrigger(db){
    db.exec(`CREATE TRIGGER IF NOT EXISTS update_modification_date 
        AFTER UPDATE OF access_pwd ON credentials
        FOR EACH ROW 
        WHEN NEW.access_pwd <> OLD.access_pwd
        BEGIN 
        UPDATE credentials 
        SET modification_date = datetime('now') 
        WHERE id_user = NEW.id_user; 
        END;`);
}


module.exports = {initModificationDateTrigger}