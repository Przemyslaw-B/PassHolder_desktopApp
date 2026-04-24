
  document.addEventListener("DOMContentLoaded", ()=>{
    const logsContainer = document.getElementById("logs-content");
    fetch("../Logs/logs.html")
      .then(res => res.text())
      .then(html => {
        logsContainer.innerHTML = html;
        loadLogs();
      });
  });

  async function loadLogs(){
    try{
      console.log("Ładowanie strony logów..");
      const data = await downloadLogsData();  //Pobierz listę logów
      console.log("data:", data);
      await setLogsGUI(data);
    }catch(err){
      console.error("[loadLogs] błąd:", err);
      //await window.api.logout();
    }
  }

  async function getToken(){
    const tokenRes = await window.api.loadToken();
    const token = tokenRes.token;
    if(!tokenRes.success || token==null){
      return null;
    }
    return token;
  }

  async function downloadLogsData(){
    try{
      const responseConfig = await window.api.loadApiConfig();  //odczytanie pliku endpointów
      const config = responseConfig.config;
      const url = config.getLogs;
      //console.log("pobieranie logów - uderzenie do api url:", url);
      const token = await getToken();
      const response = await fetch(url,{
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ammountOnPage: 0,
          pageNumber: 0
        })
      });
      if(!response.ok){
        throw new Error(`Błąd API: ${response.status}`);
      }
      const data = await response.json();
      return data.logs;
    }catch(err){
      console.error("[loadLogs] błąd:", err);
      //await window.api.logout();
    } 
  }

  async function setLogsGUI(data){
    console.log("Data length: " + data.length)
    if(data != null && data.length > 0){
      const container = document.getElementById("log-list");
      container.innerHTML = ""; //Wyczyszczenie wierszy jeśli były
      const template = document.getElementById("log-row-template");
      let counter = 0;
      for(let i=0; i<data.length; i++){
        const picked = data[i];
        console.log("data:", data[i]);
        counter++;
        const clone = template.content.cloneNode(true);
        clone.querySelector("#number-log").textContent = counter;
        clone.querySelector("#number-log").dataset.id = picked.id;
        clone.querySelector("#event-log").textContent = picked.idEvent;
        clone.querySelector("#user-log").textContent = picked.userId;
        clone.querySelector("#setted-by-log").textContent = picked.settedBy;
        clone.querySelector("#record-log").textContent = picked.idRecord;
        clone.querySelector("#ip-log").textContent = picked.ip;
        clone.querySelector("#timestamp-log").textContent = picked.timestamp;
        clone.querySelector("#details-log").textContent = picked.details;

        container.appendChild(clone);
      }
    } else {
      console.log("Brak danych do wyświetlenia..");
    }
  }
