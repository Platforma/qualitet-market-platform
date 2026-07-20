# QUALITETMARKET PLATFORMA

Link do podglądu platformy: https://qualitet-market.com

## Backend API

Pełna dokumentacja backendu: [`backend/README.md`](backend/README.md)

### Szybki start (Docker Compose)

```bash
cp backend/.env.example .env   # ustaw DB_PASSWORD i JWT_SECRET
docker compose up --build
# API dostępne pod https://qualitet-market.com
```

### Szybki start (lokalnie)

```bash
cd backend
npm install
cp .env.example .env   # ustaw DATABASE_URL i JWT_SECRET
createdb hurtdetal_qualitet
npm run migrate
npm run dev
```

### Frontend (lokalnie)

Pliki frontendu są statyczne (`frontend/`). W development można je serwować np. przez dowolny serwer statyczny:

```bash
cd frontend
# przykład:
npx serve .
```

### Routing / fallback (żeby nie było „Not Found”)

- Produkcja (Render Static): `frontend/_redirects` ma catch-all `/* /404.html 200`.
- `frontend/404.html` przekierowuje na właściwy entrypoint (`/index.html`, a dla `/tasks/*` na `/tasks.html`).
- Lokalny serwer Node (`/server.js`) ma fallback dla tras bez rozszerzenia (poza `/api*` i `/health`), dzięki czemu bezpośrednie wejście/odświeżenie trasy nie kończy się ekranem „Not Found”.

### Migracje

| Plik | Tabele |
|------|--------|
| `001_initial_schema.sql` | `users`, `subscriptions`, `suppliers`, `stores`, `products`, `orders`, `order_items` |
| `002_extended_schema.sql` | `categories`, `product_images`, `shop_products`, `carts`, `cart_items`, `payments`, `audit_logs` |

### Frontend API client

Plik `js/api.js` udostępnia klienta REST API jako `window.QMApi` (albo moduł ES/CommonJS).
Umożliwia stopniowe zastąpienie odczytów z `localStorage` wywołaniami API:

```html
<script>window.QM_API_BASE = 'https://qualitet-market.com/api';</script>
<script src="js/api.js"></script>
<script>
  // Logowanie
  const { token, user } = await QMApi.Auth.login(email, password);

  // Koszyk
  const cart = await QMApi.Cart.get(storeId);
  await QMApi.Cart.addItem(storeId, productId, 1);

  // Zamówienie
  const order = await QMApi.Orders.create({
    store_id: storeId,
    items: [{ product_id, quantity: 1 }],
    shipping_address: '...',
  });
</script>
```

Pełna checklist migracji localStorage→API: [`backend/README.md#checklist`](backend/README.md)
