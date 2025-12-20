const {getAllCredentialsDetails} = require("./../LocalDB/StoredCredentials/Read/GetCredentialsDetails.js");
let localCredentials;
let db;

//Safe record if not exist, update record if new version on cloud
function checkChangesAndUpdate(db, cloudCredentials, userId){
    this.db=db;
    localCredentials = getAllCredentialsDetails(db, userId);
    loopOnCloudRecords(cloudCredentials);
}

function loopOnCloudRecords(cloudCredentials){
    cloudCredentials.forEach(cloudCredential =>{
        localRecord = searchForRecordInLocal(cloudCredential.id);
        if(localRecord == null){    //Record does not exist in local
            saveRecord(cloudCredential);
        } else{
            updateRecord(cloudCredential, localRecord);
        }
    });
}

//Return last modification date if record exist
function searchForRecordInLocal(cloudId){
    localCredentials.forEach(row=>{
        if(row.id_cloud===cloudId){
            return row.modification_date;
        }
    });
    return null;
}

function updateRecord(cloudRecord, localRecord){
    cloudModDate = cloudRecord.modify_date; //Read date of last modification
    localModDate - localRecord.modification_date;
    if(cloudModDate>localModDate){
        updateLocalRecord(cloudRecord, localRecord);
    } else if(localModDate>cloudModDate){
        updateCloudRecord(cloudRecord, localRecord);
    }
}



function saveRecord(cloudRow){

}

function isCloudModDateNewer(cloudDate, localDate){
    //TODO FUNCKJA POROWNUJĄCA DATY ZAPISANE JAKO TEKST
    if(cloudDate === localDate){return 0;}
    if(cloudDate>localDate){return 1;}
    return 2;
}



//Jeśli record lokalny jest nowszy od zapisanego w chmurze => prześlij rekord na serwer
function updateCloudRecord(cloudRecord, localRecord){
//TODO Weryfikacja czy opcja zapisu Online jest aktywna
}

function updateLocalRecord(){

}

module.exports={checkChangesAndUpdate}