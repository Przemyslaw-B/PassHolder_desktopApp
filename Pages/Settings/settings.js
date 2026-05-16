let userAuthMethode = null;
let allAuthMethodes = null;

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
      logoutButtonInit();

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
  if(!allAuthMethodes){
    await getAllMethodeList();
  }
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
}

async function getAllMethodeList(){
  let result = await window.api.getAllAuthMethodes();
  allAuthMethodes = result.data;
  //console.log("all auth methodes:", allAuthMethodes);
}

async function getUserAuthMethode(){
  let result = await window.api.getUserAuthMethode();
  userAuthMethode = result.data;
  console.log("user auth methode:", userAuthMethode);
}

async function getUserNumber(){

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

/*
async function saveNewRotationTime(newTime){
  await window.api.rotationTimeUpdate(newTime);
}
  */
 /*

async function loadCurrentRotationTimeValue(){
  const val = await window.api.getRotationTime();
  const rotationSelect = document.getElementById("rotation");
  if(val && rotationSelect){
    rotationSelect.value = val.toString();
  }
}
  */

