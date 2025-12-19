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
          const rep2 = await window.api.loginSuccess();
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
    return data;``
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
    const response = await window.api.setUser(username)
  }
}