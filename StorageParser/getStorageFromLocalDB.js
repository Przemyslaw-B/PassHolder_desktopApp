const {getAllCredentialsDetails} = require=("./../LocalDB/StoredCredentials/GetCredentialsDetails.js") 


function getAllCredentials(db, userId){
    return getAllCredentialsDetails(db, userId);
}