const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  //Załaduj wybrany pakiet językowy
  loadLanguage: (lang) => ipcRenderer.invoke('load-language', lang),
  //Zwróć używaną paczkę językową
  getLanguagePack: () => ipcRenderer.invoke('get-language-pack'),
  //Załaduj konfigurację endpointów.
  loadApiConfig: () => ipcRenderer.invoke("load-apiConfig"),
  //Szyfruj Hasło
  encryptPassword: (password) => ipcRenderer.invoke("encrypt-password", password),
  //Odszyfruj Hasło
  decryptPassword: (password) => ipcRenderer.invoke("decrypt-password", password),
  //Hashuj hasło
  hashPassword: (password) => ipcRenderer.invoke("hash", password),
  //szyfruj hasło użytkownika
  encryptUSerPassword:(password) => ipcRenderer.invoke('encrypt-user-password', password),
  //odszyfruj hasło użytkownika
  decryptUserPassword: (password,securityPassword) => ipcRenderer.invoke('decrypt-user-password', password, securityPassword),
  
  //Wykonaj Zapytanie do API z danymi logowania.
  sendLoginRequest: (credentials) => ipcRenderer.invoke("send-login-request", credentials),
  //Zamknij okno logowania i otwórz ekran główny.
  loginSuccess: () => ipcRenderer.send('login-success'),
  //Wylogowanie
  logout: () => ipcRenderer.send('logout'),
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

  //Zapisz lokalnie hasło bezpieczeństwa
  saveSecurityPasswordToLocal: (securityPassword) => ipcRenderer.invoke('save-security-password', securityPassword),
  //zapis nowego hasła bezpieczeństwa jeśli nie istnieje
  setNewSecurityPassword: (newSecurityPassword)=> ipcRenderer.invoke('setNewSecurityPassword', newSecurityPassword),
  //Odczytaj hasło bezpieczeństwa użytkownika
  getSecurityPassword: () => ipcRenderer.invoke('get-security-password'),
  //Wyczyść zapisane hasło bezpieczeństwa
  //clearSecurityPassword: () => ipcRenderer.invoke('clear-security-password'),
  //Czy hasło bezpieczenstwa jest ustawione
  isSecurityPasswordSet: ()=> ipcRenderer.invoke('isSecurityPasswordSet'),
  // WEryfikacja spełnienia wymogów przez nowe hasło bezpieczeństwa
  validateNewSecurityPassword: (newSecurityPassword)=> ipcRenderer.invoke('validateNewSecurityPassword', newSecurityPassword),
  //Weryfikacja czy podane hasło jest prawidłowe
  validateSecurityPassword: (securityPassword)=> ipcRenderer.invoke('validateSecurityPassword', securityPassword),

  //Pobierz rekordy z lokalnej bazy danych
  getStorage:() => ipcRenderer.invoke('get-storage'),
  //Aktualizacja danych haseł
  storageUpdate:(data) => ipcRenderer.invoke('update-storage', data),
  //Usuwanie lokalnego rekordu
  removeLocalRecord:(data) => ipcRenderer.invoke('remove-storage', data),
  //Zapisanie nowego rekordu w lokalnej DB
  localStorageUpdate:(data) => ipcRenderer.invoke('save-local-storage', data),
  //Czy rotacja haseł jest włączona
  isRotationOn:() => ipcRenderer.invoke('is-rotation-on'),
  // Pobierz wartość rotation Time
  getRotationTime:() => ipcRenderer.invoke('get-rotation-time'),
  //Zwróć datę wygaśnięcia hasła
  getExpirationDate: (idPass) => ipcRenderer.invoke('get-expiration-date', idPass),
  //Zmiana ilości dni wygaśnięcia hasła
  rotationTimeUpdate:(time) => ipcRenderer.invoke('update-rotation-time', time),
  // Sprawdź czy hasło wygasło
  isPasswordExpired:(idPass) => ipcRenderer.invoke('is-password-expired', idPass)
});