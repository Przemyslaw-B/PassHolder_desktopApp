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
    .then(async html => {
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

      await isSecurityPasswordSet();
      await loadStorage();
    });
});

async function isSecurityPasswordSet(){
  const response = await window.api.isSecurityPasswordSet();
  if(response === true){
    return true;
  }
    hideUserPasswordSecurityModal();
    showSecurityPasswordModal();
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
    if((securityPassword === null || securityPassword === "")&& (securityPasswordRepeat === null || securityPasswordRepeat === "")){
      message = "Oba pola muszą zostać wypełnione."
    }
    if(securityPassword === securityPasswordRepeat){
      const result = await window.api.validateNewSecurityPassword(securityPassword);
      if(result.success === true){
        const res = await window.api.setNewSecurityPassword(securityPassword);
        await loadStorage();
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
    if(isSecurityPassword===true){  //brak ustawionego hasła bezpieczeństwa
      if(!tempSecPass || tempSecPass===null ||tempSecPass===""){
        hideSecurityPasswordModal();
        showUserPasswordSecurityModal();
      }
      hideSecurityPasswordModal();
      const data = await downloadData();
      await setStorageGUI(data);
    }
  }catch(err){
    console.error("[loadStorage] błąd:", err);
  }
  }

async function downloadData(){
  let result = await window.api.getStorage();
  if(result && result.success){
    return result.data;
  } else{
    console.log("error: ", result.error);
  }
}

async function setStorageGUI(data){
  const container = document.getElementById("storage-list");
  const template = document.getElementById("storage-row-template");
  container.innerHTML = ""; //Wyczyszczenie poprzednich wierszy w celu uniknięcia powielania po kolejnynm otwarciu
  if (data != null && data.length > 0){
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

      //MENU
      const dotsBtn = clone.querySelector("#dots-menu");
      dotsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        pickedRecordData = picked;
        showOptionsMenu(e, picked.id);
      });

      const eye = clone.querySelector("#toggle-eye");
      const passField=clone.querySelector("#password");
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
        }
      });
      container.appendChild(clone);
   }
  } else {
    //Brak zapisanych haseł lub Błąd odczytu z serwera
  }
}

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
    //let result = await isSecurityPasswordRequired();
    if(!tempSecPass || tempSecPass===""){
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
  if(result && result.success){
    return result.data;
  } 
  onsole.log("error:", result.error)
  return;
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

//Pokaż okno edycji rekordu
function showModifyModal(url, login){
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
    const urlInput = document.getElementById("modify-url");
    const loginInput = document.getElementById("modify-login");
    const passwordInput = document.getElementById("modify-password");
    newUrl = urlInput.value;
    newLogin = loginInput.value;
    newPassword = await encryptUserPassword(passwordInput.value, tempSecPass);
    await sendModifyToApi();
    document.getElementById("modify-modal").classList.add("hidden");
    recordToModify = null;
    newLogin="";
    newUrl="";
    newPassword="";
    await loadStorage();
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
  //let result = await window.api.modifyRecord(data);
  let result = await window.api.storageUpdate(data);
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
    }
    selectedRecord = null;
    recordToDelete = null;
    await loadStorage();
    document.getElementById("confirm-modal").classList.add("hidden");
  });
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

  //let result = await isSecurityPasswordRequired();
  let result = false;
  if(!tempSecPass || tempSecPass===null || tempSecPass===""){
    result=true;
  }
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