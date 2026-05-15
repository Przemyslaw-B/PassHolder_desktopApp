let formInitialized = false;
let pickedId;
let pickedRecordData = null;
let selectedRecord = null;
let recordToDelete = null
let recordToModify = null;
let menuOpen = false;

let pickedPass=null;
let pickedPassVal=null;
let pickedPassEye=null;

let tempSecPass=null;

function initAddRecordFormOnce() { 
  if (formInitialized) {
    return; 
  }
  formInitialized = true; 
  initAddRecordForm(); 
}

document.addEventListener("DOMContentLoaded", () => {
  const storageContainer = document.getElementById("storage-content");
  // pobierz treść z html i wstaw do kontenera
  fetch("../Storage/storage.html")
    .then(res => res.text())
    .then(html => {
      storageContainer.innerHTML = html;
      initAddRecordFormOnce();
      securityPasswordModal();
      userPasswordSecurityModalButtons();
      randomPasswordGenerateButtonInit();

      //closingMenuByClick();
      initMenuActions(); 
      initGlobalMenuClose();
      //closeGlobalMenu();

      confirmDeleting();
      cancelDeleting();
      confirmModify();
      cancelModifyModal();

      loadStorage();
    });
});

async function isSecurityPasswordSet(){
  const response = await window.api.isSecurityPasswordSet();
  if(response && response === true){
    return response;
  }
  return false;
}

async function setSecurityPassword(newSecurityPassword){
  const isPasswordAlreadySet = await isSecurityPasswordSet();
  if(isPasswordAlreadySet === false && newSecurityPassword){
    const response = await window.api.setNewSecurityPassword(newSecurityPassword);
  }
}

function securityPasswordModal(){
  let message = "";
  const securityPasswordModalConfirmButton = document.getElementById("confirm-security-password-button");
  document.getElementById("add-security-password-modal-password-input").value="";
  document.getElementById("add-security-password-modal-password-input-repeat").value="";
  securityPasswordModalConfirmButton.addEventListener("click", async (e) => {
    const securityPassword = document.getElementById("add-security-password-modal-password-input").value;
    const securityPasswordRepeat = document.getElementById("add-security-password-modal-password-input-repeat").value;
    //console.log('securityPassword.value', securityPassword);
    //console.log('securityPasswordRepeat.value', securityPasswordRepeat);
    if((securityPassword === null || securityPassword === "")&& (securityPasswordRepeat === null || securityPasswordRepeat === "")){
      message = "Oba pola muszą zostać wypełnione."
    }
    if(securityPassword === securityPasswordRepeat){
      const result = await window.api.validateNewSecurityPassword(securityPassword);
      //console.log('validateNewSecurityPassword:', result);
      if(result.success === true){
        const res = await window.api.setNewSecurityPassword(securityPassword);
        //console.log('saveSecurityPassword:', res);
        loadStorage();
      } else{
        message = result.message;
      }
    } else{
      message = "Podane hasła muszą być identyczne."
    }
    //console.log('securityModalMessage:', message);
    //TODO wyśietlenie komunikatu
  });
}

function showSecurityPasswordModal(){
  const securityPasswordModal = document.getElementById("security-password-modal");
  securityPasswordModal.classList.remove("hidden");
  const addNewRecordButton = document.getElementById("storage-header");
  addNewRecordButton.classList.add("hidden");
}

function hideSecurityPasswordModal(){
  const securityPasswordModal = document.getElementById("security-password-modal");
  securityPasswordModal.classList.add("hidden");
  const addNewRecordButton = document.getElementById("storage-header");
  addNewRecordButton.classList.remove("hidden");
}

async function loadStorage(){
  try{
    const isSecurityPassword = await isSecurityPasswordSet();
    //console.log('loadStorage - isSecurityPassword:', isSecurityPassword);
    if(!isSecurityPassword){  //brak ustawionego hasła bezpieczeństwa
      showSecurityPasswordModal();
    } else{
      if(isSecurityPasswordRequired){
        showUserPasswordSecurityModal();
      }
      hideSecurityPasswordModal();
      const data = await downloadData();
      //console.log(data);
      await setStorageGUI(data);
    }
  }catch(err){
    console.error("[loadStorage] błąd:", err);
    //await window.api.logout();
  }
  }

async function downloadData(){
  let result = await window.api.getStorage();
  if(result.success){
    return result.data;
  } else{
    console.log("error: ", result.error);
  }
  
  /*
   try{
    // Odczytanie endpointów
    const responseConfig = await window.api.loadApiConfig();
    const config = responseConfig.config;
    const url = config.storage; 

    const tokenRes = await window.api.loadToken();
    const token = tokenRes.token;
    if(!tokenRes.success || token==null){
      //console.log("Brak tokenu użytkownik nie jest zalogowany");
      console.error("Brak tokenu użytkownik nie jest zalogowany");
      return null;
    }
    
    //Zapytanie do API
    const response = await fetch(url,{
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    if (!response.ok){
      throw new Error(`Błąd API: ${response.status}`);
    }
    const data = await response.json();
    return data.storage;
} catch(err){
    console.error("[loadStorage] błąd:", err);
    await window.api.logout();
  }
    */
}

async function setStorageGUI(data){
  //console.log("Data length: " + data.length)
  if (data != null || data.length > 0){
    const container = document.getElementById("storage-list");
    const template = document.getElementById("storage-row-template");
    container.innerHTML = ""; //Wyczyszczenie poprzednich wierszy w celu uniknięcia powielania po kolejnynm otwarciu
    counter =0;
    for(let i =0; i<data.length; i++){
    const picked = data[i];
    counter = counter+1;
    const clone = template.content.cloneNode(true);
      clone.querySelector("#number").textContent = counter;
      clone.querySelector("#dots-menu").dataset.id = picked.id
      clone.querySelector("#url").textContent = picked.url;
      const urlListener = clone.querySelector("#url");
      urlListener.addEventListener("click", ()=>{
        navigator.clipboard.writeText(picked.url);
      });
      clone.querySelector("#login").textContent = picked.login;
      const loginListener = clone.querySelector("#login");
      loginListener.addEventListener("click", ()=>{
        navigator.clipboard.writeText(picked.login);
      });
      clone.querySelector("#password").textContent = "••••••";
      const pwdListener = clone.querySelector("#password");
      pwdListener.addEventListener("click", async ()=>{
        if(passField.classList.contains("show-password")){
          let tempPass = clone.querySelector("#password").value;
          navigator.clipboard.writeText(tempPass);//await decryptPassword(picked.password)
        }
      });
      //clone.querySelector("#remove-record").textContent="✕";
      //clone.querySelector("#dots-menu").textContent="⋮";
      //optionBtn.insertAdjacentText("afterbegin", "⋮");
      
      /*
      const optionBtn = clone.querySelector("#dots-menu");
      optionBtn.dataset.id=picked.id;
      optionBtn.dataset.id_cloud=picked.id;
      optionBtn.addEventListener("click", (e)=>{
        e.stopPropagation();
        //Najpierw zamknąć inne menu jeśli były otwarte
        const row = optionBtn.closest(".storage-row");
        const menu = row.querySelector(".options-menu");
        const isOpen = !menu.classList.contains("hidden");
        document.querySelectorAll(".options-menu").forEach(menu => {
          menu.classList.add("hidden");
        });
        if (!isOpen) {
          menu.classList.remove("hidden");
        }
        selectedRecord = picked.id;
      });
      */
      
      //const menu = clone.querySelector(".options-menu");

      //MENU
      const dotsBtn = clone.querySelector("#dots-menu");
      //const globalMenu = document.querySelector(".options-menu");
      dotsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        pickedRecordData = picked;
        //console.log("picked?: ", picked);
        //console.log("pickedRecordData?: ", pickedRecordData);
        showOptionsMenu(e, picked.id);
      });

      //const editButton = globalMenu.querySelector(".edit-btn");
      //const deleteButton = globalMenu.querySelector(".delete-btn");
      /*
      editButton.onclick = () => {
        recordToModify = selectedRecord;
        showModifyModal(picked.url, picked.login, picked.rotation);
      };
      */
      /*
      deleteButton.onclick = () => {
        recordToDelete = selectedRecord;
        showDeletingPopUp();
      };
      */

      //container.appendChild(clone);

      /*
      menu.addEventListener("click", e => e.stopPropagation());
      const editButton = menu.querySelector(".edit-btn");
      editButton.addEventListener("click", async (e)=>{
        //Menu edycji rekordu
        recordToModify = selectedRecord;
        showModifyModal(picked.url, picked.login, picked.rotation);
      })
        */
       /*
      const deleteButton = menu.querySelector(".delete-btn");
      deleteButton.addEventListener("click", async (e)=>{
        //Zatwierdzenie usuwania
        recordToDelete=selectedRecord;
        showDeletingPopUp();
      })
        */
      const eye = clone.querySelector("#toggle-eye");
      const passField=clone.querySelector("#password");
      //passField.classList.add("show-password");
      //eye.textContent = "👁️";
      eye.classList.toggle("toggle-eye-visible");
      eye.addEventListener("click", async ()=>{
        pickedPassEye = eye;
        if(passField.classList.contains("show-password")){
          passField.classList.remove("show-password");
          eye.classList.toggle("toggle-eye-visible");
          passField.textContent = "••••••";
        } else{
          let isSecPassRequired = await isSecurityPasswordRequired();
          pickedPass = passField;
          pickedPassVal = picked.password;
          await showPassword();
          //showUserPasswordSecurityModal();
        }
        /*
      if(passField.classList.contains("show-password")){
        passField.classList.remove("show-password");
        eye.classList.toggle("toggle-eye-visible");
        passField.textContent = "••••••";
      } else{
        passField.classList.add("show-password");
        eye.classList.toggle("toggle-eye-visible");
        passField.textContent = await decryptPassword(picked.password);
      }
        */
      });
      //ExpirationDate
      
      /*
      const isRotation = await isRotationEnabled(picked.rotation);
      const expDateField = clone.querySelector("#exp-date");
      if(isRotation){ //jeśli rotacja włączona
        const isExpired = await isPassExpired(picked.modDate, picked.rotation);
        if(isExpired){  //jeśli hasło nieaktualne
          expDateField.textContent = "Expired";
          expDateField.classList.remove("not-expired")
          expDateField.classList.add("expired");
        }else{
          //Hasło aktualne - pokaż datę 
          clone.querySelector("#exp-date").textContent = await getExpirationDate(picked.modDate, picked.rotation);
          expDateField.classList.remove("expired")
          expDateField.classList.add("not-expired");
        }
      }else{  
        //Rotacja wyłączona
        clone.querySelector("#exp-date").textContent = "off";
        expDateField.classList.remove("expired");
        expDateField.classList.add("not-expired");
      }
      */

      container.appendChild(clone);
   }
  } else {
    //Brak zapisanych haseł lub Błąd odczytu z serwera
  }
}

/*
async function isRotationEnabled(rotation){
  if(rotation>0){return true;}
  return false;
}
  */

/*
//Expiration date
async function isPassExpired(date, rotation){
  const baseDate = new Date(date);
  const rotatedDate = new Date(baseDate);
  rotatedDate.setDate(rotatedDate.getDate()+rotation);
  const today = new Date();
  if(rotatedDate < today){
    return true;
  }
  return false;
}

async function getExpirationDate(date, rotation){
  const baseDate = new Date(date);
  const rotatedDate = new Date(baseDate);
  rotatedDate.setDate(rotatedDate.getDate()+rotation);
  return rotatedDate.toLocaleDateString();
}
*/

//Obsługa formularza
async function initAddRecordForm(){
  const addRecordButton = document.getElementById("addRecord-button");
  const form = document.getElementById("addRecord-form");
  const cancelRecordButton = document.getElementById("cancelRecord-button");
  const saveRecordButton = document.getElementById("saveRecord-button");

  const newUrl = document.getElementById("new-url");
  const newLogin = document.getElementById("new-login");
  const newPassword = document.getElementById("new-password");

  //Rozwinięcie formularza
  addRecordButton.addEventListener("click", async ()=>{
    let result = await isSecurityPasswordRequired();
    if(!tempSecPass && result){
      showUserPasswordSecurityModal();
    } else {
      addRecordButton.style.display="none"  //Ukryj ten przycisk
      form.classList.remove("hidden");  //Pokaż formularz
      setTimeout(() => {
        newUrl.value="";
        newLogin.value="";
        newPassword.value="";
        form.classList.add("hidden"); //ukryj formularz
        let randomPassContent = document.getElementById("random-pass-content");
        let randomPassContentSpace = document.getElementById("random-pass-content-space");
        randomPassContent.value="";
        randomPassContent.textContent="Losowe hasło";
        randomPassContentSpace.classList.add("hidden");
        addRecordButton.style.display="inline-flex"; //pokaż przycisk dodania rekordu
      }, 60 * 1000);
    }
  });

  //Odrzucenie formularze
  cancelRecordButton.addEventListener("click", ()=>{
    newUrl.value="";
    newLogin.value="";
    newPassword.value="";
    form.classList.add("hidden"); //ukryj formularz
    addRecordButton.style.display="inline-flex"; //pokaż przycisk dodania rekordu
    let randomPassContent = document.getElementById("random-pass-content");
    let randomPassContentSpace = document.getElementById("random-pass-content-space");
    randomPassContent.value="";
    randomPassContent.textContent="Losowe hasło";
    randomPassContentSpace.classList.add("hidden");
  });

  //Zapisanie zmian formularza
  saveRecordButton.replaceWith(saveRecordButton.cloneNode(true));
  const newSaveButton = document.getElementById("saveRecord-button");
  newSaveButton.addEventListener("click", async ()=>{
    valUrl=newUrl.value;
    valLogin=newLogin.value;
    valPassword=await encryptUserPassword(newPassword.value, tempSecPass);
    const data = {
      url: valUrl,
      login: valLogin,
      password: valPassword
    };
    if(valUrl !="" && valPassword != "" && valLogin != ""){
      const result = await addCredentialRecordToDataBase(data)
      if(result){
        await loadStorage();  //załaduj nową listę
      } else{
        //TODO błąd dodawania rekordu
      }
    } else{
      //TODO Powiadomienie o nie wypełnieniu całego formularza
    }
    newUrl.value="";
    newLogin.value="";
    newPassword.value="";
    form.classList.add("hidden"); //ukryj formularz
    addRecordButton.style.display="inline-flex"; //pokaż przycisk dodania rekordu
  });
}

//Dodaj nowy record do bazy danych
async function addCredentialRecordToDataBase(data){
  let result = await window.api.addNewStorageRecord(data);
  if(result){
    if(result.success){
      return result.data;
    } else{
      console.log("error:", result.error)
    }
    return;
  }
  
  /*
  try{
    const responseConfig = await window.api.loadApiConfig();
    const config = responseConfig.config;
    const url = config.uploadNewRecord; 
    const tokenObj = await window.api.loadToken();
    const token = tokenObj.token;
     if(token!= null && url!=null){
      const response = await fetch(url,{
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: data.url,
          access_login: data.login,
          access_pwd: data.password
        })
      });
      return response.ok ? await response.json() : null;
     }
  }catch(err){
    await window.api.logout();
  }
  */
}

async function removeRecord(){
  if(recordToDelete){
    let result = await window.api.removeStorageRecord(recordToDelete);
    if(result){
      if(result.success && result.data){
        recordToDelete = null;
        return result.data;
      } else{
        console.log("error", result.error);
      }
    }
  } else {
    console.log("error:", "Brak pozycji do usunięcia.")
  }
  return;
  
  /*
  try{
    const responseConfig = await window.api.loadApiConfig();
    const config = responseConfig.config;
    const url = config.removePassFromCloud; 
    const tokenObj = await window.api.loadToken();
    const token = tokenObj.token;
    console.log("Wysyłam request usunięcia rekordu: ", selectedRecord);
    if(token!= null && url!=null){
      //Remove from Cloud:
      const response = await fetch(url,{
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recordId: recordToDelete
        })
      });
        recordToDelete = null;
      return response.ok ? await response.json() : null;
   }
  } catch(err){
    await window.api.logout();
  }
    */
}

async function isSecurityPasswordRequired(){
  let result = await window.api.isSecurityPasswordRequired();
  if(result){
    return true;
  }
  return false;
}

function showUserPasswordSecurityModal(){
    let showPassSecurityModal = document.getElementById("security-modal");
    showPassSecurityModal.classList.remove("hidden");
}

function hideUserPasswordSecurityModal(){
  let showPassSecurityModal = document.getElementById("security-modal");
  showPassSecurityModal.classList.add("hidden");
  document.getElementById("security-modal-password").value = "";
  pickedPass = null;
  pickedPassVal = null;
}

/*
async function getDecryptedPassword(password){
  let decryptedPassword = await window.api.decryptUserPassword(password);
  return decryptedPassword 
}
  */

//Pokaż okno edycji rekordu
function showModifyModal(url, login){
  //console.log("Rotacja wybranego rekordu: ", rotation);
  document.getElementById("modify-modal").classList.remove("hidden");
  //Placeholders
  document.getElementById("modify-url").placeholder="url";
  document.getElementById("modify-login").placeholder="Login";
  document.getElementById("modify-password").placeholder="Password";
  //Values
  document.getElementById("modify-modal").classList.remove("hidden");
  document.getElementById("modify-url").value = url;
  document.getElementById("modify-login").value = login;
  document.getElementById("modify-password").value="";
  //document.getElementById("modify-rotation").value=rotation;
}

//Anuluj i zamknij okno edycji rekordu
function cancelModifyModal(){
  document.getElementById("cancel-modify").addEventListener("click", () => {
  recordToModify = null;
  document.getElementById("modify-modal").classList.add("hidden");
});
}

//Obsługa przycisku zatwierdzenia zmian rekordu
function confirmModify(){
  document.getElementById("confirm-modify").addEventListener("click", async () => {
    await sendModifyToApi();
    document.getElementById("modify-modal").classList.add("hidden");
    recordToModify = null;
  });
}

//Zatwierdź zmiany rekordu i wyślij do api
async function sendModifyToApi(){
  let data = {
    'recordId': recordToModify,
    'url': newUrl,
    'login': newLogin,
    'password': newPassword
  }
  let result = await window.api.modifyRecord(data);
  if(result){
    if(result.success && result.data){
      return result.data;
    } else{
      console.log("Błąd aktualizacji pozycji.")
      if(result.error){
        console.log("error:",result.error);
      }
    }
  } else{
    console.log("Błąd modyfikacji pozycji.")
  }
  return;
  /*
  let newLogin = document.getElementById("modify-login").value;
  let newPassowrd = await encryptUserPassword(document.getElementById("modify-password").value);
  let newUrl = document.getElementById("modify-url").value;
  let newRotation = document.getElementById("modify-rotation").value;
  try{
    const responseConfig = await window.api.loadApiConfig();
    const config = responseConfig.config;
    const url = config.modifyRecord; 
    const tokenObj = await window.api.loadToken();
    const token = tokenObj.token;
    if(token!= null && url!=null){
      //Remove from Cloud:
      const response = await fetch(url,{
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recordId: recordToModify,
          login: newLogin,
          password: newPassowrd,
          url: newUrl,
          rotation: newRotation
        })
      });
        recordToDelete = null;
      return response.ok ? await response.json() : null;
   }
  } catch(err){
    //await window.api.logout();
  }
    */
}

//Pokaż okno potwierdzenia usunięcia rekordu
function showDeletingPopUp(){
  document.getElementById("confirm-modal").classList.remove("hidden");
}

// Zatwierdź usunięcie rekordu
function confirmDeleting(){
  document.getElementById("confirm-delete").addEventListener("click", async () => {
    if (recordToDelete) {
      await removeRecord();
      await loadStorage();
    }
    document.getElementById("confirm-modal").classList.add("hidden");
  });
  selectedRecord = null;
}

// Anuluj usunięcie rekordu
function cancelDeleting(){
  document.getElementById("cancel-delete").addEventListener("click", () => {
  selectedRecord = null;
  document.getElementById("confirm-modal").classList.add("hidden");
});
}

//Zaszyfruj
async function encryptPassword(password){
  const safePass = await window.api.encryptPassword(password);
  return safePass;
}

//Zaszyfruj hasło użytkownika
async function encryptUserPassword(password, key){
  //console.log("password:", password);
  let result = await window.api.encryptUserPassword(password, key);
  //console.log("result:", result);
  return result.password;
}

//Odszyfruj hasło użytkownika
async function decryptUserPassword(password){
  const safePass = await window.api.decryptUserPassword(password);
  //console.log("safePass", safePass);
  let result= await window.api.decryptUserPassword(password);
  if(result){
    if(result.success){
      return result.password;
    } else{
      console.log("error:", result.message);
    }
  }else{
    console.log("błąd odczytywania hasła");
  }
  return null;
}

//Odszyfruj
async function decryptPassword(password){
  let result= await window.api.decryptPassword(password);
  //console.log("result password", result);
  if(result){
    if(result.success){
      return result.data;
    } else{
      console.log("error:", result.error);
    }
  }else{
    console.log("błąd odczytywania hasła");
  }
  return null;
}

//Sprawdź czy rotacja jest włączona
async function isRotationOn(){
  const isOn = await window.api.isRotationOn();
  return isOn;
}

async function showOptionsMenu(event, recordId) {
  const iconRect = event.currentTarget.getBoundingClientRect(); //pozycja ikony

  let result = await isSecurityPasswordRequired();
  if(result){
    showUserPasswordSecurityModal();
    return;
  }
  const menu = document.querySelector("#global-options-menu");
  if(recordId === selectedRecord){
    closeGlobalMenu();
    return;
  }
  closeGlobalMenu();  // ZAWSZE zamknij przed otwarciem (tylko 1 menu otwarte)
  selectedRecord = recordId;
  menuOpenRecordId = recordId;
  menu.classList.remove("hidden");
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  let padding = 1.2 * rem;
  let x = iconRect.right + padding;
  let y = iconRect.bottom; 
  menu.style.left = "0px";
  menu.style.top = "0px";
  requestAnimationFrame(() => {
    const rect = menu.getBoundingClientRect();
    if (x + rect.width > window.innerWidth) {
      x = window.innerWidth - rect.width - padding;
    }

    if (y + rect.height > window.innerHeight) {
      y = window.innerHeight - rect.height - padding;
    }
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
  });
}

function initMenuActions() {
  const menu = document.querySelector("#global-options-menu");
  const editBtn = menu.querySelector(".edit-btn");
  const deleteBtn = menu.querySelector(".delete-btn");

  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    recordToModify = selectedRecord;
    //showModifyModalById(recordToModify);
    //console.log(pickedRecordData);
    showModifyModal(pickedRecordData.url, pickedRecordData.login);
    menu.classList.add("hidden");
  });

  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    recordToDelete = selectedRecord;
    showDeletingPopUp();
    menu.classList.add("hidden");
  });
}

function closeGlobalMenu() {
  //console.log("Funkcja zamykająca menu..");
  const menu = document.querySelector("#global-options-menu");
  if (!menu) return;
  //console.log("Chopwanie menu..");
  menu.classList.add("hidden");
  menuOpen = false;
  selectedRecord = null;
  //clearSelectedData();
  //selectedRecord = null;
  //recordToDelete = null;
  //recordToModify = null;
  //menuOpenRecordId = null;
  //console.log("Menu powinno być już zamknięte");
}

function initGlobalMenuClose() {
  document.addEventListener("click", (e) => {
    closeGlobalMenu();
  });
}

function clearSelectedData(){
  formInitialized = false;
  pickedId;
  pickedRecordData = null;
  selectedRecord = null;
  recordToDelete = null
  recordToModify = null;
  menuOpen = false;
}

function userPasswordSecurityModalButtons(){
  let userPasswordSecurityModalCancelButton = document.getElementById("user-password-security-modal-cancel-button");
  let userPasswordSecurityModalConfirmButton = document.getElementById("user-password-security-modal-confirm-button");
  userPasswordSecurityModalCancelButton.addEventListener("click", (e) => {
    hideUserPasswordSecurityModal();
  });
  userPasswordSecurityModalConfirmButton.addEventListener("click", async (e) => {
    let userSecurityPassInput = document.getElementById("security-modal-password").value;
    if(userSecurityPassInput){
      let result = await validateSecurityPassword(userSecurityPassInput);
      if(result){
        await window.api.setSecurityPassword(userSecurityPassInput);
        tempSecPass = userSecurityPassInput;
        //let decryptedPass = await decryptUserPassword(pickedPassVal);
        hideUserPasswordSecurityModal();
        if(pickedPass && pickedPassEye && pickedPassVal){
          await showPassword();
        }
        /*
        if(decryptedPass){
          //console.log(decryptedPass);
          pickedPass.textContent = decryptedPass;
          hideUserPasswordSecurityModal();
        }
          */
      }
    }
  });
}

function hidePassword(passField, pickedPassEye){
  if(passField.classList.contains("show-password")){
    passField.classList.remove("show-password");
    pickedPassEye.classList.toggle("toggle-eye-visible");
    passField.textContent = "••••••";
  }
  pickedPass = null;
  pickedPassEye = null;
  pickedPassVal = null;
}

async function showPassword(){
  let isSecurityPasswordRequired = await window.api.isSecurityPasswordRequired();
  if(isSecurityPasswordRequired){
    showUserPasswordSecurityModal();
  } else {
    if(!pickedPass.classList.contains("show-password")){
      pickedPass.classList.add("show-password");
      pickedPassEye.classList.toggle("toggle-eye-visible");
      let decryptedPass = await decryptUserPassword(pickedPassVal);
      //console.log("decryptedPass:", decryptedPass);
      if(!decryptedPass){
        decryptedPass = "[złe hasło]";
      }
      pickedPass.textContent = decryptedPass;
      tempPass = pickedPass;
      tempEye = pickedPassEye;
      setTimeout(() => {
      hidePassword(tempPass, tempEye);
      }, 15 * 1000);  //ukryj hasło po 15s
    }
  }
}

async function validateSecurityPassword(securityPass){
  let result = await window.api.validateSecurityPassword(securityPass);
  return result;
}

function randomPasswordGenerateButtonInit(){
  let randomPassButton = document.getElementById("generate-password-icon");
  randomPassButton.addEventListener("click", async ()=>{
    let randomPassContent = document.getElementById("random-pass-content");
    let randomPassContentSpace = document.getElementById("random-pass-content-space");
    let result = await window.api.generateRandomPassword();
    if(result && result.success && result.data){
      randomPassContent.value = result.data;
      randomPassContent.textContent = result.data;
      randomPassContentSpace.classList.remove("hidden");
    }
  });

  let randomPasswordContent = document.getElementById("random-pass-content");
  randomPasswordContent.addEventListener("click", ()=>{
    const randomPass = randomPasswordContent.value;
    if(randomPass && randomPass.length>0){
      navigator.clipboard.writeText(randomPass);
    }
  });
}

// Odebranie klucza publicznego
async function getPublicKey(email) {
  const responseUrl = await window.api.loadApiConfig();
  const url = responseUrl.config.publicKey;

  const tokenObj = await window.api.loadToken();
  const token = tokenObj.token;
  try{
    const response = await fetch(url, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });
    if (!response.ok) {
      throw new Error(`Błąd API: ${response.status}`);
    }
     const data = await response.json();
     //console.log("publicKey", data.publicKey);
     return data.publicKey;
  }catch(error){
      console.error("Błąd pobierania klucza.", error);
      await window.api.logout();
      return null;
  }
}
