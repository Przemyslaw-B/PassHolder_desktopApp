let userAuthMethode = null;
let allAuthMethodes = null;


document.addEventListener("DOMContentLoaded", () => {
  const settingsContainer = document.getElementById("settings-content");
  // pobierz treść z home.html i wstaw do kontenera
  fetch("../Settings/settings.html")
    .then(res => res.text())
    .then(html => {
      settingsContainer.innerHTML = html;
      getAllMethodeList();
      getUserAuthMethode();
      settingsInit();
      confirmPhoneModalButtonsInit();
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

function logoutButtonInit(){
  let logoutButton = document.getElementById("logout-button");
  logoutButton.addEventListener("click", ()=>{
    window.api.logout();
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

