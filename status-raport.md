# Status raport – Qualitet Market

Data przeglądu: 2026-07-16

## 1. Szybkie podsumowanie

- Backend API jest rozbudowany i wygląda na najbardziej dojrzałą część projektu.
- Testy backendu przechodzą: `cd backend && npm test` → **4 suite, 884 testy, 0 błędów**.
- PWA/frontend działa w modelu mieszanym: część ekranów korzysta z API, ale w repo nadal są fallbacki do `localStorage`, dane demo i twardo wpisane URL-e produkcyjne.
- Aplikacja mobilna `mobile/` jest głównie szkieletem UI; kilka ekranów nadal działa na danych mockowanych.
- Największe braki dotyczą konfiguracji środowiska, integracji usług zewnętrznych i uporządkowania deploymentu.

## 2. Moduły gotowe / w dużej mierze gotowe

### Backend

W `backend/src/app.js` są podpięte i aktywne moduły:

- `auth`
- `users`
- `stores`
- `shops`
- `products`
- `orders`
- `subscriptions`
- `suppliers`
- `categories`
- `cart`
- `admin`
- `payments`
- `shop-products`
- `my`
- `store`
- `referral` / `referrals`
- `scripts`
- `analytics`
- `affiliate`
- `creator`
- `creator-referrals`
- `live`
- `social`
- `gamification`
- `collaboration`
- `reputation`
- `auctions`
- `campaigns`
- `ai`
- `feed`

Dodatkowo gotowe lub obecne są:

- health check: `/health`
- readiness check: `/api/readiness`
- migracje PostgreSQL: `backend/migrations/`
- Docker backendu: `backend/Dockerfile`
- lokalny deploy przez `docker-compose.yml`
- mobilny klient Expo: struktura aplikacji, routing, ekran logowania, koszyka, checkoutu i zamówień

## 3. Elementy niedziałające, nieukończone albo ryzykowne

### Frontend / PWA

- Frontend nadal ma dużo logiki awaryjnej opartej o `localStorage` zamiast czystego API:
  - `js/pwa-connect.js`
  - `js/flow.js`
  - `js/cart.js`
  - `js/app.js`
- W wielu miejscach API jest ustawione na sztywno na produkcję, np.:
  - `js/app.js:1`
  - `index.html:167`
  - `sklep.html:7`
  - `listing.html:15`
- Część widoków nadal pokazuje dane demo po błędzie API, np.:
  - `frontend/js/homepage.js:417`
  - `frontend/js/homepage.js:494`
- W repo są dwa bardzo podobne fronty statyczne: katalog główny oraz `frontend/`, co zwiększa ryzyko rozjazdu.

### Mobile (`mobile/`)

- Ekrany nadal korzystają z mocków zamiast backendu:
  - `mobile/app/stores.tsx` – stała `STORES`
  - `mobile/app/index.tsx` – stałe `TRENDING` i `FEED`
  - `mobile/app/creator.tsx` – stała `TOP_PRODUCTS`
- Checkout mobilny nie wysyła realnego zamówienia:
  - `mobile/app/checkout.tsx:42` – symulowane wywołanie API
  - `mobile/app/checkout.tsx:61` – losowy numer zamówienia z TODO

### Deployment / konfiguracja

- `render.yaml` zakłada frontend typu Node/Next (`rootDir: frontend`, `npm run build`, `npm start`), ale w katalogu `frontend/` **nie ma `package.json`**, więc taka usługa nie zbuduje się w obecnym stanie.
- Rootowy `package.json` jest szczątkowy i nie opisuje pełnego projektu.
- Rootowy `.gitignore` ignoruje tylko `node_modules`, więc **rootowy `.env` używany przez `docker-compose.yml` nie jest chroniony przed przypadkowym commitem**.

### Integracje zewnętrzne

- E-mail/SMTP nie jest skonfigurowany; testy pokazują ostrzeżenia typu:
  - `No admin email configured – skipping import notification`
- Stripe/P24 wymagają realnej konfiguracji kluczy.
- Moduł AI ma fallback do mocka, gdy brak `OPENAI_API_KEY`.

### Utrzymanie / porządek repo

- Numeracja migracji nie jest spójna (`004_*`, `024_*`, `036_*`, `037_*` mają duplikaty prefiksów). To nie blokuje samego repo, ale utrudnia utrzymanie i wdrożenia.
- Testy przechodzą, ale Jest kończy się przez `--forceExit`, co sugeruje nieposprzątane handlery/timery.

## 4. Brakujące konfiguracje, szczególnie `.env`

## 4.1. Co już jest

- Jest szablon backendu: `/home/runner/work/qualitet-market/qualitet-market/backend/.env.example`
- Jest szablon mobile: `/home/runner/work/qualitet-market/qualitet-market/mobile/.env.example`
- Nie ma gotowego bezpiecznego rootowego `.env` dla `docker compose`; trzeba go utworzyć ręcznie.

## 4.2. Zmienne, które trzeba uzupełnić przed uruchomieniem backendu

Minimalnie:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`
- `ALLOWED_ORIGINS`

Do pełnej funkcjonalności:

- `APP_URL`
- `PLATFORM_MARGIN_DEFAULT`
- `AUTH_RATE_LIMIT_MAX`
- `UPLOAD_MAX_SIZE_MB`
- `OWNER_EMAIL`
- `OWNER_PASSWORD`
- `OWNER_NAME`
- `OWNER_PHONE`
- `PAYMENT_WEBHOOK_SECRET`
- `BANK_ACCOUNT_NUMBER`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `P24_MERCHANT_ID`

Do mobile:

- `EXPO_PUBLIC_API_URL`

## 4.3. Zmienne używane w kodzie, ale brakujące w `backend/.env.example`

W kodzie występują, ale nie są opisane w przykładzie:

- `ADMIN_EMAIL`
- `BCRYPT_ROUNDS`
- `DASHBOARD_URL`
- `FRONTEND_URL`
- `OPENAI_API_KEY`
- `OPENAI_BASE_URL`
- `OPENAI_MODEL`
- `PLATFORM_COMMISSION_DEFAULT`

To warto dopisać do `backend/.env.example`, bo dziś konfiguracja jest niepełna.

## 4.4. Zmienne obecne w `backend/.env.example`, ale niewidoczne w bezpośrednim użyciu kodu

- `P24_API_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_PRICE_ID_BASIC`
- `STRIPE_PRICE_ID_PRO`
- `STRIPE_PRICE_ID_ELITE`
- `STRIPE_PRICE_ID_PREMIUM`
- `STRIPE_PRICE_ID_SUPPLIER_BASIC`
- `STRIPE_PRICE_ID_SUPPLIER_PRO`
- `STRIPE_PRICE_ID_BRAND`
- `STRIPE_PRICE_ID_ARTIST_PRO`

To nie musi być błąd, ale wymaga potwierdzenia, czy te zmienne są jeszcze potrzebne.

## 5. Co trzeba zrobić, aby projekt był w pełni uruchomiony

### Krok 1 – backend lokalnie

1. Wejdź do `backend/`.
2. Zainstaluj zależności: `npm install`.
3. Skopiuj `backend/.env.example` do `backend/.env`.
4. Uzupełnij przynajmniej:
   - `DB_PASSWORD`
   - `JWT_SECRET`
   - `ALLOWED_ORIGINS`
   - `APP_URL`
5. Utwórz bazę PostgreSQL `hurtdetal_qualitet`.
6. Uruchom migracje: `npm run migrate`.
7. Opcjonalnie dodaj konto właściciela: `npm run seed:owner`.
8. Uruchom backend: `npm run dev` albo `npm start`.

### Krok 2 – frontend web / PWA

1. Ustal jeden docelowy frontend:
   - albo katalog główny,
   - albo `frontend/`.
2. Usuń lub ogranicz fallbacki demo/localStorage tam, gdzie mają już działać prawdziwe dane.
3. Ustaw poprawny adres API dla środowiska lokalnego; obecnie wiele plików wskazuje bezpośrednio na `https://api.qualitet-market.com/api`.
4. Sprawdź ręcznie:
   - logowanie
   - listing produktów
   - koszyk
   - checkout
   - panel sprzedawcy
   - panel ownera/admina

### Krok 3 – aplikacja mobilna

1. W `mobile/.env.local` ustaw `EXPO_PUBLIC_API_URL`.
2. Podmień ekrany z mockami (`stores`, `index`, `creator`) na realne wywołania API.
3. Dokończ realny checkout i tworzenie zamówień.
4. Zweryfikuj logowanie, koszyk i zamówienia na fizycznym urządzeniu.

### Krok 4 – usługi zewnętrzne

1. Skonfiguruj SMTP, jeśli mają działać powiadomienia mailowe.
2. Skonfiguruj Stripe i/lub P24, jeśli mają działać prawdziwe płatności.
3. Ustaw `PAYMENT_WEBHOOK_SECRET` i `STRIPE_WEBHOOK_SECRET`.
4. Uzupełnij `OPENAI_API_KEY`, jeśli moduł AI ma działać produkcyjnie.

### Krok 5 – Docker / deploy

1. Utwórz rootowy `.env` do `docker-compose.yml`.
2. Dodaj rootowy `.env` do rootowego `.gitignore`.
3. Uruchom: `docker compose up --build`.
4. Zweryfikuj:
   - `GET /health`
   - `GET /api/readiness`
   - logowanie użytkownika
   - złożenie testowego zamówienia

### Krok 6 – poprawki przed pełnym wdrożeniem

1. Napraw konfigurację `render.yaml` dla frontendu albo usuń nieaktualną usługę.
2. Uporządkuj numerację migracji.
3. Ujednolić konfigurację API URL w HTML/JS.
4. Ogranicz zależność od `localStorage` tam, gdzie backend już istnieje.
5. Dodać testy smoke/e2e dla pełnego flow: rejestracja → sklep → produkt → koszyk → zamówienie → płatność.

## 6. Realna ocena gotowości

### Co już można uruchomić

- backend API
- migracje bazy
- podstawowy deploy backendu
- część frontendu PWA
- podstawową strukturę aplikacji mobilnej

### Co jeszcze blokuje pełne „gotowe do produkcji”

- niepełna i niespójna konfiguracja środowiskowa
- frontend nadal częściowo działa na fallbackach/demo
- mobile nadal częściowo działa na mockach
- niegotowa konfiguracja usług zewnętrznych
- niespójny deployment frontendu w `render.yaml`

## 7. Najkrótsza lista działań dla Ciebie

Jeśli chcesz po prostu doprowadzić projekt do stanu „uruchamia się i da się przetestować”, zrób kolejno:

1. skonfiguruj `backend/.env`
2. postaw PostgreSQL
3. uruchom `npm run migrate`
4. uruchom `cd backend && npm test`
5. uruchom backend
6. przełącz frontend z produkcyjnego API URL na lokalny
7. sprawdź logowanie, listing, koszyk i zamówienie
8. popraw `render.yaml` / strategię deployu frontendu
9. skonfiguruj Stripe/SMTP/OpenAI tylko jeśli są potrzebne na starcie

