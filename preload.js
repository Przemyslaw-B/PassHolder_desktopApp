const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  //Załaduj wybrany pakiet językowy
  //loadLanguage: (lang) => ipcRenderer.invoke('load-language', lang),
  //Zwróć używaną paczkę językową
  //getLanguagePack: () => ipcRenderer.invoke('get-language-pack'),

  //Załaduj konfigurację endpointów.
  loadApiConfig: () => ipcRenderer.invoke("load-apiConfig"),

  //Generuj losowe hasło
  generateRandomPassword: () => ipcRenderer.invoke("generate-random-password"),

  //Szyfruj Hasło
  encryptPassword: (password) => ipcRenderer.invoke("encrypt-password", password),
  //Odszyfruj Hasło
  decryptPassword: (password) => ipcRenderer.invoke("decrypt-password", password),
  //Hashuj hasło
  hashPassword: (password) => ipcRenderer.invoke("hash", password),
  //szyfruj hasło użytkownika
  encryptUserPassword:(password, key) => ipcRenderer.invoke('encrypt-user-password', password, key),
  //odszyfruj hasło użytkownika
  decryptUserPassword: (password) => ipcRenderer.invoke('decrypt-user-password', password),

  //Pobierz listę wyszukiwanych użytkowników dla ról.
  getUsermailSearchFilter: (userMail) => ipcRenderer.invoke("get-role-usermail-search-list", userMail),
  //Pobierz listę ogólną dostępnych ról
  getAllRolesList: () => ipcRenderer.invoke("get-all-roles-list"),
  //Pobierz listę ról użytkowników
  getAllRoles: () => ipcRenderer.invoke("get-all-roles"),
  //modyfikuj rolę wybranego użytkownika na inną.
  setUserRole: (userModMail, roleName) => ipcRenderer.invoke("set-user-role", userModMail, roleName),
  //zdegraduj użytkownika do roli zwykłego usera
  removeRoleFromUser: (user) => ipcRenderer.invoke("remove-role-from-user", user),

  //Zakładanie konta użytkownika
  createUserAccount: (email, name, password) => ipcRenderer.invoke("create-user-account", email, name, password),
  
  //Wykonaj Zapytanie do API z danymi logowania.
  sendLoginRequest: (email, password) => ipcRenderer.invoke("send-login-request", email, password),
  //Wyślij kod autoryzacyjny
  sendAuthenticationCode: (email, authCode) => ipcRenderer.invoke("send-authentication-code", email, authCode),
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

  //Generuj klucz szyfrowania
  setUserPasswordsEncryptionKey: (password) => ipcRenderer.send('user-password-encryption-key', password),

  //Zapisz lokalnie hasło bezpieczeństwa
  saveSecurityPasswordToLocal: (securityPassword) => ipcRenderer.invoke('save-security-password', securityPassword),
  //zapis nowego hasła bezpieczeństwa jeśli nie istnieje
  setNewSecurityPassword: (newSecurityPassword)=> ipcRenderer.invoke('set-new-security-password', newSecurityPassword),

  //Odczytaj hash hasła bezpieczeństwa użytkownika
  getSecurityPasswordHash: () => ipcRenderer.invoke('get-security-password-hash'),
  //Odczytaj hasło bezpieczeństwa użytkownika
  getSecurityPassword: () => ipcRenderer.invoke('get-security-password'),
  //Ustaw lokalnie hasło bezpieczeństwa
  setSecurityPassword: (securityPassword) => ipcRenderer.invoke('set-security-password', securityPassword),
  //Czy należy podać hasło bezpieczeństwa
  isSecurityPasswordRequired:() => ipcRenderer.invoke('is-security-password-required'),

  //Wyczyść zapisane hasło bezpieczeństwa
  //clearSecurityPassword: () => ipcRenderer.invoke('clear-security-password'),
  //Czy hasło bezpieczenstwa jest ustawione
  isSecurityPasswordSet: ()=> ipcRenderer.invoke('is-security-password-set'),
  //Weryfikacja spełnienia wymogów przez nowe hasło bezpieczeństwa
  validateNewSecurityPassword: (newSecurityPassword)=> ipcRenderer.invoke('validateNewSecurityPassword', newSecurityPassword),
  //Weryfikuj poprawność hasła bezpieczeństwa
  validateSecurityPassword: (securityPassword) => ipcRenderer.invoke('validate-security-password', securityPassword),

  //Pobierz rekordy z lokalnej bazy danych
  getStorage:() => ipcRenderer.invoke('get-storage'),
  //Aktualizacja danych haseł
  //StorageUpdate:(data) => ipcRenderer.invoke('update-storage', data),
  //Aktualizacja danych haseł
  storageUpdate:(data) => ipcRenderer.invoke('modify-storage-record', data),
  //dodawanie nowego rekordu
  addNewStorageRecord: (data) =>ipcRenderer.invoke('add-new-storage-record', data),
  //Usuwanie rekordu z bazy
  removeStorageRecord: (recordToDelete) => ipcRenderer.invoke('remove-storage-record', recordToDelete),

  //Pobieranie danych do filtrów Logów
  getLogFiltersData: () => ipcRenderer.invoke('get-log-filters-data'),
  //Pobierz logi uwzględniając wybrane filtry
  getLogsData: (filtersData) => ipcRenderer.invoke('get-logs-data', filtersData),


  //Usuwanie lokalnego rekordu
  //removeLocalRecord:(data) => ipcRenderer.invoke('remove-storage', data),
  //Zapisanie nowego rekordu w lokalnej DB
  //localStorageUpdate:(data) => ipcRenderer.invoke('save-local-storage', data),
  //Czy rotacja haseł jest włączona
  //isRotationOn:() => ipcRenderer.invoke('is-rotation-on'),
  // Pobierz wartość rotation Time
  //getRotationTime:() => ipcRenderer.invoke('get-rotation-time'),
  //Zwróć datę wygaśnięcia hasła
  //getExpirationDate: (idPass) => ipcRenderer.invoke('get-expiration-date', idPass),
  //Zmiana ilości dni wygaśnięcia hasła
  //rotationTimeUpdate:(time) => ipcRenderer.invoke('update-rotation-time', time),
  // Sprawdź czy hasło wygasło
  //isPasswordExpired:(idPass) => ipcRenderer.invoke('is-password-expired', idPass),


  //Zweryfikuj użytkownika przy próbie zmiany metody autoryzacji
  authMethodeChangeValidateUser: (password) => ipcRenderer.invoke('auth-methode-change-validate-user', password),
  //Wyślij kod aktywacyjny do nowej metody
  sendNewAuthActivationCode: (methode) => ipcRenderer.invoke('send-new-auth-methode-activation-code', methode),
  //Aktywuj nową metodę
  activateNewAuthMethode: (methode, code) => ipcRenderer.invoke('activate-new-auth-methode', methode, code),
  // wyślij kod aktywacyjny na tel
  requestPhoneCode: (phone) => ipcRenderer.invoke('request-phone-code', phone),
  //aktywuj numer
  activatePhone: (phone,code) => ipcRenderer.invoke('activate-phone', phone,code),
  //Pobierz metodę autoryzacji użytkownika
  getUserAuthMethode: () => ipcRenderer.invoke('get-user-auth-methode'),
  //Pobierz numer telefonu usera
  getUserPhone: () => ipcRenderer.invoke('get-user-phone'),
  //pobierz wszystkie dostępne metody autoryzacji
  getAllAuthMethodes: () => ipcRenderer.invoke('get-all-auth-methodes'),

  getQrCode: () => ipcRenderer.invoke('get-qr-code'),

  getAppVersion: ()=> ipcRenderer.invoke('get-app-version')
});