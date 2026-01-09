document.addEventListener("DOMContentLoaded", () => {
  const settingsContainer = document.getElementById("settings-content");
  // pobierz treść z home.html i wstaw do kontenera
  fetch("../Settings/settings.html")
    .then(res => res.text())
    .then(html => {
      settingsContainer.innerHTML = html;
      
      //Obsługa suwaka od rotacji
      const rotationSelect = document.getElementById("rotation");
     rotationSelect.addEventListener("change", async ()=>{
      const newValue = parseInt(rotationSelect.value, 10);
      console.log("Wybrano rotację:", newValue);
      await saveNewRotationTime(newValue);  //zapis do BD
    });
    loadCurrentRotationTimeValue();
    });
});

async function saveNewRotationTime(newTime){
  await window.api.rotationTimeUpdate(newTime);
}

async function loadCurrentRotationTimeValue(){
  const val = await window.api.getRotationTime();
  const rotationSelect = document.getElementById("rotation");
  if(val && rotationSelect){
    rotationSelect.value = val.toString();
  }
}

