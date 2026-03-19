let formInitialized = false;
let pickedId;

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
    const data = await downloadData();
    console.log(data);
    await setStorageGUI(data);
  }catch(err){
    console.error("[loadStorage] błąd:", err);
    //await window.api.logout();
  }
  }

async function downloadData(){
   try{
    // Odczytanie endpointów
    const responseConfig = await window.api.loadApiConfig();
    const config = responseConfig.config;
    const url = config.storage; 

    const tokenRes = await window.api.loadToken();
    const token = tokenRes.token;
    if(!tokenRes.success || token==null){
      console.log("Brak tokenu użytkownik nie jest zalogowany");
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
}

async function setStorageGUI(data){
  console.log("Data length: " + data.length)
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
          navigator.clipboard.writeText(await decryptPassword(picked.password));
        }
      });
      //clone.querySelector("#remove-record").textContent="✕";
      //clone.querySelector("#dots-menu").textContent="⋮";
      const optionBtn = clone.querySelector("#dots-menu");
      //optionBtn.insertAdjacentText("afterbegin", "⋮");
      optionBtn.dataset.id=picked.id;
      optionBtn.dataset.id_cloud=picked.id;
      optionBtn.addEventListener("click", (e)=>{
        //Najpierw zamknąć inne menu jeśli były otwarte
        document.querySelectorAll(".options-menu").forEach(menu => {
          menu.classList.add("hidden");
        });
        //otwarcie nowego menu
        e.stopPropagation(); //zapobiegnij natychmiastowemu zamknięciu menu
        const row = optionBtn.closest(".storage-row");
        const menu = row.querySelector(".options-menu");
        menu.classList.toggle("hidden");
        pickedId = picked.id;
        const editButton = menu.querySelector(".edit-btn");
        editButton.addEventListener("click", async (e)=>{
          //Menu edycji rekordu
        })
        const deleteButton = menu.querySelector(".delete-btn");
        deleteButton.addEventListener("click", async (e)=>{
          //console.log("Id rekordu dla wybranego wiersza: ", pickedId);
          await removeRecord(picked.id);
          optionBtn.closest(".storage-row").remove();
          await loadStorage();
        })
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
        passField.textContent = await decryptPassword(picked.password);
      }
      });
      //ExpirationDate
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
          //const expDate = await getExpirationDate(picked.id); 
          //clone.querySelector("#exp-date").textContent = new Date(expDate).toLocaleDateString();
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
      container.appendChild(clone);
   }
  } else {
    //Brak zapisanych haseł lub Błąd odczytu z serwera
  }
}

async function isRotationEnabled(rotation){
  if(rotation>0){return true;}
  return false;
}

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
      //const result = await window.api.localStorageUpdate(data);
      const result = await addCredentialRecordToDataBase(data)
      if(result){
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

//Dodaj nowy record do bazy danych
async function addCredentialRecordToDataBase(data){
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
}


async function removeRecord(idCloud){
  try{
    const responseConfig = await window.api.loadApiConfig();
    const config = responseConfig.config;
    const url = config.removePassFromCloud; 
    const tokenObj = await window.api.loadToken();
    const token = tokenObj.token;
    if(token!= null && url!=null){
      //Remove from local:
      //await window.api.removeLocalRecord(id);
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

/*
//Sprawdź czy hasło jest przedawnione
async function isPassExpired(passId){
  if(!passId){return true;}
    const isExpired = false; //await window.api.isPasswordExpired(passId);
  return isExpired;
}
  */

/*
//Pobierz datę upłynięcia ważności hasła
async function getExpirationDate(passId){
  const expDate = await window.api.getExpirationDate(passId);
  return expDate;
}
  */

//zamykanie rozwijanych menu po naciśnięciu w inne miejsce na ekranie
document.addEventListener("click", () => {
  document.querySelectorAll(".options-menu").forEach(menu => {
    menu.classList.add("hidden");
  });
});

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
