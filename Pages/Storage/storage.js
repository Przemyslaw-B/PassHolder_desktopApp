document.addEventListener("DOMContentLoaded", () => {
  const storageContainer = document.getElementById("storage-content");

  // pobierz treść z home.html i wstaw do kontenera
  fetch("../Storage/storage.html")
    .then(res => res.text())
    .then(html => {
      storageContainer.innerHTML = html;
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
    //TODO AKTUALIZACJA DANYCH W ZAKŁADCE STORAGE
    //renderStorage(data);
    await loadDataToHtml(data);
  }catch(err){
    console.error("[loadStorage] błąd:", err);
  }

  async function loadDataToHtml(data){
    const container = document.getElementById("storage-list");
    const template = document.getElementById("storage-row-template");
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