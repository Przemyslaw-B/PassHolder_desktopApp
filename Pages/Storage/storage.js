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
    //console.log("[loadStorage] funkcja wystartowała");
    const responseConfig = await window.api.loadApiConfig();
    const config = responseConfig.config;
    const url = config.storage; 

    const tokenRes = await window.api.loadToken();
    //console.log("[loadStorage.token] tokenRes:", tokenRes);
    //console.log("[loadStorage.tokenRes] tokenRes:", tokenRes);
    const token = tokenRes.token;
    //onsole.log("[loadStorage.token] token:", token);
    if(!tokenRes.success || token==null){
      console.error("Brak tokenu – użytkownik nie jest zalogowany");
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
    console.log("Odebrane dane ze storage: ", data.storage);
    await window.api.storageUpdate(data.storage);
    //TODO AKTUALIZACJA DANYCH W ZAKŁADCE STORAGE
    //renderStorage(data);
    await loadDataToHtml(data);
  }catch(err){
    console.error("[loadStorage] błąd:", err);
  }

  async function loadDataToHtml(data){
    const container = document.getElementById("storage-list");
    const template = document.getElementById("storage-row-template");
    container.innerHTML = ""; //Wyczyszczenie poprzednich wierszy w celu uniknięcia powielania po kolejnynm otwarciu
    let counter = 0;
    data.storage.forEach(picked=>{
      counter = counter+1;
      const clone = template.content.cloneNode(true);
      clone.querySelector("#number").textContent = counter;
      clone.querySelector("#idPass").textContent = picked.id;
      clone.querySelector("#url").textContent = picked.url;
      clone.querySelector("#login").textContent = picked.login;
      clone.querySelector("#password").textContent = "••••••"
      const eye = clone.querySelector("#toggle-eye");
      const passField=clone.querySelector("#password");
      passField.classList.add("show-password");
      eye.textContent = "👁️";
      eye.addEventListener("click", ()=>{
      if(passField.classList.contains("show-password")){
        passField.classList.remove("show-password");
        eye.textContent="👁️";
        passField.textContent = "••••••";
      } else{
        passField.classList.add("show-password");
        eye.textContent="🙈";
        passField.textContent = picked.password;
      }
  });
      clone.querySelector("#exp-date").textContent = "Brak";
      container.appendChild(clone);
    });
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
    valPassword=newPassword.value;
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

async function waitForSync(){

}