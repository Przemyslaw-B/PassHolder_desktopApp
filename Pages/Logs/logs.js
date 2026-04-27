  let logTypeFilter = "";
  let logUserFilter = "";
  let logSettedByFilter = "";

  let loglterData;


  document.addEventListener("DOMContentLoaded", ()=>{
    const logsContainer = document.getElementById("logs-content");
    fetch("../Logs/logs.html")
      .then(res => res.text())
      .then(html => {
        logsContainer.innerHTML = html;
        initFiltersSelector();
        initFilterResetButtons();
        loadLogs();
      });
  });


  function initFiltersSelector(){
    const selectType = document.getElementById("logs-type-selector");
    const typeResetWrapper = document.getElementById("type-logs-reset-icon");

    const selectUser = document.getElementById("logs-user-selector");
    const userResetWrapper = document.getElementById("user-logs-reset-icon");

    const selectSettedBy = document.getElementById("logs-settedBy-selector");
    const settedByResetWrapper = document.getElementById("settedBy-logs-reset-icon");

    selectType.addEventListener('change', () =>{
      logTypeFilter = selectType.value;
      if(logTypeFilter && logTypeFilter !== ""){ 
        typeResetWrapper.classList.add('active-filter');
        selectType.classList.remove('active-filter-placeholder');
      } else{
        typeResetWrapper.classList.remove('active-filter');
        selectType.classList.add('active-filter-placeholder');
      }
    });

    selectUser.addEventListener('change', () =>{
      logUserFilter = selectUser.value;
      if(logUserFilter && logUserFilter !== ""){
        userResetWrapper.classList.add('active-filter');
        selectUser.classList.remove('active-filter-placeholder');
      } else{
        userResetWrapper.classList.remove('active-filter');
        selectUser.classList.add('active-filter-placeholder');
      }
    });

    selectSettedBy.addEventListener('change', () =>{
      logSettedByFilter = selectSettedBy.value;
      if(logSettedByFilter && logSettedByFilter !== ""){
        settedByResetWrapper.classList.add('active-filter');
        selectSettedBy.classList.remove('active-filter-placeholder');
      } else{
        settedByResetWrapper.classList.remove('active-filter');
        selectSettedBy.classList.add('active-filter-placeholder');
      }
    });
  } 

  function initFilterResetButtons(){
    const typeLogFilterResetButton = document.getElementById("type-logs-reset-icon");
    const userLogFilterResetButton = document.getElementById("user-logs-reset-icon");
    const settedByFilterResetButton = document.getElementById("settedBy-logs-reset-icon");
  
    typeLogFilterResetButton.addEventListener('click', ()=>{
      const typeFilterSelector = document.getElementById("logs-type-selector");
      typeFilterSelector.value = "";
      typeLogFilterResetButton.classList.remove('active-filter');
      typeFilterSelector.classList.add('active-filter-placeholder');
    });

    userLogFilterResetButton.addEventListener('click', ()=>{
      const userFilterSelector = document.getElementById("logs-user-selector");
      userFilterSelector.value="";
      userLogFilterResetButton.classList.remove('active-filter');
      userFilterSelector.classList.add('active-filter-placeholder');
    });

    settedByFilterResetButton.addEventListener('click', ()=>{
      const settedByFilterSelector = document.getElementById("logs-settedBy-selector");
      settedByFilterSelector.value="";
      settedByFilterResetButton.classList.remove('active-filter');
      settedByFilterSelector.classList.add('active-filter-placeholder');
    });
  }

  async function loadLogs(){
    try{
      //console.log("Ładowanie strony logów..");
      logFilterData = await getFiltersData();
      console.log("Filters data: ", logFilterData);
      setTypeFiltersOptions();
      setResponsibleAdministratorOptions();
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

  async function getFiltersData(){
    try{
      const responseConfig = await window.api.loadApiConfig();
      const config = responseConfig.config;
      const url = config.getFiltersData;
      const token = await getToken();
      if (!token) {
        throw new Error("Brak tokenu");
      }
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if(!response.ok){
        throw new Error(`Błąd API: ${response.status}`);
      }
      const data = await response.json();
      console.log("data filters:", data);
      return data;
    }catch(err){
      console.error("[loadFiltersData] błąd:", err);
    } 
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
          typeName: "",
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
    //console.log("Data length: " + data.length)
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

  function setTypeFiltersOptions(){
    const events = logFilterData.events;
    const select = document.getElementById("logs-type-selector");
    select.replaceChildren();
    const placeholder = new Option("Select type", "", true, true);
    placeholder.disabled = true;
    placeholder.hidden = true;
    select.appendChild(placeholder);
    if(events && events.length>0){
      for(let event of events){
        const option = document.createElement("option");
        option.value = event.name;
        option.textContent = event.name;
        select.appendChild(option);
      }
    }
  }

  function setResponsibleAdministratorOptions(){
    const admins = logFilterData.administrators;  
    console.log("admins", admins);
    const select = document.getElementById("logs-settedBy-selector");
    select.replaceChildren();
    const placeholder = new Option("Select administrator", "", true, true);
    placeholder.disabled = true;
    placeholder.hidden = true;
    select.appendChild(placeholder);
    if(admins && admins.length>0){
      for(let admin of admins){
        const option = document.createElement("option");
        option.value = admin;
        option.textContent = admin;
        select.appendChild(option);
        console.log("dodaję admina: ", admin);
      }
    }
  }
