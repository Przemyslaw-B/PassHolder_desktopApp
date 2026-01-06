const {getAllCredentialsDetails} = require("./../LocalDB/StoredCredentials/GetCredentialsDetails.js") 


async function getAllCredentials(db, userId){
    return await getAllCredentialsDetails(db, userId);
}

module.exports={getAllCredentials}