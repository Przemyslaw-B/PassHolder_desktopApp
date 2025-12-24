async function getApiUrl(config){
    const url = config.uploadNewRecord;
    return url;
}

function toIso(date){
    return new Date(date).toISOString;
}

async function sendLocalRecordOnCloud(record, token, config){
    try{
        const url = await getApiUrl(config);
        const modDate = record.modification_date;
        const expDate = record.exp_date;
        record.modification_date = toIso(modDate);
        record.exp_date = toIso(expDate);
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(record)
        });
        const data = await response.json();
        return data.id_cloud;
        
    } catch(error){
        console.error("Błąd wysyłania rekordu:", error);
        throw error;
    }
}

module.exports={sendLocalRecordOnCloud};