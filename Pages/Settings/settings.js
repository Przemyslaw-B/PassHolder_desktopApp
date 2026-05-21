let userAuthMethode;
let allAuthMethodes;
let message;
let userPhone;

const prefixes = [
    { country: "Polska", code: "+48" },
    { country: "Niemcy", code: "+49" },
    { country: "Francja", code: "+33" },
    { country: "Hiszpania", code: "+34" },
    { country: "Włochy", code: "+39" },
    { country: "Holandia", code: "+31" },
    { country: "Belgia", code: "+32" },
    { country: "Czechy", code: "+420" },
    { country: "Słowacja", code: "+421" },
    { country: "Litwa", code: "+370" },
    { country: "Łotwa", code: "+371" },
    { country: "Estonia", code: "+372" },
    { country: "Austria", code: "+43" },
    { country: "Szwajcaria", code: "+41" },
    { country: "Szwecja", code: "+46" },
    { country: "Norwegia", code: "+47" },
    { country: "Dania", code: "+45" },
    { country: "Finlandia", code: "+358" },
    { country: "Irlandia", code: "+353" },
    { country: "Portugalia", code: "+351" },
    { country: "Grecja", code: "+30" },
    { country: "Rumunia", code: "+40" },
    { country: "Bułgaria", code: "+359" },
    { country: "Ukraina", code: "+380" },
    { country: "Wielka Brytania", code: "+44" }
];

document.addEventListener("DOMContentLoaded", () => {
  const settingsContainer = document.getElementById("settings-content");
  // pobierz treść z home.html i wstaw do kontenera
  fetch("../Settings/settings.html")
    .then(res => res.text())
    .then(html => {
      settingsContainer.innerHTML = html;
      setPrefixSelectorOptions();
      getAllMethodeList();
      getUserAuthMethode();
      settingsInit();
      confirmPhoneModalButtonsInit();
      phoneNumberInputFormat();
      setEditAuthMethodeButton()

      logoutButtonInit();

      authVerifyModalInit();
      

      /*
      //Obsługa suwaka od rotacji
      const rotationSelect = document.getElementById("rotation");
     rotationSelect.addEventListener("change", async ()=>{
      const newValue = parseInt(rotationSelect.value, 10);
      console.log("Wybrano rotację:", newValue);
      await saveNewRotationTime(newValue);  //zapis do BD
    });
    loadCurrentRotationTimeValue();
    */
    });
});

async function settingsInit(){
  if(!userAuthMethode){
    await getUserAuthMethode();
  }
  const userSelectedAuthMethode = document.getElementById("selected-auth-methode");
  userSelectedAuthMethode.value = userAuthMethode;
  userSelectedAuthMethode.textContent = userAuthMethode;

  /*
  const authMethodeSelect = document.getElementById("auth-methode");
  authMethodeSelect.replaceChildren();
  const placeholder = new Option("Metoda autoryzacji", "", true, true);
  placeholder.disabled = true;
  placeholder.hidden = true;
  authMethodeSelect.appendChild(placeholder);
  if(allAuthMethodes && allAuthMethodes.length>0){
    for(let methode of allAuthMethodes){
      console.log("metoda:", methode);
      const option = document.createElement("option");
      option.value = methode;
      option.textContent = methode;
      authMethodeSelect.appendChild(option);
    }
  }
  //przypisanie wartości usera
  authMethodeSelect.value = userAuthMethode;
  */
}

async function getAllMethodeList(){
  let result = await window.api.getAllAuthMethodes();
  allAuthMethodes = result.data;
}

async function getUserAuthMethode(){
  let result = await window.api.getUserAuthMethode();
  userAuthMethode = result.data;
  //console.log("user auth methode:", userAuthMethode);
}

async function getUserNumber(){

}

function setEditAuthMethodeButton(){
  const button = document.getElementById("change-authMethode-button");
  button.addEventListener("click", ()=>{
    const confirmEditByPassModal = document.getElementById("settings-auth-verify-modal"); 
    confirmEditByPassModal.classList.remove("hidden");
    const messageBox = document.getElementById("settings-auth-verify-modal-message-space");
    messageBox.classList.add("hidden");
  });
}

async function setPhoneNumberButton(){
  const button = document.getElementById("settings-add-number");
  const input = document.getElementById("settings-phone-input").value;
}

async function editPhoneNumberButton(){
  const button = document.getElementById("settings-edit-number");
}

function confirmPhoneModalButtonsInit(){
  let cancelButton = document.getElementById("phone-confirm-modal-cancel-button");
  let confirmButton = document.getElementById("phone-confirm-modal-confirm-button");

  cancelButton.addEventListener("click", ()=>{
    const modal = document.getElementById("phone-confirm-modal");
    modal.classList.add("hidden");
    let input = document.getElementById("phone-confirm-modal-secure-code");
    input.value = "";
  });

  confirmButton.addEventListener("click", async ()=>{
    //TODO wysyłanie kodu weryfikacyjnego
  });
} 


function phoneNumberInputFormat(){
  const phoneInput = document.getElementById("settings-phone-input");
  phoneInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.substring(0, 9);
    if(value.length > 6){
        value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1 $2 $3");
    }
    else if(value.length > 3){
        value = value.replace(/(\d{3})(\d{1,3})/, "$1 $2");
    }
    e.target.value = value;
  });
}

function authVerifyModalInit(){
  const cancelButton = document.getElementById("settings-auth-verify-modal-cancel-button");
  const confirmButton = document.getElementById("settings-auth-verify-confirm-button");

  cancelButton.addEventListener("click", ()=>{
    const verifyModal = document.getElementById("settings-auth-verify-modal");
    const input = document.getElementById("settings-auth-verify-modal-password-input");
    input.value="";
    verifyModal.classList.add("hidden");

  });

  confirmButton.addEventListener("click", async()=>{
     const passBox = document.getElementById("settings-auth-verify-modal-password-input");
    const passValue = passBox.value;
    const messageBox = document.getElementById("settings-auth-verify-modal-message-space");
    const messageContent = document.getElementById("settings-auth-verify-modal-message-content");
    messageBox.classList.add("hidden");
    if(passValue && passValue.length>0){
      const hashPass = await window.api.hashPassword(passValue);
      let result = await window.api.authMethodeChangeValidateUser(hashPass);
      if(result && result.success){
        const verifyModal = document.getElementById("settings-auth-verify-modal");
        passBox.value = "";
        verifyModal.classList.add("hidden");
        await showAuthMethodeChangeModal();
      }
      messageContent.textContent = "Podano nieprawidłowe hasło."; 
      messageBox.classList.remove("hidden");
    } else{
      messageContent.textContent = "Pole nie może być puste."; 
      messageBox.classList.remove("hidden");
    }
  
  });
}

async function showAuthMethodeChangeModal(){
  const changingAuthModal = document.getElementById("authMethode-change-modal");
  changingAuthModal.classList.remove("hidden");

  document.getElementById("authMethode-change-modal-email-input").value="";
  document.getElementById("authMethode-change-modal-sms-input").value="";
  document.getElementById("authMethode-change-modal-totp-input").value="";

  const messageBox = document.getElementById("authMethode-change-modal-message-space");
  messageBox.classList.add("hidden");
  const messageContent = document.getElementById("authMethode-change-modal-message-content");
  messageContent.textContent="";
  await getAllMethodeList();
  await authMethodeSelectorInit();

  const cancelButton = document.getElementById("authMethode-change-modal-button-cancel");
  const confirmButton = document.getElementById("authMethode-change-modal-button-confirm");

  cancelButton.addEventListener("click", ()=>{
    hideAuthMethodeChangeModal();
  });

  confirmButton.addEventListener("click", async ()=>{
    let result = validateNewAuthMethodeCode();
    if(result && result.success){
      hideAuthMethodeChangeModal();
      //TODO RELOAD OPTION CONTENT!!!!!!!!!!!
    } else{
      messageBox.classList.remove("hidden");
      messageContent.textContent = "Podany kod jest nieprawidłowy.";
    }
  });
}

async function validateNewAuthMethodeCode(){
  const selector = document.getElementById("auth-methode-selector");
  const selectorVal = selector.value;
  let userCode= "";
  const userCodeMail = document.getElementById("authMethode-change-modal-email-input").value;
  const userCodeSms = document.getElementById("authMethode-change-modal-sms-input").value;
  const userCodeTotp = document.getElementById("authMethode-change-modal-totp-input").value;
  if(userCodeMail){
    userCode = userCodeMail;
  } else if(userCodeSms){
    userCode = userCodeSms;
  } else{
    userCode = userCodeTotp
  }
  let result = await window.api.activateNewAuthMethode(selectorVal, userCode);
  return result
}

function hideAuthMethodeChangeModal(){
  const messageBox = document.getElementById("authMethode-change-modal-message-space");
  messageBox.classList.add("hidden");
  const messageContent = document.getElementById("authMethode-change-modal-message-content");
  messageContent.textContent="";
  const changingAuthModal = document.getElementById("authMethode-change-modal");
  changingAuthModal.classList.add("hidden");
}

async function authMethodeSelectorInit(){
  if(!allAuthMethodes){
    await getAllMethodeList();
  }
  const authMethodeSelect = document.getElementById("auth-methode-selector");
  authMethodeSelect.replaceChildren();
  const placeholder = new Option("Metoda autoryzacji", "", true, true);
  placeholder.disabled = true;
  placeholder.hidden = true;
  authMethodeSelect.appendChild(placeholder);
  if(allAuthMethodes && allAuthMethodes.length>0){
    for(let methode of allAuthMethodes){
      //console.log("metoda:", methode);
      if(methode==="sms"){
        if(userPhone){
          const option = document.createElement("option");
          option.value = methode;
          option.textContent = methode;
          authMethodeSelect.appendChild(option);
        }
      } else{
        const option = document.createElement("option");
        option.value = methode;
        option.textContent = methode;
        authMethodeSelect.appendChild(option);
      }
    }
  }
  //przypisanie wartości usera
  authMethodeSelect.value = userAuthMethode;

  authMethodeSelect.addEventListener("change", async (e)=>{
    await handleAuthMethodeChange(e.target.value);
  });
}

async function handleAuthMethodeChange(selectedValue){
  const emailDiv = document.getElementById("authMethode-change-modal-email");
  const phoneDiv = document.getElementById("authMethode-change-modal-phone");
  const totpDiv = document.getElementById("authMethode-change-modal-TOTP");
  emailDiv.classList.add("hidden");
  phoneDiv.classList.add("hidden");
  totpDiv.classList.add("hidden");

  await sendNewAuthMethodeActivationCode(selectedValue);
  if(userAuthMethode !== selectedValue){
    switch(selectedValue){
    case "mail":
        emailDiv.classList.remove("hidden");
        break;

    case "sms":
      phoneDiv.classList.remove("hidden");
      break;

    case "google authenticator":
      totpDiv.classList.remove("hidden");
      break;
   }
  }
}

function logoutButtonInit(){
  let logoutButton = document.getElementById("logout-button");
  logoutButton.addEventListener("click", ()=>{
    window.api.logout();
  });
}

function setPrefixSelectorOptions(){
  const prefixSelect = document.getElementById("phone-number-prefix");
  prefixes.forEach(item => {
    const option = document.createElement("option");
    option.value = item.code;
    option.textContent = `${item.country} (${item.code})`;
    // domyślnie wybrana Polska
    if(item.code === "+48"){
        option.selected = true;
    }
    prefixSelect.appendChild(option);
});
}

async function sendNewAuthMethodeActivationCode(methode){
  if(methode){
    let result = await window.api.sendNewAuthActivationCode(methode);
  }
}


