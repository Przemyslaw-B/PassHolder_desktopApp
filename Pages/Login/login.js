// Wybór wersji językowej
async function setLanguage(lang) {
  if (!window.api || !window.api.loadLanguage) {
    console.error('window.api nie jest dostępne');
    return;
  }

  const response = await window.api.loadLanguage(lang);
  if(!response.success) {
    setLanguage('en');
    return;
  }

  const labels = response.data;
  if (!labels || !labels.loginTitle) return;

  document.getElementById('loginTitle').textContent = labels.loginTitle;
  document.getElementById('email').placeholder = labels.email;
  document.getElementById('password').placeholder = labels.password;
  document.getElementById('loginButton').textContent = labels.loginButton;
  document.getElementById('createAccount').textContent = labels.createAccount;
  document.getElementById('forgotPassword').textContent = labels.forgotPassword;
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('lang-PL').addEventListener('click', () => setLanguage('pl'));
  document.getElementById('lang-EN').addEventListener('click', () => setLanguage('en'));
});

window.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('loginButton').addEventListener('click', async ()=>loginValidation());
});

// Walidacja użytkownika
async function loginValidation(){
  if (!window.api || !window.api.loadApiConfig) {
    console.error('window.api nie jest dostępne');
    return;
  }

  const response= await window.api.loadApiConfig();
  if(!response.success) {
    return;
  }

  // Odczytanie endpointów
  const config = response.config;
  const url = config.loginValidation;
  const keyUrl = config.publicKey;

  const email = document.getElementById('email').value;
  const passwordTemp = document.getElementById('password').value;

  if(email != null && passwordTemp != null && email !== "" && passwordTemp !== ""){
    const publicKey = await getPublicKey(email, keyUrl);
    // Szyfrowanie wpisanego hasła
    password = await window.api.encryptPassword(passwordTemp, publicKey);
    //Wysyłanie danych do API
    const loginData = await loginRequest(email, password, url);
    if(loginData != null){
      if(loginData.status === "Validated" && loginData.username != null){
        //console.log("login status:", loginData.status, " username:", loginData.username, " token:", loginData.token);
        const rep = await window.api.setUser(loginData.username);
        const tokenRes = await window.api.saveToken(loginData.token);
        //const readedToken = await window.api.loadToken();
        //console.log("Odczyt zapisanego tokenu:", readedToken);
        if (loginData.status=="Validated") {
          //console.log("Zapis tokenu:", tokenRes);
          const isAuthenticated = loginData.auth;
          if(isAuthenticated === "true"){ // Jeśli 2FA nie jest wymagane
            const rep2 = await window.api.loginSuccess(); // Pomyślne logowanie i zmiana ekranu na główny
          }
          setAuthenticationContent();
        }
      } else{
        //Błędne dane logowania
        //..
      }
    }
  } else {
    //Nie podano danych logowania
    //..
  }
}

// Wysłanie danych logowania
async function loginRequest(email, password, url){
  try{
    //Utworzenie json do logowania
    const payload = {
      username: email,
      password: password
    }
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if(!response.ok){
      throw new Error(`Błąd API: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch(error){
    console.error("Błąd pobierania klucza.", error);
    return null;
  }
}

// Odebranie klucza publicznego
async function getPublicKey(email, keyUrl) {
  try{
    const response = await fetch(keyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });
    if (!response.ok) {
      throw new Error(`Błąd API: ${response.status}`);
    }
     const data = await response.json();
     return data.publicKey;
  }catch(error){
      console.error("Błąd pobierania klucza.", error);
      return null;
  }
}

// Po pomyślnym logowaniu zmień okno..
async function openMainPage(){
  if (!window.api || !window.api.loadLanguage) {
    console.error('window.api nie jest dostępne');
    return;
  }
  const response = await window.api.loginSuccess();
}

// Ustaw Nazwę użytkownika
async function setUser(username){
  if (!window.api || !window.api.loadLanguage) {
    console.error('window.api nie jest dostępne');
    return;
  }
  const response = await window.api.setUser(username)
}

  // Przycisk wysłania weryfikacji 2FA
  document.getElementById("auth-confirm-button").addEventListener("click", async () => {
    const authCode = document.getElementById("auth-input").value.trim();
    if(authCode==="" || authCode.length != 6){
      // Obsluga wpisania złego kodu
    } else{
      const response = await authentication(authCode);
      const authStatus = response.auth;
      console.log("Auth response: ", authStatus);
      if(authStatus==="success"){
        const rep2 = await window.api.loginSuccess(); // Pomyślne logowanie i zmiana ekranu na główny
      } else{
        // Błędny kod
      }
    }
  });

  // 2FA
  async function authentication(authCode){
    const configLoader = await window.api.loadApiConfig();
    const url = configLoader.config.authentication;
    const tokenObj = await window.api.loadToken();  //Pobierz token użytkownika
    const token = tokenObj.token;
    try{
      const respone = await fetch(url, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          authKey: authCode
        })
      });
      const data = await respone.json();
      console.log("Odpowiedź z API: ", data);
      return data;
    } catch(error){
      console.error("Błąd podczas wysyłania żądania autoryzacji 2FA.", error);
    }
  }


  // Obsługa przycisku tworzenia nowego konta
  document.getElementById("createAccount").addEventListener("click", ()=>{
    setCreatingAccountContent();
  });

  // Obsługa powrotu z tworzenia konta do ekranu logowania
  document.getElementById("new-account-cancel-button").addEventListener("click", ()=>{
    setLoginContent();
  });

  // Obsługa powrotu z weryfikacji do ekranu logowania
  document.getElementById("auth-cancel-button").addEventListener("click", ()=>{
    setLoginContent();
  });

  // Zmiana zawartości okna na Tworzenie konta
  function setCreatingAccountContent(){
    hideLoginContent();
    hideAuthenticationContent();
    showCreatingAccountContent();
  }

  // Zmiana zawartości okna na logowanie
  function setLoginContent(){
    hideAuthenticationContent();
    hideCreatingAccountContent();
    showLoginContent();
  }

  // Zmiana zawartości okna na weryfikację
  function setAuthenticationContent(){
    hideCreatingAccountContent();
    hideLoginContent();
    showAuthenticationContent();
  }

  // Ukryj treść logowania
  function hideLoginContent(){
    document.querySelector(".login-container").style.display="none";
  }
  // Pokaż treść logowania
  function showLoginContent(){
    document.querySelector(".login-container").style.display="block";
  }

  // Ukryj treść tworzenia konta
  function hideCreatingAccountContent(){
    document.querySelector(".new-account-container").style.display="none";
  }
  // pokaż treść tworzenia konta
  function showCreatingAccountContent(){
    document.querySelector(".new-account-container").style.display="block";
  }

  // Ukryj treść weryfikacji
  function hideAuthenticationContent(){
    document.querySelector(".auth-container").style.display="none";
  }
  //pokaż treść weryfikacji
  function showAuthenticationContent(){
    document.querySelector(".auth-container").style.display="block";
  }