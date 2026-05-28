let email;
let authMethod;

window.addEventListener('DOMContentLoaded', async ()=>{
  document.getElementById('loginButton').addEventListener('click', async ()=>loginValidation());
  loginButtonsInit();
  await setLoginContent();
});

// Walidacja użytkownika
async function loginValidation(){
  if (!window.api || !window.api.loadApiConfig) {
    console.error('window.api nie jest dostępne');
    return;
  }

  email = document.getElementById('email').value;
  const passwordTemp = document.getElementById('password').value;

  if(email != null && passwordTemp != null && email !== "" && passwordTemp !== ""){
    // Szyfrowanie wpisanego hasła
    const password = await window.api.hashPassword(passwordTemp);
    //Wysyłanie danych do API
    const responseData = await loginRequest(email, password);
    //console.log("responseData login request:", responseData);
    if(!responseData || responseData === null){
      showMessage("Connection error");
    } else{
      let loginData = responseData.data;
      if(loginData.status === "Validated"){
        setAuthenticationContent();
      } else if(loginData.status === "Invalid"){
        //Błędne dane logowania
        const message = "Podano niewłaściwe dane logowania";
        showMessage(message);
      }
    }
  } else {
    //Nie podano danych logowania
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
  authMethod = result.data.authMethode;
  //qrCode = result.data.qrCode;
  //console.log("zapisany qrCode:", qrCode);
  return result;
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

// 2FA
async function authentication(authCode){
  let result = await window.api.sendAuthenticationCode(email, authCode);
  if(result.success===false && result.data.error){
  console.log("Authentication error:", result.data.error);
  return;
  }
  console.log("authentication result:", result);
  return result.data;
}

  async function creatingAccount(){
    const email = document.getElementById("creatingAcc-email-input").value.trim();
    const name = document.getElementById("creatingAcc-name-input").value.trim();
    const passwordTemp = document.getElementById("creatingAcc-passwordinput").value.trim();
    const passSize = passwordTemp.length;
    if(passSize > 6){
      if(email !== "" && name !== "" && passwordTemp !== ""){
      const password = await window.api.hashPassword(passwordTemp);
      let result = await window.api.createUserAccount(email, name, password);
      let data = result.data;
    if(data.status==="emptyForm"){
      //Nie wypełniono całego formularza
      const message = "Nie podano wszystkich danych";
      showMessage(message);
  } else if(data.status==="alreadyExist"){
    //Email jest już zajęty
    const message = "Email jest już użyty";
    //console.log(labels);
    showMessage(message);
  } else if(data.status==="accountCreated"){
    //Konto zostało utworzone
    const message = "Konto zostało utowrzone";
    showMessage(message);
    await setLoginContent();
  }
    } else{
      //Nie wypełniono całego formularza
      const message = "Nie podano wszystkich danych";
      showMessage(message);
    }
  } else{
    //Hasło jest zbyt krótkie
    const message = "Hasło jest zbyt krótkie. (Minimum 6 znaków)";
    showMessage(message);
  }
}

  // Zmiana zawartości okna na Tworzenie konta
  function setCreatingAccountContent(){
    hideLoginContent();
    hideAuthenticationContent();
    showCreatingAccountContent();
    clearInputsRegistration();
  }

  // Zmiana zawartości okna na logowanie
  async function setLoginContent(){
    hideAuthenticationContent();
    hideCreatingAccountContent();
    showLoginContent();
    clearInputsLogin();
    await showAppVersion();
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
  async function showAuthenticationContent(){
    document.querySelector(".auth-container").style.display="block";
    const authDescribtion = document.getElementById("auth-explain");
    if(authMethod === 1){
      authDescribtion.textContent = "Kod weryfikacyjny został wysłany na Twój email.";
    } else if(authMethod===2){
      authDescribtion.textContent = "Kod weryfikacyjny został wysłany na przypisany numer telefonu.";
    } else if(authMethod === 3){
      authDescribtion.textContent = "Podaj kod weryfikacyjny z aplikacji do autoryzacji.";
    } else {
      authDescribtion.textContent = "Kod weryfikacyjny został wysłany.";
    }
  }

  //pokaż powiadomienie
  function showMessage(text){
    const msgBox = document.querySelector(".message-container");
    msgBox.classList.add("show");
    document.getElementById("message").textContent=text;
  }

  //ukryj powiadomienie
  function hideMessage(){
    const msgBox = document.querySelector(".message-container");
    msgBox.classList.remove("show");
  }

  async function showAppVersion(){
    let result = await window.api. getAppVersion();
    console.log("version:", result)
    if(result && result.success===true && result.data){
      let versionContent = document.getElementById("login-version-content");
      versionContent.textContent = result.data;
    }
    return;
  } 

  function loginButtonsInit(){
  // Przycisk wysłania weryfikacji 2FA
  document.getElementById("auth-confirm-button").addEventListener("click", async () => {
    const authCode = document.getElementById("auth-input").value.trim();
    if(authCode==="" || authCode.length != 6){
      const message = "Podany kod jest nieprawidłowy";
      showMessage(message);
    } else{
      const response = await authentication(authCode);
      const authStatus = response.auth;
      if(response && authStatus==="success"){
        const rep = await window.api.setUser(response.data.username); //zapisz zalogowanego usera
        const tokenRes = await window.api.saveToken(response.data.token); //zapisz token
        await saveSecurityPasswordHash();
        const rep2 = await window.api.loginSuccess(); // Pomyślne logowanie i zmiana ekranu na główny
      } else{
        //Podano zły klucz autoryzacji
        const message = "Podany kod jest nieprawidłowy";
        showMessage(message);
      }
    }
  });
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
  document.getElementById("new-account-cancel-button").addEventListener("click", async ()=>{
    await setLoginContent();
  });

  // Obsługa powrotu z weryfikacji do ekranu logowania
  document.getElementById("auth-cancel-button").addEventListener("click", async ()=>{
    await setLoginContent();
  });

  }


  