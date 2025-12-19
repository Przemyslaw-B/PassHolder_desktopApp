document.addEventListener("DOMContentLoaded", () => {
  const homeContainer = document.getElementById("home-content");

  // pobierz treść z home.html i wstaw do kontenera
  fetch("../Home/home.html")
    .then(res => res.text())
    .then(html => {
      homeContainer.innerHTML = html;
    });
});