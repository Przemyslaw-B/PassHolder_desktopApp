let activePage="storage";

function loadPage(name){
  document.querySelectorAll('.tab').forEach(tab=>{
    tab.style.display='none';
  });
  const selected = document.getElementById(name);
  if(selected){
    selected.style.display='block';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetch("../Elements/Sidebar/sidebar.html")
    .then(res => res.text())
    .then(html => {
      const container = document.getElementById("sidebar-container");   //import kontenera gdzie ma być zaimportowany fragment z sidebar
      container.innerHTML = html
      sidebarButtonsInit();
      resetIconsColor();
      const menuIcon = document.getElementById("menu-icon"); //Import ikonki
      const sidebar = document.getElementById("sidebar");   //Import menu do rozwinięcia
      //Odczytaj zapisany stan menu: rozwinięte/ukryte
      if(localStorage.getItem("sidebarStatus") == "true"){
        sidebar.classList.add("active");
        document.body.classList.toggle("sidebar-open");
      }

      // Obsługa kliknięcia ikonki rozwijanego Menu
      menuIcon.addEventListener("click", (e)=>{
        resetIconsColor();
        sidebar.classList.toggle("active");
        //zapisz status menu: rozwinięte/ukryte
        localStorage.setItem("sidebarStatus", sidebar.classList.contains("active"));
        document.body.classList.toggle("sidebar-open"); //Dodaje/usuwa klasę sidebar-open aby móc jej używać do przesuwania treści po aktywacji rozwijanego menu
      });
    });
  });

  function sidebarButtonsInit(){
    let settingsSpace = document.getElementById("settings-sidebar-space");
    let storageSpace = document.getElementById("storage-sidebar-space");
    let rolesSpace = document.getElementById("roles-sidebar-space");
    let logsSpace = document.getElementById("logs-sidebar-space");

    settingsSpace.addEventListener("click", ()=>{
      activePage="settings";
      resetIconsColor();
    });

    storageSpace.addEventListener("click", ()=>{
      activePage="storage";
      resetIconsColor();
    });

    logsSpace.addEventListener("click", ()=>{
      activePage="logs";
      resetIconsColor();
    });

    rolesSpace.addEventListener("click", ()=>{
      activePage="roles";
      resetIconsColor();
    });
  }

  function resetIconsColor(){
    let storageIcon = document.getElementById("passwords-icon");
    let settingsIcon = document.getElementById("settings-icon");
    let rolesIcon = document.getElementById("roles-icon");
    let logsIcon = document.getElementById("logs-icon");

    let storageLabel = document.getElementById("passwords-label");
    let settingsLabel = document.getElementById("settings-label");
    let rolesLabel = document.getElementById("roles-label");
    let logsLabel = document.getElementById("logs-label");

    storageIcon.classList.remove("pressed");
    storageLabel.classList.remove("pressed");

    settingsIcon.classList.remove("pressed");
    settingsLabel.classList.remove("pressed");

    rolesIcon.classList.remove("pressed");
    rolesLabel.classList.remove("pressed");

    logsIcon.classList.remove("pressed");
    logsLabel.classList.remove("pressed"); 

    if(activePage==="storage"){
      storageIcon.classList.add("pressed");
      storageLabel.classList.add("pressed");
    }
    if(activePage==="settings"){
        settingsLabel.classList.add("pressed");
        settingsIcon.classList.add("pressed");
    }
    if(activePage==="logs"){
      logsIcon.classList.add("pressed");
      logsLabel.classList.add("pressed");
    }
    if(activePage==="roles"){
      rolesIcon.classList.add("pressed");
      rolesLabel.classList.add("pressed");
    }
  }