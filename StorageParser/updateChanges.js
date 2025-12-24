const { addNewCredentialWithExpDateModDate } = require("../LocalDB/StoredCredentials/Create/AddNewCredential.js");
const { getToken } = require("../SecureStorage/tokenStorage.js");
const {getAllCredentialsDetails} = require("./../LocalDB/StoredCredentials/Read/GetCredentialsDetails.js");
const {getCredentialByCloudId} = require("./../LocalDB/StoredCredentials/Read/GetCredential.js");
const {isCredentialExistByCloudIdAndUserId}=require("./../LocalDB/StoredCredentials/Read/IsCredentialExist.js");
const {sendLocalRecordOnCloud} = require("./sendLocalRecordOnCloud.js");
const {updateLocalCredentialCloudId}=require("./../LocalDB/StoredCredentials/Update/UpdateCredentialCloudId.js");
let localCredentials;
let db;
let idUser;
let config;
let token;

//Save record if not exist, update record if new version on cloud
async function checkChangesAndUpdate(database, cloudCredentials, userId, configData, tokenMain){
    db=database;
    idUser = userId;
    config=configData;
    token=tokenMain;
    localCredentials = getAllCredentialsDetails(db, idUser);
    loopOnCloudRecords(cloudCredentials);
    loopOnLocalRecords(localCredentials);
}

async function checkLocalChangesAndUpdate(database, userId, configData, tokenMain){
    db=database;
    idUser = userId;
    config=configData;
    token=tokenMain;
    localCredentials = getAllCredentialsDetails(database, userId);
    await loopOnLocalRecords(localCredentials);
}

function loopOnCloudRecords(cloudCredentials){
    cloudCredentials.forEach(cloudCredential =>{
        const localRecord = searchForRecordInLocal(cloudCredential.id);
        if(localRecord == null){    //Record does not exist in local
            saveRecordToLocal(cloudCredential);
        } else{
            // updateRecord(cloudCredential, localRecord);
        }
    });
}

async function loopOnLocalRecords(localCredentials){
    for (const localCredential of localCredentials){
        if(localCredential.id_cloud==null){
            const idCloud = await sendToCloud(localCredential);
            const idRow = localCredential.id;
            updateLocalCredentialCloudId(db, idRow, idCloud);
        }
    };
}

function sendToCloud(localCredential){
    const idCloud = sendLocalRecordOnCloud(localCredential, token, config);
    return idCloud
}

//Return last modification date if record exist
function searchForRecordInLocal(cloudId){
    //TODO zamienić pętlę forEach na zapytanie do bazy isExist
    let isExist = isCredentialExistByCloudIdAndUserId(db, idUser, cloudId);
    if(isExist){
        let row = getCredentialByCloudId(db, idUser, cloudId);
        return row;
    }
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



function saveRecordToLocal(cloudCredential){
    const userId = idUser;
    const cloudId = cloudCredential.id
    const url = cloudCredential.url;
    const login = cloudCredential.login;
    const password = cloudCredential.password;
    const expDate = cloudCredential.expDate;
    const modDate = cloudCredential.modDate;
    const res = addNewCredentialWithExpDateModDate(db, userId, cloudId, url, login, password, expDate, modDate); 
    console.log("Dodany nowy record do bazy Lokalnej?:", res);
}

function saveRecordToCloud(localRow){

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

module.exports={checkChangesAndUpdate, checkLocalChangesAndUpdate}