(function () {
  const STORAGE = {
    logged: 'qm_admin_logged',
    login: 'qm_admin_login',
    password: 'qm_admin_password',
    preferences: 'qm_admin_preferences',
    workers: 'qm_admin_workers'
  }

  const DEFAULT_CREDENTIALS = {
    login: 'szef',
    password: 'admin'
  }

  const DEFAULT_PREFERENCES = {
    accent: 'violet',
    compactMode: false,
    showSalesStats: true
  }

  const PERMISSIONS = [
    { key: 'tasks', label: 'Dostęp do zadań' },
    { key: 'store', label: 'Zarządzanie sklepem' },
    { key: 'suppliers', label: 'Zarządzanie hurtowniami' },
    { key: 'payments', label: 'Zarządzanie płatnościami' },
    { key: 'stats', label: 'Dostęp do statystyk' },
    { key: 'account', label: 'Dostęp do konta' }
  ]

  const SECTION_DEFINITIONS = [
    { key: 'tasks', label: 'Moje zadania' },
    { key: 'store', label: 'Zarządzanie sklepem' },
    { key: 'suppliers', label: 'Zarządzanie hurtowniami' },
    { key: 'payments', label: 'Zarządzanie płatnościami (Stripe)' },
    { key: 'stats', label: 'Statystyki sprzedaży' },
    { key: 'account', label: 'Moje konto' }
  ]

  function readJson(key, fallbackValue) {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : fallbackValue
    } catch (error) {
      return fallbackValue
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  }

  function ensureDefaults() {
    if (!localStorage.getItem(STORAGE.login)) {
      localStorage.setItem(STORAGE.login, DEFAULT_CREDENTIALS.login)
    }
    if (!localStorage.getItem(STORAGE.password)) {
      localStorage.setItem(STORAGE.password, DEFAULT_CREDENTIALS.password)
    }
    if (!localStorage.getItem(STORAGE.preferences)) {
      writeJson(STORAGE.preferences, DEFAULT_PREFERENCES)
    }
    if (!localStorage.getItem(STORAGE.workers)) {
      writeJson(STORAGE.workers, [])
    }
  }

  function getCredentials() {
    ensureDefaults()
    return {
      login: localStorage.getItem(STORAGE.login) || DEFAULT_CREDENTIALS.login,
      password: localStorage.getItem(STORAGE.password) || DEFAULT_CREDENTIALS.password
    }
  }

  function authenticate(login, password) {
    const credentials = getCredentials()
    return login === credentials.login && password === credentials.password
  }

  function isLoggedIn() {
    return localStorage.getItem(STORAGE.logged) === 'true'
  }

  function login() {
    localStorage.setItem(STORAGE.logged, 'true')
  }

  function logout(redirectUrl) {
    localStorage.removeItem(STORAGE.logged)
    if (redirectUrl) {
      window.location.replace(redirectUrl)
    }
  }

  function requireLogin(redirectUrl) {
    ensureDefaults()
    if (!isLoggedIn()) {
      window.location.replace(redirectUrl || '/public/panel/login-admin.html')
      return false
    }
    return true
  }

  function updateCredentials(loginValue, passwordValue) {
    localStorage.setItem(STORAGE.login, loginValue)
    localStorage.setItem(STORAGE.password, passwordValue)
  }

  function getPreferences() {
    ensureDefaults()
    return Object.assign({}, DEFAULT_PREFERENCES, readJson(STORAGE.preferences, {}))
  }

  function savePreferences(preferences) {
    writeJson(STORAGE.preferences, Object.assign({}, DEFAULT_PREFERENCES, preferences))
  }

  function getAccentValue(accent) {
    return {
      violet: '#7c3aed',
      emerald: '#10b981',
      amber: '#f59e0b'
    }[accent] || '#7c3aed'
  }

  function applyPreferences(root) {
    const preferences = getPreferences()
    const target = root || document.documentElement
    target.style.setProperty('--qm-accent', getAccentValue(preferences.accent))
    document.body.classList.toggle('is-compact', Boolean(preferences.compactMode))
    return preferences
  }

  function getWorkers() {
    ensureDefaults()
    return readJson(STORAGE.workers, []).map(function (worker) {
      return {
        id: worker.id,
        name: worker.name,
        permissions: Array.isArray(worker.permissions) ? worker.permissions : []
      }
    })
  }

  function saveWorkers(workers) {
    writeJson(STORAGE.workers, workers)
  }

  function addWorker(name) {
    const workers = getWorkers()
    const worker = {
      id: 'worker_' + Date.now(),
      name: name,
      permissions: ['tasks']
    }
    workers.push(worker)
    saveWorkers(workers)
    return worker
  }

  function removeWorker(workerId) {
    saveWorkers(getWorkers().filter(function (worker) {
      return worker.id !== workerId
    }))
  }

  function updateWorkerPermissions(workerId, permissions) {
    saveWorkers(getWorkers().map(function (worker) {
      if (worker.id !== workerId) {
        return worker
      }
      return Object.assign({}, worker, { permissions: permissions })
    }))
  }

  function getWorker(workerId) {
    return getWorkers().find(function (worker) {
      return worker.id === workerId
    }) || null
  }

  async function loadFragment(url, hostElement) {
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) {
      throw new Error('Nie udało się załadować modułu: ' + url)
    }

    hostElement.innerHTML = await response.text()
    hostElement.querySelectorAll('script').forEach(function (oldScript) {
      const newScript = document.createElement('script')
      Array.from(oldScript.attributes).forEach(function (attribute) {
        newScript.setAttribute(attribute.name, attribute.value)
      })
      newScript.textContent = oldScript.textContent
      oldScript.replaceWith(newScript)
    })
  }

  ensureDefaults()

  window.QMAdminPanel = {
    STORAGE: STORAGE,
    PERMISSIONS: PERMISSIONS,
    SECTION_DEFINITIONS: SECTION_DEFINITIONS,
    ensureDefaults: ensureDefaults,
    getCredentials: getCredentials,
    authenticate: authenticate,
    isLoggedIn: isLoggedIn,
    login: login,
    logout: logout,
    requireLogin: requireLogin,
    updateCredentials: updateCredentials,
    getPreferences: getPreferences,
    savePreferences: savePreferences,
    applyPreferences: applyPreferences,
    getWorkers: getWorkers,
    addWorker: addWorker,
    removeWorker: removeWorker,
    updateWorkerPermissions: updateWorkerPermissions,
    getWorker: getWorker,
    loadFragment: loadFragment
  }
}())
