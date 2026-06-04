let userAuthMethode;
let allAuthMethodes;
let message;
let userPhone;
let userTempPhone;
let haveSecPass;
let qrCode;

let oldSecPass;
let newSecPass;

let passwordAttempt=0;
let passwordAttemptTimer;

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
    .then(async html => {
      settingsContainer.innerHTML = html;
      await haveSecurityPassword();
      setPrefixSelectorOptions();
      await loadSettings();
      await getAllMethodeList();
      //getAllMethodeList();
      //getUserAuthMethode();
      await settingsInit();
      confirmPhoneModalButtonsInit();
      phoneNumberInputFormat();
      setEditAuthMethodeButton()
      logoutButtonInit();
      authVerifyModalInit();
      authMethodeButtonsInit();
      setPhoneNumberButton();
      editPhoneNumberButton();
      securityPassResetButton();
      securityPassResetModalButtons();
      securityPassRemoveButton();
      seucrityPassRemoveModalButtons();
      await authMethodeSelectorInit();  
    });
});

async function loadSettings(){
  userPhone=null;
  userAuthMethode=null;
  await getUserAuthMethode();
  await getUserNumber();
  const userPhoneSpan = document.getElementById("settings-phone-number");
  const editPhoneButton = document.getElementById("settings-edit-number");
  const addPhoneButton = document.getElementById("settings-add-number");
  if(userPhone && userPhone !== ""){
    userPhoneSpan.textContent = anonimate(userPhone);
    addPhoneButton.classList.add("hidden");
    editPhoneButton.classList.remove("hidden");
  } else {
    userPhoneSpan.textContent = "";
    editPhoneButton.classList.add("hidden");
    addPhoneButton.classList.remove("hidden");
  }
  const userActiveAuthMethode = document.getElementById("selected-auth-methode");
  userActiveAuthMethode.textContent = userAuthMethode;

  const securityPassSpace = document.getElementById("security-password-reset-space");
  if(haveSecPass && haveSecPass===true){
    securityPassSpace.classList.remove("hidden");
  } else{
    securityPassSpace.classList.add("hidden");
  }
}

async function settingsInit(){
  if(!userAuthMethode){
    await getUserAuthMethode();
  }
  if(!userPhone){
    await getUserNumber();
  }
  const userSelectedAuthMethode = document.getElementById("selected-auth-methode");
  userSelectedAuthMethode.value = userAuthMethode;
  userSelectedAuthMethode.textContent = userAuthMethode;
}

async function getAllMethodeList(){
  let result = await window.api.getAllAuthMethodes();
  allAuthMethodes = result.data;
}

async function getUserAuthMethode(){
  let result = await window.api.getUserAuthMethode();
  userAuthMethode = result.data;
}

async function getUserNumber(){
  let result = await window.api.getUserPhone();
  console.log("GetUserNumber:", result);
  if(result && result.success){
    let phone = result.data.data.phone;
    if(phone && phone.length>5){
      userPhone = phone;
      let anonimePhone = anonimate();
      let userPhoneOption = document.getElementById("settings-phone-number");
      userPhoneOption.textContent=anonimePhone;
      //TODO ukryj przycisk dodania numeru
      //TODO pokaż przycisk edycji numeru
    } else{
      //TODO jeśli nie ma numeru pokaż przycisk jego dodania
    }
    return;
  }
  console.log("getUserPhone error:", result.error);
  return;
}

function setEditAuthMethodeButton(){
  const button = document.getElementById("change-authMethode-button");
  if(!button){
    return;
  }
  button.addEventListener("click", ()=>{
    const confirmEditByPassModal = document.getElementById("settings-auth-verify-modal"); 
    confirmEditByPassModal.classList.remove("hidden");
    const messageBox = document.getElementById("settings-auth-verify-modal-message-space");
    messageBox.classList.add("hidden");
  });
}

function setPhoneNumberButton(){
  const addNewPhonebutton = document.getElementById("settings-add-number");
  addNewPhonebutton.addEventListener("click", ()=>{
    console.log("Otwieram modal dodawania numeru");
    const newPhoneModal = document.getElementById("phone-confirm-modal");
    newPhoneModal.classList.remove("hidden");
  });
}

function editPhoneNumberButton(){
  const editPhoneButton = document.getElementById("settings-edit-number");
  editPhoneButton.addEventListener("click", ()=>{

  });
}

function confirmPhoneModalButtonsInit(){
  let cancelButton = document.getElementById("phone-confirm-modal-cancel-button");
  let confirmButton = document.getElementById("phone-confirm-modal-confirm-button");
  let confirmSetNumberButton = document.getElementById("phone-set-number-modal-send-code-button");
  let setNumberCancelButton = document.getElementById("phone-set-number-modal-cancel-button");

  cancelButton.addEventListener("click", ()=>{
    const modal = document.getElementById("phone-confirm-modal");
    modal.classList.add("hidden");
    let input = document.getElementById("phone-confirm-modal-secure-code");
    input.value = "";
    const contentSetNumber = document.getElementById("phone-set-number-modal-content");
    contentSetNumber.classList.remove("hidden");
    const contentConfirmNumber = document.getElementById("phone-confirm-modal-content");
    contentConfirmNumber.classList.add("hidden");
  });

  setNumberCancelButton.addEventListener("click", ()=>{
    const modal = document.getElementById("phone-confirm-modal");
    modal.classList.add("hidden");
    let input = document.getElementById("phone-confirm-modal-secure-code");
    input.value = "";
    const contentSetNumber = document.getElementById("phone-set-number-modal-content");
    contentSetNumber.classList.remove("hidden");
    const contentConfirmNumber = document.getElementById("phone-confirm-modal-content");
    contentConfirmNumber.classList.add("hidden");
  });

  confirmSetNumberButton.addEventListener("click", async ()=>{
    let userInput = document.getElementById("settings-phone-input");
    let prefix = document.getElementById("phone-number-prefix");
    if(!userInput || !prefix){
      return;
    }

    userTempPhone = `${prefix.value} ${userInput.value}`;
    userInput.value="";
    let setNumberBox = document.getElementById("phone-set-number-modal-content");
    let activateNumberBox = document.getElementById("phone-confirm-modal-content");
    let userCodeInput = document.getElementById("phone-confirm-modal-secure-code");
    userCodeInput.value="";
    setNumberBox.classList.add("hidden");
    activateNumberBox.classList.remove("hidden");
    await window.api.requestPhoneCode(userTempPhone);
  });

  confirmButton.addEventListener("click", async ()=>{
    let message = document.getElementById("phone-confirm-modal-message");
    message.classList.add("hidden");
    let inputCode = document.getElementById("phone-confirm-modal-secure-code");
    let codeVal = inputCode.value;
    if(codeVal.length === 6){
      let result = await window.api.activatePhone(userTempPhone, codeVal);
      if(result && result.success===true){
        await loadSettings();
        const phoneModal = document.getElementById("phone-confirm-modal");
        phoneModal.classList.add("hidden");
      }
    }
    message.classList.remove("hidden");
    message.textContent = "Nieprawidłowy kod."
  });
} 


function phoneNumberInputFormat(){
  const phoneInput = document.getElementById("settings-phone-input");
  if(!phoneInput){
    return;
  }
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
      if(passwordAttempt<5){
        if(result && result.success){
        passwordAttempt=0;
        const verifyModal = document.getElementById("settings-auth-verify-modal");
        passBox.value = "";
        verifyModal.classList.add("hidden");
        await showAuthMethodeChangeModal();
      } else{
        messageContent.textContent = "Podano nieprawidłowe hasło."; 
        messageBox.classList.remove("hidden");
        passwordSettingAttempt();
      }
      } else{
        messageContent.textContent = "Zbyt wiele prób. Proszę spróbować później."; 
        messageBox.classList.remove("hidden");
      }
    } else{
      messageContent.textContent = "Pole nie może być puste."; 
      messageBox.classList.remove("hidden");
    }
  });
}

function passwordSettingAttempt(){
  passwordAttempt+=1;
  if(passwordAttempt >= 5){
    clearTimeout(passwordAttemptTimer);
    passwordAttemptTimer = setTimeout(()=>{
      passwordAttempt = 0;
      let messageBox = document.getElementById("settings-auth-verify-modal-message-space");
      messageBox.classList.add("hidden");
    }, 2 * 60 * 1000); // 2 minuty
  }
}

async function showAuthMethodeChangeModal(){
  hideAuthMethodeChangeCodeEnter();
  const methodeSelector = document.getElementById("auth-methode-selector");
  methodeSelector.value= userAuthMethode;

  const methodeSelectorSpace = document.getElementById("authMethode-change-modal-select-space");
  methodeSelectorSpace.classList.remove("hidden");

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

}

async function authMethodeButtonsInit(){
  const typeSelectCancelButton = document.getElementById("authMethode-change-modal-type-button-cancel");
  const typeSelectConfirmButton = document.getElementById("authMethode-change-modal-type=button-confirm");

  typeSelectCancelButton.addEventListener("click", ()=>{
    hideAuthMethodeChangeModal();
  });

  typeSelectConfirmButton.addEventListener("click", async ()=>{
    const typeSelectButtonsSpace = document.getElementById("authMethode-change-modal-type-select-button-space");
    const confirmMethodButtonsSpace = document.getElementById("authMethode-change-modal-buttons-space");
    typeSelectButtonsSpace.classList.add("hidden");
    confirmMethodButtonsSpace.classList.remove("hidden");
    const methodeSelectorSpace = document.getElementById("authMethode-change-modal-select-space");
    const selectedValue = document.getElementById("auth-methode-selector").value;
    if(selectedValue){
      await sendNewAuthMethodeActivationCode(selectedValue);
      methodeSelectorSpace.classList.add("hidden");
      await handleAuthMethodeChange(selectedValue);
    }
  });

  const cancelButton = document.getElementById("authMethode-change-modal-button-cancel");
  const confirmButton = document.getElementById("authMethode-change-modal-button-confirm");
  cancelButton.addEventListener("click", ()=>{
    hideAuthMethodeChangeModal();
  });
  confirmButton.addEventListener("click", async ()=>{
  let result = await validateNewAuthMethodeCode();
  await loadSettings();
  //console.log("code validation?", result);
  if(result?.success===true){
    hideAuthMethodeChangeModal();
  } else{
    const messageBox = document.getElementById("authMethode-change-modal-message-space");
    const messageContent = document.getElementById("authMethode-change-modal-message-content");
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
  hideAuthMethodeChangeCodeEnter();
  const messageBox = document.getElementById("authMethode-change-modal-message-space");
  messageBox.classList.add("hidden");
  const messageContent = document.getElementById("authMethode-change-modal-message-content");
  messageContent.textContent="";
  const changingAuthModal = document.getElementById("authMethode-change-modal");
  changingAuthModal.classList.add("hidden");

  const typeSelectButtonsSpace = document.getElementById("authMethode-change-modal-type-select-button-space");
  const confirmMethodButtonsSpace = document.getElementById("authMethode-change-modal-buttons-space");
  typeSelectButtonsSpace.classList.remove("hidden");
  confirmMethodButtonsSpace.classList.add("hidden");

  const methodeSelectorSpace = document.getElementById("authMethode-change-modal-select-space");
  methodeSelectorSpace.classList.remove("hidden");
}

async function authMethodeSelectorInit(){
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

  //authMethodeSelect.addEventListener("change", async (e)=>{
  //  await handleAuthMethodeChange(e.target.value);
  //});
}

function hideAuthMethodeChangeCodeEnter(){
  const emailDiv = document.getElementById("authMethode-change-modal-email");
  const phoneDiv = document.getElementById("authMethode-change-modal-phone");
  const totpDiv = document.getElementById("authMethode-change-modal-TOTP");
  emailDiv.classList.add("hidden");
  phoneDiv.classList.add("hidden");
  totpDiv.classList.add("hidden");
}

async function handleAuthMethodeChange(selectedValue){
  const emailDiv = document.getElementById("authMethode-change-modal-email");
  const phoneDiv = document.getElementById("authMethode-change-modal-phone");
  const totpDiv = document.getElementById("authMethode-change-modal-TOTP");
  emailDiv.classList.add("hidden");
  phoneDiv.classList.add("hidden");
  totpDiv.classList.add("hidden");

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
      await renderQrCode();
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
    if(!result?.success){
      console.error(result?.error);
    }
  }
}

function anonimate(){
  if(!userPhone || userPhone.length<6){return;}
  const visible = userPhone.slice(-3);
  let prefixLength = 3;
  const prefixes4 = [
    "+420","+421","+370","+371",
    "+372","+358","+353","+351",
    "+359","+380"
  ];
  for(const prefix of prefixes4){
    if(userPhone.startsWith(prefix)){
      prefixLength = 4;
      break;
    }
  }
  const prefix = userPhone.slice(0, prefixLength);
  const hidden = "*".repeat(userPhone.length - prefixLength - 3);
  return `${prefix} ${hidden} ${visible}`
}  

//Otwarcie modalu resetowania hasła bezpieczeństwa
function securityPassResetButton(){
  const button = document.getElementById("security-password-reset-button");
  if(!button){return;}
  button.addEventListener("click", ()=>{
    const resetModal = document.getElementById("security-pass-reset-space");
    if(!resetModal){return;}
    resetModal.classList.remove("hidden");
    const messageBox = document.getElementById("security-pass-reset-message-space");
    messageBox.classList.add("hidden");
    const resetModalInputContent = document.getElementById("security-pass-reset-input-content");
    const resetModalCodeContent = document.getElementById("security-pass-reset-code-confirm-content");
    if(!resetModalInputContent || !resetModalCodeContent){return;}
    resetModalInputContent.classList.remove("hidden");
    resetModalCodeContent.classList.add("hidden");
    const oldInput = document.getElementById("security-pass-reset-old-input");
    const newInput = document.getElementById("security-pass-reset-new-input");
    const repeatInput = document.getElementById("security-pass-reset-new-repeat-input");
    if(!oldInput || !newInput || !repeatInput){return;}
    oldInput.value="";
    newInput.value="";
    repeatInput.value="";
  });
}

//TODO
function securityPassResetModalButtons(){
  const cancelButton = document.getElementById("reset-security-pass-modal-button-cancel");
  const confirmButton = document.getElementById("reset-security-pass-modal-button-confirm");

  cancelButton.addEventListener("click", ()=>{
    const modal = document.getElementById("security-pass-reset-space");
    modal.classList.add("hidden");
  });

  confirmButton.addEventListener("click", async ()=>{
    const messageBox = document.getElementById("security-pass-reset-message-space");
    messageBox.classList.add("hidden");
    const oldInput = document.getElementById("security-pass-reset-old-input");
    const newInput = document.getElementById("security-pass-reset-new-input");
    const repeatInput = document.getElementById("security-pass-reset-new-repeat-input");
    let message = "";
    let oldValue = oldInput.value;
    let newValue = newInput.value;
    let repeatValue = repeatInput.value;
    if(!oldValue || !newValue || !repeatValue){return;}
    let compareOldPass = await window.api.compareSecurityPassword(oldValue);
    console.log("compare old Pass result:", compareOldPass);
    if(!compareOldPass || compareOldPass===false){
      message = "Niepoprawne stare hasło";
    } else if(newValue!==repeatValue){
      message = "Hasła muszą być identyczne";
    } else {
      let isPassOk = await window.api.validateNewSecurityPassword(newValue);
      if(isPassOk && isPassOk.success===true){ 
        oldSecPass = oldValue;
        newSecPass = newValue;
        const inputContent = document.getElementById("security-pass-reset-input-content");
        inputContent.classList.add("hidden");
        const codeContent = document.getElementById("security-pass-reset-code-confirm-content");
        codeContent.classList.remove("hidden");
        const codeInput = document.getElementById("security-pass-reset-code-input");
        codeInput.value="";
      } else {
        console.log("isPassOk:", isPassOk);
        message = isPassOk.message;
      }
    }
    //Pokaż wiadomość
    if(message && message.length>0){
      const messageBox = document.getElementById("security-pass-reset-message-space");
      const messageText = document.getElementById("security-pass-reset-message-span");
      console.log("message content:", message);
      messageText.value=message;
      messageBox.classList.remove("hidden");
    }
  });

  const codeCancelButton = document.getElementById("security-pass-reset-code-button-cancel");
  const codeConfirmButton = document.getElementById("security-pass-reset-code-button-confirm");

  codeCancelButton.addEventListener("click", ()=>{
    const modal = document.getElementById("security-pass-reset-space");
    modal.classList.add("hidden");
  });

  codeConfirmButton.addEventListener("click", async ()=>{
    const messageBox = document.getElementById("security-pass-reset-message-space");
    messageBox.classList.add("hidden");
    let message = "";
    const codeInput = document.getElementById("security-pass-reset-code-input");
    const codeValue = codeInput.value;
    if(codeValue.length !== 6){
      message = "nieprawidłowy kod";
    } else{
      let result = await window.api.changeSecurityPassword(newSecPass, oldSecPass, codeValue);
      console.log("change security password result:", result);
      if(result.success===false){
        message = "nieprawidłowy kod";
      }
    }
    if(message && message.length>0){
      const messageBox = document.getElementById("security-pass-reset-message-space");
      const messageText = document.getElementById("security-pass-reset-message-span");
      messageText.value=message;
      messageBox.classList.remove("hidden");
    }
  });
}

//TODO
function securityPassRemoveButton(){
  const button = document.getElementById("security-password-remove-button");
  if(!button){return;}
  button.addEventListener("click", ()=>{
    const modal = document.getElementById("security-pass-remove-space");
    modal.classList.remove("hidden");
    const modalContent = document.getElementById("security-pass-remove-confirm-content");
    modalContent.classList.remove("hidden");
    const modalContentCode = document.getElementById("security-pass-remove-code-confirm-content");
    modalContentCode.classList.add("hidden");
  });
}

function seucrityPassRemoveModalButtons(){
  const cancelButton = document.getElementById("remove-security-pass-button-cancel");
  const confirmButton = document.getElementById("remove-security-pass-button-confirm");

  cancelButton.addEventListener("click", ()=>{
    const modal = document.getElementById("security-pass-remove-space");
    modal.classList.add("hidden");
  });

  confirmButton.addEventListener("click", async ()=>{
    //TODO wysłanie kodu weryfikacyjnego
    const codeInput = document.getElementById("security-pass-remove-code-input");
    codeInput.value = "";
    const confirmContent = document.getElementById("security-pass-remove-confirm-content");
    confirmContent.classList.add("hidden");
    const codeContent = document.getElementById("security-pass-remove-code-confirm-content");
    codeContent.classList.remove("hidden");
  });

  const cancelCodeButton = document.getElementById("security-pass-remove-code-button-cancel");
  const confirmCodeButton = document.getElementById("security-pass-remove-code-button-confirm");

  cancelCodeButton.addEventListener("click", ()=>{
    const modal = document.getElementById("security-pass-remove-space");
    modal.classList.add("hidden");
  });

  confirmCodeButton.addEventListener("click", async ()=>{
    //TODO weryfikacja kodu i usunięcie hasła oraz storage

  });
}

async function haveSecurityPassword(){
  let result = await window.api.isSecurityPasswordSet();
  if(result){
    haveSecPass = result;
  }
}

async function renderQrCode(){
  const container = document.getElementById("qrCode");
    if (!container) return;
    container.innerHTML = ""; // reset
    const result = await window.api.getQrCode();
    if (!result.success) {
      console.error("QR error:", result.error);
      return;
    }
    const img = document.createElement("img");
    img.style.width = "12rem";
    img.style.height = "12rem";
    img.src = result.data;
    container.appendChild(img);
}