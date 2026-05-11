
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

async function getAllMethodeList(){
  let result = await window.api.getAllAuthMethodes();
  allAuthMethodes = result.data;
  //console.log("all auth methodes:", allAuthMethodes);
}

async function getUserAuthMethode(){
  let result = await window.api.getUserAuthMethode();
  userAuthMethode = result.data;
  //console.log("user auth methode:", userAuthMethode);
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

