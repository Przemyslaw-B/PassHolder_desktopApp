const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  //Załaduj wybrany pakiet językowy
  loadLanguage: (lang) => ipcRenderer.invoke('load-language', lang),
  //Zwróć paczkę używaną paczkę językową
  getLanguagePack: () => ipcRenderer.invoke('get-language-pack'),
  //Załaduj konfigurację endpointów.
  loadApiConfig: () => ipcRenderer.invoke("load-apiConfig"),
  //Szyfruj Hasło
  encryptPassword: (password) => ipcRenderer.invoke("encrypt-password", password),
  //Odszyfruj Hasło
  decryptPassword: (password) => ipcRenderer.invoke("decrypt-password", password),
  //Hashuj hasło
  hashPassword: (password) => ipcRenderer.invoke("hash", password),
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
  //Pobierz rekordy z lokalnej bazy danych
  getStorage:() => ipcRenderer.invoke('get-storage'),
  //Aktualizacja danych haseł
  storageUpdate:(data) => ipcRenderer.invoke('update-storage', data),
  //Usuwanie lokalnego rekordu
  removeLocalRecord:(data) => ipcRenderer.invoke('remove-storage', data),
  //Zapisanie nowego rekordu w lokalnej DB
  localStorageUpdate:(data) => ipcRenderer.invoke('save-local-storage', data)
});