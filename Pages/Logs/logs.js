  let logTypeFilter = "";
  let logUserFilter = "";
  let logSettedByFilter = "";

  let typeFilterValue = "";
  let userFilterValue = "";
  let ipFilterValue = "";
  let responsibleAdminValue = "";
  let dateFromValue = "";
  let dateToValue = "";

  let logFilterData;

  let pageNumber=1;
  let rowAmount=20
  let lastPage=false;

  document.addEventListener("DOMContentLoaded", ()=>{
    const logsContainer = document.getElementById("logs-content");
    fetch("../Logs/logs.html")
      .then(res => res.text())
      .then(async html => {
        logsContainer.innerHTML = html;
        await getFiltersData();
        initFiltersSelector();
        initFilterResetButtons();
        resetFilters();
        //userMailSugetion();
      });
  });

  function initFiltersSelector(){
    const selectType = document.getElementById("logs-type-selector");
    const typeResetWrapper = document.getElementById("type-logs-reset-icon");

    //const selectUser = document.getElementById("logs-user-selector");
    //const userResetWrapper = document.getElementById("user-logs-reset-icon");

    const selectSettedBy = document.getElementById("logs-settedBy-selector");
    const settedByResetWrapper = document.getElementById("settedBy-logs-reset-icon");

    const selectFromDate = document.getElementById("dateFrom-log");

    const selectToDate = document.getElementById("dateTo-log");

    const ipInput = document.getElementById("logs-ip-input");

    const rowsPerPageSelector = document.getElementById("rows-per-page");

    selectType.addEventListener('change', async () =>{
      pageNumber=1;
      logTypeFilter = selectType.value;
      typeFilterValue = selectType.value;
      if(logTypeFilter && logTypeFilter !== ""){ 
        typeResetWrapper.classList.add('active-filter');
        selectType.classList.remove('active-filter-placeholder');
        await reloadLogList();
      } else{
        typeResetWrapper.classList.remove('active-filter');
        selectType.classList.add('active-filter-placeholder');
      }
    });

    selectSettedBy.addEventListener('change', async () =>{
      pageNumber=1;
      logSettedByFilter = selectSettedBy.value;
      responsibleAdminValue = selectSettedBy.value;
      if(logSettedByFilter && logSettedByFilter !== ""){
        settedByResetWrapper.classList.add('active-filter');
        selectSettedBy.classList.remove('active-filter-placeholder');
        await reloadLogList();
      } else{
        settedByResetWrapper.classList.remove('active-filter');
        selectSettedBy.classList.add('active-filter-placeholder');
      }
    });

    ipInput.addEventListener("input", async ()=>{
      const ipInput = document.getElementById("logs-ip-input");
      let inputIpValue = ipInput.value;
      pageNumber=1;
      await reloadLogList();
    })

    selectFromDate.addEventListener('change', async ()=>{
      dateFromValue = selectFromDate.value;
      pageNumber=1;
      await reloadLogList();
    });

    selectToDate.addEventListener('change', async ()=>{
      dateToValue = selectToDate.value;
      pageNumber=1;
      await reloadLogList();
    });

    rowsPerPageSelector.addEventListener('change', async()=>{
      rowsAmountSelector = document.getElementById("rows-per-page");
      rowAmount = Number(rowsAmountSelector.value);
      if(!rowAmount || rowAmount <20){
        rowAmount=20;
      }
      pageNumber=1;
      await reloadLogList();
    });

    const prevPageButton = document.getElementById("prev-page");
    const nextPageButton = document.getElementById("next-page");

    prevPageButton.addEventListener("click", async()=>{
      if(pageNumber && pageNumber>1){
        pageNumber=pageNumber-1;
        await reloadLogList();
      }
    });

    nextPageButton.addEventListener("click", async()=>{
      if(lastPage === false){
        pageNumber=pageNumber+1;
        await reloadLogList();
      }
    });
  } 

  function initFilterResetButtons(){
    const typeLogFilterResetButton = document.getElementById("type-logs-reset-icon");
    //const userLogFilterResetButton = document.getElementById("user-logs-reset-icon");
    const settedByFilterResetButton = document.getElementById("settedBy-logs-reset-icon");
  
    typeLogFilterResetButton.addEventListener('click', ()=>{
      //console.log("Przyciski aktywny");
      const typeFilterSelector = document.getElementById("logs-type-selector");
      typeFilterSelector.value = "";
      typeLogFilterResetButton.classList.remove('active-filter');
      typeFilterSelector.classList.add('active-filter-placeholder');
      typeFilterValue = "";
      reloadLogList();
    });

    settedByFilterResetButton.addEventListener('click', ()=>{
      //console.log("Przyciski aktywny");
      const settedByFilterSelector = document.getElementById("logs-settedBy-selector");
      settedByFilterSelector.value="";
      settedByFilterResetButton.classList.remove('active-filter');
      settedByFilterSelector.classList.add('active-filter-placeholder');
      responsibleAdminValue = "";
      reloadLogList();
    });
  }

  async function loadLogs(){  
    try{
      //console.log("Ładowanie strony logów..");
      logFilterData = await getFiltersData();
      //console.log("Filters data: ", logFilterData);
      setTypeFiltersOptions();
      setResponsibleAdministratorOptions();
      const data = await downloadLogsData();  //Pobierz listę logów
      await setLogsGUI(data);
    }catch(err){
      console.error("[loadLogs] błąd:", err);
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
    let result = await window.api.getLogFiltersData();
    if(result && result.success && result.data){
      return result.data;
    }
  }

  async function downloadLogsData(){
    let typeFilter = document.getElementById("logs-type-selector").value || undefined;
    let ipFilter = document.getElementById("logs-ip-input").value || undefined;
    const ipFilterInput = document.getElementById("logs-ip-input");
    const ipFilterVal = ipFilterInput.value;
    console.log("ipFilterValue,", ipFilterVal);
    let settedByFilter = document.getElementById("logs-settedBy-selector").value || undefined;
    let fromDateFilter = document.getElementById("dateFrom-log").value || undefined;
    let toDateFilter = document.getElementById("dateTo-log").value || undefined;
    let pageNumberFilter = 0;
    let pageSizeFilter = 0;
    if(!rowAmount || rowAmount<20){rowAmount=20;}
    if(!pageNumber || pageNumber<1){pageNumber=1;}

    let filtersData = {
      "pageNumber": pageNumberFilter,
      "pageSize": pageSizeFilter,
      "typeFilter": typeFilter,
      "adminMail": settedByFilter,
      "ip": ipFilter,
      "fromDate": fromDateFilter,
      "toDate": toDateFilter,
      "pageNumber": pageNumber,
      "rowAmount": rowAmount
    };
    let result = await window.api.getLogsData(filtersData);
    if(result){
      lastPage=result.lastPage;
    }
    if(result && result.lastPage===true){
      const nextPageButton = document.getElementById("next-page");
      nextPageButton.classList.remove("page-icon-on");
      nextPageButton.classList.add("page-icon-off");
    } else{
      const nextPageButton = document.getElementById("next-page");
      nextPageButton.classList.remove("page-icon-off");
      nextPageButton.classList.add("page-icon-on");
    }

    if(pageNumber===1){
      const prevPageButton = document.getElementById("prev-page");
      prevPageButton.classList.remove("page-icon-on");
      prevPageButton.classList.add("page-icon-off");
    } else{
      const prevPageButton = document.getElementById("prev-page");
      prevPageButton.classList.remove("page-icon-off");
      prevPageButton.classList.add("page-icon-on");
    }

    if(result && result.success && result.data){
      if(result.data.pageNumber && result.data.pageNumber!==pageNumber){
        pageNumber=result.data.pageNumber;
      }
      return result.data;
    }
  }

  async function setLogsGUI(data){
    //console.log("Data length: " + data.length)
    //Wyczyszczenie wierszy jeśli były
    //console.log("setLogsGUI data:", data);
    const container = document.getElementById("log-list");
    container.innerHTML = "";
    if(data != null && data.length > 0){
      const template = document.getElementById("log-row-template");
      let counter = pageNumber*rowAmount-rowAmount;
      for(let i=0; i<data.length; i++){
        const picked = data[i];
        ~//console.log("data:", data[i]);
        counter++;
        const clone = template.content.cloneNode(true);
        clone.querySelector("#number-log").textContent = counter;
        clone.querySelector("#number-log").dataset.id = picked.id;
        clone.querySelector("#event-log").textContent = picked.eventName;
        clone.querySelector("#user-log").textContent = picked.userName;
        clone.querySelector("#setted-by-log").textContent = picked.settedBy;
        //clone.querySelector("#record-log").textContent = picked.idRecord;
        clone.querySelector("#ip-log").textContent = picked.ip;
        clone.querySelector("#day-log").textContent = getDayFromTimestamp(picked.timestamp);
        clone.querySelector("#time-log").textContent = getTimeFromTimestamp(picked.timestamp);
        clone.querySelector("#details-log").textContent = picked.details;

        container.appendChild(clone);
      }
    } else {
      console.log("Brak danych do wyświetlenia..");
    }
    const pageInfo = document.getElementById("page-info");
    pageInfo.textContent = pageNumber;
  }

  function getDayFromTimestamp(stamp){
    if(!stamp){
      return "";
    }
    const date = new Date(stamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  function getTimeFromTimestamp(stamp){
    if(!stamp){
      return "";
    }
    const date = new Date(stamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  function setTypeFiltersOptions(){
    const events = logFilterData.events;
    const select = document.getElementById("logs-type-selector");
    select.replaceChildren();
    const placeholder = new Option("Wybierz zdarzenie", "", true, true);
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
    //console.log("admins", admins);
    const select = document.getElementById("logs-settedBy-selector");
    select.replaceChildren();
    const placeholder = new Option("Wybierz administratora", "", true, true);
    placeholder.disabled = true;
    placeholder.hidden = true;
    select.appendChild(placeholder);
    if(admins && admins.length>0){
      for(let admin of admins){
        const option = document.createElement("option");
        option.value = admin;
        option.textContent = admin;
        select.appendChild(option);
        //console.log("dodaję admina: ", admin);
      }
    }
  }

  function resetFilters(){
    typeFilterValue = "";
    userFilterValue = "";
    ipFilterValue = "";
    responsibleAdminValue = "";
    dateFromValue = "";
    dateToValue = "";
    pageNumber=1;
  }

  /*
  function userMailSugetion(){
  //wyszukiwanie usera - sugestie
  new TomSelect("#logs-user-select", {
      valueField: "email",
      labelField: "email",
      searchField: "email",
      maxOptions: 10,
      load: async function(query, callback) {
          console.log("sugestia!");
          if (query.length < 3) return callback();
          const token = await getToken()
          console.log("sugestia dla tokenu", token);
          fetch(`${apiUrlConfig.getUsersMailFilterContent}?search=${query}`,{
            method: "GET",
            headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json"
              }
          })
          .then(response => response.json())
          .then(data => {
            callback(data.emails); // [{email: "..."}]
          })
          .catch(() => callback());
      }
  });
  }
  */

  async function reloadLogList(){
    //console.log("resetuję listę logów..");
    const data = await downloadLogsData();
    await setLogsGUI(data);
  }

  async function reloadFilterContent(){

  }

  function defaultSettingInit(){

  }
