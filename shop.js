    const apiBase = window.QM_API_BASE || 'https://api.qualitet-market.com/api';
    const safeLimit = Math.max(1, Math.min(100, parseInt(limit) || 20));
    fetch(`${apiBase}/feed?section=${encodeURIComponent(section)}&limit=${safeLimit}`)
      .then(r => r.ok ? r.json() : null)
      .catch(() => null)
      .then(data => {
        const products = data && data.products;
        renderProductsIntoGrid(gridEl, emptyEl, products || []);
      });
  }

  function initStoreShop(){
    const shop = document.querySelector('[data-store-shop]');
    if(!shop){
      return;
    }

    // When a slug is in the URL, load the shop from the API and stop here.
    // The async loadShopFromApi will control visibility of content/emptyState.
    const urlParams = new URLSearchParams(window.location.search);
    const urlSlug = urlParams.get('slug') || urlParams.get('shop');
    if(urlSlug){
      loadShopFromApi(urlSlug, shop);
      return;
    }

    const store = manager.getActiveStore();
    const storeSettings = ensureStoreSettings();
    const fallbackStore = !store && storeSettings ? buildStoreFromSettings(storeSettings) : null;
    const resolvedStore = store || fallbackStore;
    const content = shop.querySelector('[data-store-content]');
    const emptyState = shop.querySelector('[data-store-empty]');

    if(!resolvedStore){
      if(content){
        content.hidden = true;
      }
      if(emptyState){
        emptyState.hidden = false;
      }
    } else {
      if(content){
        content.hidden = false;
      }
      if(emptyState){
        emptyState.hidden = true;
      }

      document.documentElement.style.setProperty('--store-primary', resolvedStore.primaryColor || DEFAULTS.primaryColor);
      document.documentElement.style.setProperty('--store-accent', resolvedStore.accentColor || DEFAULTS.accentColor);
      document.documentElement.style.setProperty('--store-background', resolvedStore.backgroundColor || DEFAULTS.backgroundColor);

      const displayMargin = resolveStoreMargin(resolvedStore, storeSettings);
      const map = {
        'store-name': resolvedStore.name,
        'store-description': resolvedStore.description || DEFAULTS.description,
        'store-plan': `Plan: ${formatPlan(resolvedStore.plan)}`,
        'store-margin': `Marża: ${displayMargin}%`,
        'store-theme': '',
        'store-slug': `@${resolvedStore.slug}`
      };

      Object.entries(map).forEach(([key, value]) => {
        const target = shop.querySelector(`[data-${key}]`);
        if(target){
          target.textContent = value;
        }
      });

      const contactMap = {
        'store-email': resolvedStore.email,
        'store-phone': resolvedStore.phone,
        'store-delivery': resolvedStore.delivery || DEFAULTS.delivery
      };

      Object.entries(contactMap).forEach(([key, value]) => {
        const target = shop.querySelector(`[data-${key}]`);
        if(!target){
          return;
        }
        const fallback = key === 'store-delivery' ? DEFAULTS.delivery : 'Brak danych';
        applyText(target, value, fallback);
      });

      const logoContainer = shop.querySelector('[data-logo-preview]');
      renderLogo(logoContainer, resolvedStore);
    }

    // Always load real products from catalog feed into all product grids
    loadStoreFeedProducts(shop);
  }

  function loadStoreFeedProducts(shop){
    const apiBase = window.QM_API_BASE || 'https://api.qualitet-market.com/api';
