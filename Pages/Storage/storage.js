// const { read } = require("original-fs");

let formInitialized = false;

function initAddRecordFormOnce() { 
  if (formInitialized) {
    return; 
  }
  formInitialized = true; 
  initAddRecordForm(); 
}

document.addEventListener("DOMContentLoaded", () => {
  const storageContainer = document.getElementById("storage-content");

  // pobierz treść z home.html i wstaw do kontenera
  fetch("../Storage/storage.html")
    .then(res => res.text())
    .then(html => {
      storageContainer.innerHTML = html;
      initAddRecordFormOnce();
      loadStorage();
    });
});

async function loadStorage(){
  try{
    // Odczytanie endpointów
    const responseConfig = await window.api.loadApiConfig();
    const config = responseConfig.config;
    const url = config.storage; 

    const tokenRes = await window.api.loadToken();
    const token = tokenRes.token;
    if(!tokenRes.success || token==null){
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
    //console.log("Odebrane dane ze storage: ", data.storage);
    await window.api.storageUpdate(data.storage);
    // Załadowanie z Local DB
    const localData = await window.api.getStorage();
    //console.log(localData);
    await loadLocalDataToHtml(localData);
  }catch(err){
    console.error("[loadStorage] błąd:", err);
    await window.api.logout();

  }

  async function loadLocalDataToHtml(data){
const container = document.getElementById("storage-list");
    const template = document.getElementById("storage-row-template");
    container.innerHTML = ""; //Wyczyszczenie poprzednich wierszy w celu uniknięcia powielania po kolejnynm otwarciu
    let counter = 0;
   
   for(let i =0; i<data.length; i++){
    const picked = data[i];
    counter = counter+1;
    const clone = template.content.cloneNode(true);
      clone.querySelector("#number").textContent = counter;
      clone.querySelector("#remove-record").dataset.id = picked.id
      clone.querySelector("#url").textContent = picked.url;
      const urlListener = clone.querySelector("#url");
      urlListener.addEventListener("click", ()=>{
        navigator.clipboard.writeText(picked.url);
      });
      clone.querySelector("#login").textContent = picked.access_login;
      const loginListener = clone.querySelector("#login");
      loginListener.addEventListener("click", ()=>{
        navigator.clipboard.writeText(picked.access_login);
      });
      clone.querySelector("#password").textContent = "••••••";
      const pwdListener = clone.querySelector("#password");
      pwdListener.addEventListener("click", async ()=>{
        if(passField.classList.contains("show-password")){
          navigator.clipboard.writeText(await decryptPassword(picked.access_pwd));
        }
      });
      clone.querySelector("#remove-record").textContent="✕";
      const removeBtn = clone.querySelector("#remove-record");
      removeBtn.dataset.id=picked.id;
      removeBtn.dataset.id_cloud=picked.id_cloud;
      removeBtn.addEventListener("click", async()=>{
        await removeRecord(picked.id, picked.id_cloud);
        removeBtn.closest(".storage-row").remove();
        await loadStorage();
      });
      const eye = clone.querySelector("#toggle-eye");
      const passField=clone.querySelector("#password");
      //passField.classList.add("show-password");
      eye.textContent = "👁️";
      eye.addEventListener("click", async ()=>{
      if(passField.classList.contains("show-password")){
        passField.classList.remove("show-password");
        eye.textContent="👁️";
        passField.textContent = "••••••";
      } else{
        passField.classList.add("show-password");
        eye.textContent="🙈";
        passField.textContent = await decryptPassword(picked.access_pwd);
      }
  });
      //ExpirationDate
      const isRotation = await isRotationOn();
      const expDateField = clone.querySelector("#exp-date");
      if(isRotation){ //jeśli rotacja włączona
        const isExpired = await isPassExpired(picked.id);
        if(isExpired){  //jeśli hasło nieaktualne
          expDateField.textContent = "Expired";
          expDateField.classList.remove("not-expired")
          expDateField.classList.add("expired");
        }else{
          //Hasło aktualne - pokaż datę 
          const expDate = await getExpirationDate(picked.id); 
          clone.querySelector("#exp-date").textContent = new Date(expDate).toLocaleDateString();
          expDateField.classList.remove("expired")
          expDateField.classList.add("not-expired");
        }
      }else{  
        //Rotacja wyłączona
        clone.querySelector("#exp-date").textContent = "off";
        expDateField.classList.remove("expired");
        expDateField.classList.add("not-expired");
      }
      container.appendChild(clone);
   }
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
  addRecordButton.addEventListener("click", ()=>{
    addRecordButton.style.display="none"  //Ukryj ten przycisk
    form.classList.remove("hidden");  //Pokaż formularz
  });

  //Odrzucenie
  cancelRecordButton.addEventListener("click", ()=>{
    newUrl.value="";
    newLogin.value="";
    newPassword.value="";
    form.classList.add("hidden"); //ukryj formularz
    addRecordButton.style.display="inline-flex"; //pokaż przycisk dodania rekordu
  });

  //Zapisanie zmian
  saveRecordButton.replaceWith(saveRecordButton.cloneNode(true));
  const newSaveButton = document.getElementById("saveRecord-button");
  newSaveButton.addEventListener("click", async ()=>{
    valUrl=newUrl.value;
    valLogin=newLogin.value;
    valPassword=await encryptPassword(newPassword.value);
    const data = {
      url: valUrl,
      login: valLogin,
      password: valPassword
    };
    if(valUrl !="" && valPassword != "" && valLogin != ""){
      const result = await window.api.localStorageUpdate(data);
      if(result.success){
        await loadStorage();  //załaduj nową listę
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

async function removeRecord(id, idCloud){
  try{
    const responseConfig = await window.api.loadApiConfig();
    const config = responseConfig.config;
    const url = config.removePassFromCloud; 
    const tokenObj = await window.api.loadToken();
    const token = tokenObj.token;
    if(token!= null && url!=null){
      //Remove from local:
      await window.api.removeLocalRecord(id);
      //Remove from Cloud:
      const response = await fetch(url,{
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recordId: idCloud
        })
      });
      return response.ok ? await response.json() : null;
   }
  } catch(err){
    await window.api.logout();
  }
  
}

//Zaszyfruj
async function encryptPassword(password){
  const safePass = await window.api.encryptPassword(password);
  return safePass;
}

//Odszyfruj
async function decryptPassword(password){
  const readedPass = await window.api.decryptPassword(password);
  return readedPass;
}

//Sprawdź czy rotacja jest włączona
async function isRotationOn(){
  const isOn = await window.api.isRotationOn();
  return isOn;
}

//Sprawdź czy hasło jest przedawnione
async function isPassExpired(passId){
  if(!passId){return true;}
  const isExpired = await window.api.isPasswordExpired(passId);
  return isExpired;
}

//Pobierz datę upłynięcia ważności hasła
async function getExpirationDate(passId){
  const expDate = await window.api.getExpirationDate(passId);
  return expDate;
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
