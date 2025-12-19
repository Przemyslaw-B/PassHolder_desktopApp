document.addEventListener("DOMContentLoaded", () => {
  const settingsContainer = document.getElementById("settings-content");

  // pobierz treść z home.html i wstaw do kontenera
  fetch("../Settings/settings.html")
    .then(res => res.text())
    .then(html => {
      settingsContainer.innerHTML = html;
    });
});