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
      const menuIcon = document.getElementById("showMenu"); //Import ikonki
      const sidebar = document.getElementById("sidebar");   //Import menu do rozwinięcia
      
      //Odczytaj zapisany stan menu: rozwinięte/ukryte
      if(localStorage.getItem("sidebarStatus") == "true"){
        sidebar.classList.add("active");
        document.body.classList.toggle("sidebar-open");
      }

        // Obsługa kliknięcia ikonki rozwijanego Menu
      menuIcon.addEventListener("click", ()=>{
        sidebar.classList.toggle("active");
        //zapisz status menu: rozwinięte/ukryte
        localStorage.setItem("sidebarStatus", sidebar.classList.contains("active"));
        document.body.classList.toggle("sidebar-open"); //Dodaje klasę sidebar-open aby móc jej używać do przesuwania treści po aktywacji rozwijanego menu
      });
    });
  });
