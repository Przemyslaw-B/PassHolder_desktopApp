  document.addEventListener("DOMContentLoaded", ()=>{
    const rolesContainer = document.getElementById("role-content");
    fetch("../Roles/roles.html")
      .then(res => res.text())
      .then(html => {
        rolesContainer.innerHTML = html;
        loadRoles();
      });
  });

async function loadRoles(){
  try{
    console.log("Ładowanie strony ról..");
    const data = await getRolesData();
    console.log("data:", data);
    await setRolesGUI(data);
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
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
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
    console.log("Data length: " + data.length)
    if(data != null && data.length > 0){
      const container = document.getElementById("role-list");
      container.innerHTML = ""; //Wyczyszczenie wierszy jeśli były
      const template = document.getElementById("role-row-template");
      let counter = 0;
      console.log("Role Data", data);
      for(let i=0; i<data.length; i++){
        const picked = data[i];
        console.log("data:", data[i]);
        counter++;
        const clone = template.content.cloneNode(true);
        clone.querySelector("#number-role").textContent = counter;
        clone.querySelector("#number-role").dataset.id = picked.id;
        clone.querySelector("#user-role").textContent = picked.userMail;
        clone.querySelector("#roles-role").textContent = picked.roleName;
        clone.querySelector("#admin-role").textContent = picked.adminMail;

        container.appendChild(clone);
      }
    } else{
      console.log("Brak danych do wyświetlenia..");
    }

  }