(function () {
  'use strict'

  const priceFormatter = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  function getStoreId() {
    const params = new URLSearchParams(window.location.search)
    return params.get('store_id') || params.get('storeId') || window.QM_LISTING_STORE_ID || null
  }

  function formatPrice(value) {
    return priceFormatter.format(Number(value) || 0)
  }

  function getStatusMeta(status) {
    const normalized = String(status || '').toLowerCase()
    if (normalized === 'pending') return { className: 'status-pending', label: '⏳ Oczekujący' }
    if (normalized === 'draft') return { className: 'status-draft', label: '○ Szkic' }
    if (normalized === 'archived') return { className: 'status-draft', label: '— Archiwalny' }
    return { className: 'status-active', label: '✓ Opublikowany' }
  }

  function setStatus(message, isError) {
    const statusEl = document.getElementById('listing-status')
    if (!statusEl) return
    statusEl.textContent = message
    statusEl.classList.toggle('status-draft', Boolean(isError))
  }

  function updateSummary(products, storeId) {
    const countEl = document.getElementById('listing-count')
    const categoryCountEl = document.getElementById('listing-category-count')
    const sourceEl = document.getElementById('listing-source')
    const storeEl = document.getElementById('listing-store')

    const categories = new Set(
      products
        .map(product => String(product.category || '').trim())
        .filter(Boolean)
    )

    if (countEl) countEl.textContent = String(products.length)
    if (categoryCountEl) categoryCountEl.textContent = String(categories.size)
    if (sourceEl) sourceEl.textContent = 'QMApi'
    if (storeEl) storeEl.textContent = storeId || 'Wszystkie'
  }

  function clearProducts() {
    const container = document.getElementById('product-list')
    if (container) {
      container.textContent = ''
    }
  }

  function appendTextElement(parent, tagName, className, text) {
    const element = document.createElement(tagName)
    if (className) element.className = className
    element.textContent = text
    parent.appendChild(element)
    return element
  }

  function renderEmptyState(message) {
    const container = document.getElementById('product-list')
    if (!container) return
    clearProducts()
    const empty = document.createElement('div')
    empty.className = 'panel-card'
    empty.textContent = message
    container.appendChild(empty)
  }

  async function addToCart(product) {
    try {
      await window.QMApi.Cart.addItem(product.store_id, product.id, 1)
      setStatus(`Dodano do koszyka: ${product.name || 'Produkt'}.`)
    } catch (error) {
      setStatus(error && error.message ? error.message : 'Nie udało się dodać produktu do koszyka.', true)
    }
  }

  function buildImage(product) {
    const wrapper = document.createElement('div')
    wrapper.className = 'product-img'

    if (product.image_url) {
      const img = document.createElement('img')
      img.src = product.image_url
      img.alt = product.name || 'Produkt'
      img.loading = 'lazy'
      wrapper.appendChild(img)
    } else {
      wrapper.textContent = '🛍️'
    }

    return wrapper
  }

  function buildCard(product) {
    const card = document.createElement('article')
    card.className = 'product-card'

    card.appendChild(buildImage(product))

    const body = document.createElement('div')
    body.className = 'product-body'

    appendTextElement(body, 'h3', 'product-title', product.name || 'Produkt')
    appendTextElement(body, 'div', 'price', formatPrice(product.selling_price || product.price_gross || product.price_net))

    const meta = document.createElement('div')
    meta.className = 'meta'
    meta.appendChild(document.createTextNode(`Kategoria: ${product.category || 'Brak'} `))
    meta.appendChild(document.createElement('br'))
    meta.appendChild(document.createTextNode(`Hurtownia: ${product.supplier_name || '—'} `))
    meta.appendChild(document.createElement('br'))
    meta.appendChild(document.createTextNode(`Marża: ${Number(product.margin || 0)}%`))
    body.appendChild(meta)

    const status = getStatusMeta(product.status)
    appendTextElement(body, 'p', status.className, status.label)

    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'btn btn-primary'
    button.textContent = product.store_id ? 'Dodaj do koszyka' : 'Brak sklepu'
    button.disabled = !product.store_id
    if (product.store_id) {
      button.addEventListener('click', function () {
        addToCart(product)
      })
    }
    body.appendChild(button)

    card.appendChild(body)
    return card
  }

  function renderProducts(products, storeId) {
    const container = document.getElementById('product-list')
    if (!container) return

    clearProducts()
    updateSummary(products, storeId)

    if (!products.length) {
      renderEmptyState('Brak produktów do wyświetlenia.')
      return
    }

    products.forEach(product => {
      container.appendChild(buildCard(product))
    })
  }

  function normalizeResponse(response) {
    if (Array.isArray(response)) return response
    if (response && Array.isArray(response.products)) return response.products
    return []
  }

  async function loadProducts() {
    if (!window.QMApi || !window.QMApi.Products || !window.QMApi.Cart) {
      setStatus('QMApi nie jest dostępne na tej stronie.', true)
      renderEmptyState('Nie udało się zainicjalizować klienta API.')
      return
    }

    const storeId = getStoreId()
    const params = { status: 'active', limit: 24 }
    if (storeId) {
      params.store_id = storeId
    }

    setStatus('Ładowanie produktów z API...')

    try {
      const response = await window.QMApi.Products.list(params)
      const products = normalizeResponse(response)
      renderProducts(products, storeId)
      setStatus(
        products.length
          ? `Załadowano ${products.length} produktów${storeId ? ` dla sklepu ${storeId}` : ''}.`
          : 'API zwróciło pustą listę produktów.'
      )
    } catch (error) {
      setStatus(error && error.message ? error.message : 'Nie udało się pobrać produktów.', true)
      renderEmptyState('Nie udało się pobrać produktów z API.')
    }
  }

  document.addEventListener('DOMContentLoaded', loadProducts)
}())
