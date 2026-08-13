  let addUserRoleFormTimeout;
  let userRoleSelected;
  let allRolesList;
  let userSelectedMail = false;
  let userPickedMail;
  let userNewRole;

  document.addEventListener("DOMContentLoaded", ()=>{
    const rolesContainer = document.getElementById("role-content");
    fetch("../Roles/roles.html")
      .then(res => res.text())
      .then(async html => {
        rolesContainer.innerHTML = html;
        await getAllRolesList();
        initNewRolesForm();
        userMailSearchInit();
        hideUserSearchList();
        editModalButtonsInit();
        confirmModalButtonsInit();
        setAddUserRoleSelectorOptions();
      });
  });

async function loadRoles(){
  try{
    //console.log("Ładowanie strony ról..");
    const data = await getRolesData();
    console.log("roles data", data);
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
        clone.querySelector(".number-role").textContent = counter;
        clone.querySelector(".number-role").dataset.id = picked.id;
        clone.querySelector(".user-role").textContent = picked.userMail;
        clone.querySelector(".roles-role").textContent = picked.roleName;
        clone.querySelector(".admin-role").textContent = picked.adminMail;
        let recordRoleDeleteButton = clone.querySelector(".delete-role-data-icon");
        recordRoleDeleteButton.addEventListener("click", async () =>{
          userRoleSelected = picked;
          let result = await deleteRoleRow();
        });
        let recordEditButton = clone.querySelector(".edit-role-data-icon");
        recordEditButton.addEventListener("click", async () =>{
          userRoleSelected = picked;
          let result = await editRoleRow();
        });
        container.appendChild(clone);
      }
    } else{
      console.log("Brak danych do wyświetlenia..");
    }
  }

  async function deleteRoleRow(){
    if(userRoleSelected){
      await showConfirmModal();
    }
  }

  async function editRoleRow(){
    if(userRoleSelected){
      await userChangeRoleInit();
      await showEditModal();
    }
  }

  async function getAllRolesList(){
    let result = await window.api.getAllRolesList();
    allRolesList = result.data;
  }

  async function setUsermailSearchList(){
    const userMailInput = document.getElementById("add-new-user-role-usermail");
    const userMailVal = userMailInput.value;
    let result= await window.api.getUsermailSearchFilter(userMailVal);
    if(!result || !result.success){
      return;
    }
    let data = result.data.data;
    const resultsBox = document.getElementById("role-usermail-search-results");
    if(data && data.length>0){
      resultsBox.classList.remove("hidden");
      resultsBox.innerHTML = "";
      data.forEach(mail=>{
        const option = document.createElement("div");
        option.className = "role-usermail-option";
        option.textContent = mail;
        option.addEventListener("click", () => {
            userSelectedMail = true;
            userMailInput.value = mail;
            resultsBox.innerHTML = "";
            resultsBox.classList.add("hidden");
        });
        resultsBox.appendChild(option);
      });
    } else{
      resultsBox.classList.add("hidden");
      return;
    }
    return;
  }

function hideUserSearchList(){
    document.addEventListener("click", (e) => {
    const wrapper = document.getElementById("role-usermail-search-space");
    if(!wrapper.contains(e.target)){
      const resultsBox = document.getElementById("role-usermail-search-results");
      resultsBox.classList.add("hidden");
    }
});
}

  function userMailSearchInit(){
    const userMailInput = document.getElementById("add-new-user-role-usermail");
    const resultsBox = document.getElementById("role-usermail-search-results");
    let debounceTimer = null;
    userMailInput.addEventListener("input", async (e) => {
      userSelectedMail = false;
      const value = e.target.value.trim();
      clearTimeout(debounceTimer);
      if(value.length < 3){
        resultsBox.innerHTML = "";
        resultsBox.classList.add("hidden");
        return;
    }
    debounceTimer = setTimeout(async () => {
      try{
        setUsermailSearchList();
        }catch(err){
          console.error(err);
        }
    }, 300);
    });
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
      if(userSelectedMail === true){
        let role = document.getElementById("add-new-user-role-selector").value;
        let userMail = document.getElementById("add-new-user-role-usermail").value;
        let result = await window.api.setUserRole(userMail, role);
        console.log("zmiana uprawnień:", result);
        hideAddUserRoleForm();
        await loadRoles();
      } else {
        document.getElementById("add-new-user-role-usermail").textContent="";
        document.getElementById("add-new-user-role-usermail").value="";
      }
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

  async function showConfirmModal(){
    let modal = document.getElementById("role-confirmation-modal");
    let confirmContent = document.getElementById("role-confirmation-modal-describtion-content");
    let authCodeContent = document.getElementById("role-confirmation-modal-content-code-confirm");
    authCodeContent.classList.add("hidden");
    confirmContent.classList.remove("hidden");
    modal.classList.remove("hidden");
    let userAuthMehode = await window.api.localReadUserAuthMethode();
    let removeRoleDescribtion = document.getElementById("role-confirmation-modal-code-describtion");
    if(userAuthMehode===2){
      removeRoleDescribtion.textContent="Proszę podać kod otrzymany w sms.";
    } else if(userAuthMehode===3){
      removeRoleDescribtion.textContent="Proszę podać kod z aplikacji uwierzytelniającej.";
    } else{
      removeRoleDescribtion.textContent="Proszę podać kod otrzymany w wiadomości email.";
    }
  }

  function hideConfirmModal(){
    let modal = document.getElementById("role-confirmation-modal");
    modal.classList.add("hidden");
  }

  async function showEditModal(){
    const modal = document.getElementById("role-edit-modal");
    const modalContent = document.getElementById("role-edit-modal-content");
    const selectContent = document.getElementById("role-edit-modal-select-content");
    const editAuthContent = document.getElementById("role-edit-modal-code-content");
    modal.classList.remove("hidden");
    modalContent.classList.remove("hidden");
    selectContent.classList.remove("hidden");
    editAuthContent.classList.add("hidden");
    let codeInput = document.getElementById("role-edit-modal-code-input");
    codeInput.value="";
    let userAuthMethode = await window.api.localReadUserAuthMethode();
    let describtionContent = document.getElementById("role-edit-modal-code-describtion");
    if(userAuthMethode===2){
      describtionContent.textContent = "Proszę podać kod otrzymany w sms.";
    } else if(userAuthMethode===3){
      describtionContent.textContent = "Proszę podać kod z aplikacji uwierzytelniającej.";
    } else{
      describtionContent.textContent = "Proszę podać kod otrzymany w wiadomości email.";
    }
  }

  function hideEditModal(){
    let modal = document.getElementById("role-edit-modal");
    let selectContent = document.getElementById("role-edit-modal-select-content");
    let editAuthContent = document.getElementById("role-edit-modal-code-content");
    modal.classList.add("hidden");
    selectContent.classList.add("hidden");
    editAuthContent.classList.add("hidden");
  }

  function editModalButtonsInit(){
    let cancelButton = document.getElementById("role-edit-modal-cancel-button");
    let confirmButton = document.getElementById("role-edit-modal-confirm-button");

    let authCancelButton = document.getElementById("role-edit-modal-code-cancel-button");
    let authConfirmButton = document.getElementById("role-edit-modal-code-confirm-button");

    cancelButton.addEventListener("click", ()=>{
      userRoleSelected=null;
      hideEditModal();
    });

    confirmButton.addEventListener("click", async ()=>{
      let role = document.getElementById("user-role-change-modal").value;
      let roleChangePickContent = document.getElementById("role-edit-modal-select-content");
      let roleChangeAuthContent = document.getElementById("role-edit-modal-code-content");
      roleChangePickContent.classList.add("hidden");
      roleChangeAuthContent.classList.remove("hidden");
      userPickedMail = userRoleSelected.userMail;
      userNewRole = role;
      await window.api.requestAuthCode(); //Wyślij kod 
    });

    authCancelButton.addEventListener("click", ()=>{
      userRoleSelected=null;
      hideEditModal();
    });

    authConfirmButton.addEventListener("click", async (e)=>{
      e.stopPropagation();
      let userCodeInput = document.getElementById("role-edit-modal-code-input");
      let userCodeValue = userCodeInput.value;
      if(userCodeValue===""){
        messageContent.textContent = "Podany kod jest nieprawidłowy.";
        messageBox.classList.remove("hidden");
      } else {
        let result = await window.api.authorization(userCodeValue);
        console.log("autoryzacja?", result);
        if(result.data.auth==="success"){
          let result = await window.api.setUserRole(userPickedMail, userNewRole);
          hideEditModal();
          await loadRoles();
        } else{
          if(result.data.reason==="Blocked"){
            let message = "Zbyt wiele prób, spróbuj ponownie później.";
            showEditModalMessage(message);
          } else{
            let message = "Podany kod jest nieprawidłowy.";
            showEditModalMessage(message);
          }
        }
      }
    });
  }

  function confirmModalButtonsInit(){
    let cancelButton = document.getElementById("role-modal-account-cancel-button");
    let confirmButton = document.getElementById("role-modal-confirm-button");

    let authCodeCancelButton = document.getElementById("role-confirmation-modal-code-cancel-button");
    let authCodeConfirmButton = document.getElementById("role-confirmation-modal-code-confirm-button");

    cancelButton.addEventListener("click", ()=>{
      userRoleSelected=null;
      hideConfirmModal();
    });

    confirmButton.addEventListener("click", async ()=>{
      let confirmContent = document.getElementById("role-confirmation-modal-describtion-content");
      let authContent = document.getElementById("role-confirmation-modal-content-code-confirm");
      confirmContent.classList.add("hidden");
      authContent.classList.remove("hidden");
    });

    authCodeCancelButton.addEventListener("click", ()=>{
      userRoleSelected=null;
      hideConfirmModal();
    });

    authCodeConfirmButton.addEventListener("click", async (e)=>{
      e.stopPropagation();
      let userCodeInput = document.getElementById("role-confirmation-modal-security-code");
      let userCodeValue = userCodeInput.value;
      if(userCodeValue===""){
        messageContent.textContent = "Podany kod jest nieprawidłowy.";
        messageBox.classList.remove("hidden");
      } else {
        let result = await window.api.authorization(userCodeValue);
        console.log("autoryzacja?", result);
        if(result.data.auth==="success"){
          let role = "user";
          let userMail = userRoleSelected.userMail;
          if(role && userMail){
            let result = await window.api.setUserRole(userMail, role);
            hideConfirmModal();
            await loadRoles();
          }
        } else{
          if(result.data.reason==="Blocked"){
            let message = "Zbyt wiele prób, spróbuj ponownie później.";
            showRemoveModalMessage(message);
          } else{
            let message = "Podany kod jest nieprawidłowy.";
            showRemoveModalMessage(message);
          }
        }
      }
    });
  }

  async function userChangeRoleInit(){
    const selector = document.getElementById("user-role-change-modal");
    let userRole = await window.api.getRole();
    selector.innerHTML = "";
    if(userRole && userRole===4){
      const option = document.createElement("option");
      option.value = "master";
      option.textContent = "master";
      selector.appendChild(option);
    }
    allRolesList.forEach(role => {
      const option = document.createElement("option");
      option.value = role;
      option.textContent = role;
      if (role === userRoleSelected.roleName) {
        option.selected = true;
      }
      selector.appendChild(option);
    });
  }

  function showEditModalMessage(message){
    let messageBox = document.getElementById("role-edit-modal-message-space");
    let messageText = document.getElementById("role-edit-modal-message");
    messageText.textContent = message;
    messageBox.classList.remove("hidden");
    console.log("Pokazuje message od edit boxa");
  }

  function hideEditModalMessage(){
    let messageBox = document.getElementById("role-edit-modal-message-space");
    let messageText = document.getElementById("role-edit-modal-message");
    messageText.textContent = "";
    messageBox.classList.add("hidden");
    console.log("Ukrywam message od edit boxa");
  }

  function showRemoveModalMessage(message){
    let messageBox = document.getElementById("role-confirmation-modal-message-space");
    let messageText = document.getElementById("role-confirmation-modal-message");
    messageText.textContent = message;
    messageBox.classList.remove("hidden");
  }

  function hideRemoveModalMessage(){
    let messageBox = document.getElementById("role-confirmation-modal-message-space");
    let messageText = document.getElementById("role-confirmation-modal-message");
    messageText.textContent = "";
    messageBox.classList.add("hidden");
  }

  document.addEventListener("click", () => {
    hideEditModalMessage();
    hideRemoveModalMessage();
  });
