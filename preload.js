const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  //Załaduj wybrany pakiet językowy
  loadLanguage: (lang) => ipcRenderer.invoke('load-language', lang),
  //Załaduj konfigurację endpointów.
  loadApiConfig: () => ipcRenderer.invoke("load-apiConfig"),
  // Hashuj Hasło
  encryptPassword: (password, publicKey) => ipcRenderer.invoke("encrypt-password", password, publicKey),
  //Wykonaj Zapytanie do API z danymi logowania.
  sendLoginRequest: (credentials) => ipcRenderer.invoke("send-login-request", credentials),
  //Zamknij okno logowania i otwórz ekran główny.
  loginSuccess: () => ipcRenderer.send('login-success'),
  //Ustaw nazwę użytkownika
  setUser: (username) => ipcRenderer.send('set-user', username),
  //Przełączanie zakładek
  switchCard: (pageName) => ipcRenderer.send('switch-card', pageName),
  //Zapis tokenu użytkownika
  saveToken: (token) => ipcRenderer.invoke('save-token', token),
  //Odczytaj token użytkownika
  loadToken: () => ipcRenderer.invoke('load-token'),
  //Wyczyść zapisany token
  clearToken:() => ipcRenderer.invoke('clear-token'),
  //Aktualizacja danych haseł
  storageUpdate:(data) => ipcRenderer.invoke('update-storage', data)
});