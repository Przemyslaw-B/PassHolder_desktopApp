  document.addEventListener("DOMContentLoaded", ()=>{
    const logsContainer = document.getElementById("logs-content");
    fetch("../Roles/roles.html")
      .then(res => res.text())
      .then(html => {
        logsContainer.innerHTML = html;
        loadLogs();

      });
  });

async function loadRoles(){
  try{
    //const data = await downloadData();
    console.log("Ładowanie strony ról..");
    //await setStorageGUI(data);
  }catch(err){
    console.error("[loadRoles] błąd:", err);
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

  async function getRolesData(){
    try{
      const responseConfig = await window.api.loadApiConfig();
      const config = responseConfig.config;
      const url = config.getRoles;
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
          pageNumber: 0,
          type
        })
      });
      if(!response.ok){
        throw new Error(`Błąd API: ${response.status}`);
      }
      const data = await response.json();
      return data.roles;
    }catch(err){
      console.error("[loadRoles] błąd:", err);
      //await window.api.logout();
    }
  }

  async function setRolesGUI(data){
    if(data != null && data.length > 0){
      const container = document.getElementById("log-list");
      container.innerHTML = ""; //Wyczyszczenie wierszy jeśli były
      const template = document.getElementById("role-row-template");
      let counter = 0;
      for(let i=0; i<data.length; i++){
        const picked = data[i];
        console.log("data:", data[i]);
        counter++;
        const clone = template.content.cloneNode(true);
        clone.querySelector("#number").textContent = counter;
        clone.querySelector("#number").dataset.id = picked.id;
        clone.querySelector("#user").textContent = picked.userId;
        clone.querySelector("#role").textContent = picked.role;

        container.appendChild(clone);
      }
    } else{
      console.log("Brak danych do wyświetlenia..");
    }

  }