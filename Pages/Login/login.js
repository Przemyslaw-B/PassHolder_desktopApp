//Pobierz język
/*
async function getLanguagePack(){
  return await window.api.getLanguagePack();
}

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

  //logowanie
  document.getElementById('loginTitle').textContent = labels.loginTitle;
  document.getElementById('email').placeholder = labels.email;
  document.getElementById('password').placeholder = labels.password;
  document.getElementById('loginButton').textContent = labels.loginButton;
  document.getElementById('createAccount').textContent = labels.createAccount;
  //document.getElementById('forgotPassword').textContent = labels.forgotPassword;

  //zakładanie konta
  document.getElementById('create-account-title').textContent = labels.creatingAcount;
  document.getElementById('creatingAcc-email-input').placeholder = labels.creatingAcountEmail;
  document.getElementById('creatingAcc-name-input').placeholder = labels.creatingAcountName;
  document.getElementById('creatingAcc-passwordinput').placeholder = labels.creatingAcountPassword;
  document.getElementById('new-account-cancel-button').textContent = labels.creatingAcountCancelButton;
  document.getElementById('new-account-confirm-button').textContent = labels.creatingAcountConfirmButton;
 
  //2FA
  document.getElementById('authorization-title').textContent = labels.authTitle;
  document.getElementById('auth-explain').textContent = labels.authExplain;
  document.getElementById('auth-input').placeholder = labels.authInput;
  document.getElementById('auth-cancel-button').textContent = labels.authCancelButton;
  document.getElementById('auth-confirm-button').textContent = labels.authConfirmButton;
 
}

*/

window.addEventListener('DOMContentLoaded', () => {
  //document.getElementById('lang-PL').addEventListener('click', () => setLanguage('pl'));
  //document.getElementById('lang-EN').addEventListener('click', () => setLanguage('en'));
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
  //const config = response.config;
  //const url = config.loginValidation;
  //const keyUrl = config.publicKey;

  const email = document.getElementById('email').value;
  const passwordTemp = document.getElementById('password').value;

  if(email != null && passwordTemp != null && email !== "" && passwordTemp !== ""){
    // Szyfrowanie wpisanego hasła
    const password = await window.api.hashPassword(passwordTemp);
    //Wysyłanie danych do API
    const responseData = await loginRequest(email, password);
    //console.log("login data:", responseData);
    console.log("response data:", responseData);
    if(!responseData || responseData === null){
      showMessage("Connection error");
    } else{
      let loginData = responseData.data;
      if(loginData.status === "Validated" && loginData.data.username != null){
        const rep = await window.api.setUser(loginData.data.username);
        const tokenRes = await window.api.saveToken(loginData.data.token);
        const isAuthenticated = loginData.data.auth;
        await saveSecurityPasswordHash();
        if(isAuthenticated === true){ // Jeśli 2FA nie jest wymagane
          const rep2 = await window.api.loginSuccess(); // Pomyślne logowanie i zmiana ekranu na główny
        }
        setAuthenticationContent();
      } if(loginData.status === "Invalid"){
        //Błędne dane logowania
        //const labels = await getLanguagePack();
        //const message = labels.wrongPassword;
        const message = "Podano niewłaściwe dane logowania";
        showMessage(message);
      }
    }
    //console.log(ResponseData);
    
  } else {
    //Nie podano danych logowania
    //const labels = await getLanguagePack();
    //const message = labels.lackOfLoginDetails;
    const message = "Dane logowania nie zostały podane";
    showMessage(message);
  }
}

async function saveSecurityPasswordHash(){
  let response = await window.api.getSecurityPasswordHash();
  return response;
}

// Wysłanie danych logowania
async function loginRequest(email, password, url){
  let result = await window.api.sendLoginRequest(email, password);
  return result;
  /*
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
      showMessage("Connection error");
      throw new Error(`Błąd API: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch(error){
    showMessage("Connection error");
    console.error("Błąd pobierania klucza.", error);
    return null;
  }
  */
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
      //const labels = await getLanguagePack();
      //const message = labels.wrongAuthKey;
      const message = "Podany kod jest nieprawidłowy";
      showMessage(message);
    } else{
      const response = await authentication(authCode);
      const authStatus = response.auth;
      console.log("Auth response: ", authStatus);
      if(authStatus==="success"){
        const rep2 = await window.api.loginSuccess(); // Pomyślne logowanie i zmiana ekranu na główny
      } else{
        //Podano zły klucz autoryzacji
        //const labels = await getLanguagePack();
        //const message = labels.wrongAuthKey;
        const message = "Podany kod jest nieprawidłowy";
        showMessage(message);
      }
    }
  });

  // 2FA
  async function authentication(authCode){
    let result = await window.api.sendAuthenticationCode(authCode);
    return result.data;

    /*
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
    */
  }

  async function creatingAccount(){
    //const responseUrl = await window.api.loadApiConfig();
    //const url = responseUrl.config.creatingAccount;
    
    const email = document.getElementById("creatingAcc-email-input").value.trim();
    const name = document.getElementById("creatingAcc-name-input").value.trim();
    const passwordTemp = document.getElementById("creatingAcc-passwordinput").value.trim();
    const passSize = passwordTemp.length;
    if(passSize > 6){
      if(email !== "" && name !== "" && passwordTemp !== ""){
      const password = await window.api.hashPassword(passwordTemp);
      let result = await window.api.createUserAccount(email, name, password);
      let data = result.data;
      /*
      const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
          email: email,
          name: name,
          password: password
        })
      });
    const data = await response.json();
    */
    if(data.status==="emptyForm"){
      //Nie wypełniono całego formularza
      //const labels = await getLanguagePack();
      //const message = labels.creatingAccountEmptyForm;
      const message = "Nie podano wszystkich danych";
      showMessage(message);
  } else if(data.status==="alreadyExist"){
    //Email jest już zajęty
    //const labels = await getLanguagePack();
    //const message = labels.creatingAccountAlreadyExist;
    const message = "Email jest już użyty";
    //console.log(labels);
    showMessage(message);
  } else if(data.status==="accountCreated"){
    //Konto zostało utworzone
    //const labels = await getLanguagePack();
    //const message = labels.creatingAccountAccountCreated;
    const message = "Konto zostało utowrzone";
    showMessage(message);
    setLoginContent();
  }
    } else{
      //Nie wypełniono całego formularza
      //const labels = await getLanguagePack();
      //const message = labels.creatingAccountEmptyForm;
      const message = "Nie podano wszystkich danych";
      showMessage(message);
    }
  } else{
    //Hasło jest zbyt krótkie
    //const labels = await getLanguagePack();
    //const message = labels.toShortPassword;
    const message = "Hasło jest zbyt krótkie. (Minimum 6 znaków)";
    showMessage(message);
  }
    
  }

  //Zawsze chowaj powiadomienie po wciśnięciu lewego przycisku
  document.addEventListener("click", ()=>{
    hideMessage();
  });

  //Obsługa przycisku zatwierdzenia utworzenia nowego konta
  document.getElementById("new-account-confirm-button").addEventListener("click", ()=>{
    creatingAccount();
  });


  // Obsługa przycisku przejścia do tworzenia nowego konta
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
    clearInputsRegistration();
  }

  // Zmiana zawartości okna na logowanie
  function setLoginContent(){
    hideAuthenticationContent();
    hideCreatingAccountContent();
    showLoginContent();
    clearInputsLogin();
  }

  // Zmiana zawartości okna na weryfikację
  function setAuthenticationContent(){
    hideCreatingAccountContent();
    hideLoginContent();
    showAuthenticationContent();
    clearInputsAuthentication();
  }

  //Wyczyść inputy Logowanie
  function clearInputsLogin(){
    document.getElementById("email").value="";
    document.getElementById("password").value="";
  }

  //Wyczyść inputy Zakładanie konta
  function clearInputsRegistration(){
    document.getElementById("creatingAcc-email-input").value="";
    document.getElementById("creatingAcc-name-input").value="";
    document.getElementById("creatingAcc-passwordinput").value="";
  }

  //Wyczyść inputy Weryfikacja
  function clearInputsAuthentication(){
    document.getElementById("auth-input").value="";
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

  //pokaż powiadomienie
  function showMessage(text){
    //document.getElementById("message-container").style.display="block";
    const msgBox = document.querySelector(".message-container");
    msgBox.classList.add("show");
    document.getElementById("message").textContent=text;
  }

  //ukryj powiadomienie
  function hideMessage(){
    const msgBox = document.querySelector(".message-container");
    msgBox.classList.remove("show");
    //document.getElementById("message-container").style.display="none";
  }