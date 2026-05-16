  let addUserRoleFormTimeout;
  let userRoleSelected;
  let allRolesList;

  document.addEventListener("DOMContentLoaded", ()=>{
    const rolesContainer = document.getElementById("role-content");
    fetch("../Roles/roles.html")
      .then(res => res.text())
      .then(html => {
        rolesContainer.innerHTML = html;
        initNewRolesForm();
        getAllRolesList();
        setAddUserRoleSelectorOptions();
        loadRoles();
      });
  });

async function loadRoles(){
  try{
    //console.log("Ładowanie strony ról..");
    const data = await getRolesData();
    //console.log("data:", data);
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
    let result = await window.api.getAllRoles();
    if(result && result.success && result.data){
      return result.data;
    }
    return;
    /*
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
      const result = await response.json();
      return result.data.roles;
    }catch(err){
      console.error("[loadRoles] błąd:", err);
      //await window.api.logout();
    }
      */
  }

  async function setRolesGUI(data){
    //console.log("Data length: " + data.length)
    if(data && data != null && data.length > 0){
      const container = document.getElementById("role-list");
      container.innerHTML = ""; //Wyczyszczenie wierszy jeśli były
      const template = document.getElementById("role-row-template");
      let counter = 0;
      //console.log("Role Data", data);
      for(let i=0; i<data.length; i++){
        const picked = data[i];
        //console.log("data:", data[i]);
        counter++;
        const clone = template.content.cloneNode(true);
        clone.querySelector("#number-role").textContent = counter;
        clone.querySelector("#number-role").dataset.id = picked.id;
        clone.querySelector("#user-role").textContent = picked.userMail;
        clone.querySelector("#roles-role").textContent = picked.roleName;
        clone.querySelector("#admin-role").textContent = picked.adminMail;
        userRoleSelected = picked;
        container.appendChild(clone);
        let recordRoleDeleteButton = document.getElementById("delete-role-data-icon");
        recordRoleDeleteButton.addEventListener("click", async () =>{
          let result = await deleteRoleRow();
        });
        let recordEditButton = document.getElementById("edit-role-data-icon");
        recordEditButton.addEventListener("click", async () =>{
          let result = await editRoleRow();
        });
      }
    } else{
      console.log("Brak danych do wyświetlenia..");
    }
  }

  async function deleteRoleRow(){
    if(userRoleSelected){
    }
  }

  async function editRoleRow(){
    if(userRoleSelected){
    }
  }

  async function getAllRolesList(){
    let result = await window.api.getAllRolesList();
    console.log("get-all-roles result:", result);
    allRolesList = result.data;
  }

    async function setAddUserRoleSelectorOptions(){
    let roles  = allRolesList;
    if(!roles){
      await getAllRolesList();
      roles  = allRolesList;
    }
    const select = document.getElementById("add-new-user-role-selector");
    select.replaceChildren();
    const placeholder = new Option("Wybierz rolę", "", true, true);
    placeholder.disabled = true;
    placeholder.hidden = true;
    select.appendChild(placeholder);
    if(roles && roles.length>0){
      for(let role of roles){
        const option = document.createElement("option");
        option.value = role;
        option.textContent = role;
        select.appendChild(option);
      }
    }
  }

  function initNewRolesForm(){
    addUserRoleButton();
    addUserRoleCancelButton();
    addUserRoleConfirmButton();
  }

  function addUserRoleButton(){
    let addUserRoleButton = document.getElementById("add-new-user-role-button");
    addUserRoleButton.addEventListener("click", ()=>{
      let addUserRoleForm = document.getElementById("");
      showAddUserRoleForm();
      clearTimeout(addUserRoleFormTimeout);
      addUserRoleFormTimeout = setTimeout(() => {
        hideAddUserRoleForm();
      }, 60 * 1000); 
    });
  }

  function addUserRoleCancelButton(){
    let addUserRoleCancelButton = document.getElementById("add-new-user-role-cancel-button");
    addUserRoleCancelButton.addEventListener("click", ()=>{
    hideAddUserRoleForm();
    });

  }

  function addUserRoleConfirmButton(){
    let addUserRoleConfirmButton = document.getElementById("add-new-user-role-confirm-button");
    addUserRoleConfirmButton.addEventListener("click", async ()=>{
      //TODO wysłanie do api

      //TODO hideAddUserRoleForm();
    });
  }

  function showAddUserRoleForm(){
    let addUserForm = document.getElementById("add-new-user-role-form");
    let addUserRoleButton = document.getElementById("add-new-user-role-button");
    let addUserRoleSelector = document.getElementById("add-new-user-role-selector");
    let addUserRoleUserInput = document.getElementById("add-new-user-role-usermail");
    addUserRoleUserInput.value = "";
    addUserRoleSelector.value="";
    addUserRoleButton.classList.add("hidden");
    addUserForm.classList.remove("hidden");
  }

  function hideAddUserRoleForm(){
    let addUserForm = document.getElementById("add-new-user-role-form");
    let addUserRoleButton = document.getElementById("add-new-user-role-button");
    let addUserRoleSelector = document.getElementById("add-new-user-role-selector");
    let addUserRoleUserInput = document.getElementById("add-new-user-role-usermail");
    addUserRoleUserInput.value = "";
    addUserRoleSelector.value="";
    addUserForm.classList.add("hidden");
    addUserRoleButton.classList.remove("hidden");
  }