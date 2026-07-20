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
  const ORDER_STORAGE_KEY = 'qm_orders'
  const PRODUCTS_STORAGE_KEY = 'products'
  const SUPPLIERS_STORAGE_KEY = 'suppliers'
  const USERS_STORAGE_KEY = 'users'
  const ACTIVE_STORE_KEY = 'activeStore'
  const STORE_SETTINGS_KEY = 'app_store_settings'
  const STRIPE_SYNC_KEY = 'qm_stripe_sync_at'

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

  function getStoredArray(key) {
    const value = readJson(key, [])
    return Array.isArray(value) ? value : []
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

  function resolveOrderDate(order) {
    const raw = order.createdAt || order.created_at || order.orderDate || order.order_date || order.date || order.submittedAt
    const date = raw ? new Date(raw) : new Date()
    return Number.isNaN(date.getTime()) ? new Date() : date
  }

  function resolveOrderAmount(order) {
    const raw = order.total || order.totalAmount || order.total_amount || order.amount || order.value || order.price || order.saleTotal
    const value = Number(raw)
    return Number.isFinite(value) ? value : 0
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      maximumFractionDigits: 2
    }).format(Number(value) || 0)
  }

  function getStatsSnapshot() {
    const orders = getStoredArray(ORDER_STORAGE_KEY)
    const products = getStoredArray(PRODUCTS_STORAGE_KEY)
    const suppliers = getStoredArray(SUPPLIERS_STORAGE_KEY)
    const users = getStoredArray(USERS_STORAGE_KEY)
    const activeStore = readJson(ACTIVE_STORE_KEY, null)
    const storeSettings = readJson(STORE_SETTINGS_KEY, {})
    const productsFromStore = activeStore && Array.isArray(activeStore.products) ? activeStore.products : []
    const combinedProducts = products.length ? products : productsFromStore
    const activeProducts = combinedProducts.filter(function (product) {
      return !product || !product.status ? true : String(product.status).toLowerCase() === 'active'
    })
    const customers = users.filter(function (user) {
      return String(user && user.role || '').toLowerCase() === 'buyer'
    })
    const recentOrders = orders.slice().sort(function (a, b) {
      return resolveOrderDate(b) - resolveOrderDate(a)
    }).slice(0, 5)

    const today = new Date()
    const seriesMap = new Map()
    for (let offset = 6; offset >= 0; offset -= 1) {
      const pointDate = new Date(today)
      pointDate.setHours(0, 0, 0, 0)
      pointDate.setDate(today.getDate() - offset)
      const key = pointDate.toISOString().slice(0, 10)
      const label = pointDate.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })
      seriesMap.set(key, { label: label, total: 0 })
    }

    orders.forEach(function (order) {
      const orderDate = resolveOrderDate(order)
      orderDate.setHours(0, 0, 0, 0)
      const key = orderDate.toISOString().slice(0, 10)
      if (seriesMap.has(key)) {
        seriesMap.get(key).total += resolveOrderAmount(order)
      }
    })

    const stripeActive = Boolean(
      localStorage.getItem(STRIPE_SYNC_KEY) ||
      storeSettings.stripeConnected ||
      storeSettings.stripe_connected ||
      storeSettings.stripeStatus === 'active'
    )

    return {
      orderCount: orders.length,
      totalSales: orders.reduce(function (sum, order) {
        return sum + resolveOrderAmount(order)
      }, 0),
      activeProductsCount: activeProducts.length,
      supplierCount: suppliers.length,
      customerCount: customers.length || users.length,
      recentOrders: recentOrders,
      salesSeries: Array.from(seriesMap.values()),
      stripeActive: stripeActive,
      supplierActive: suppliers.length > 0
    }
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
    formatCurrency: formatCurrency,
    getStatsSnapshot: getStatsSnapshot,
    loadFragment: loadFragment
  }
}())
