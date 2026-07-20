# 🚀 Wdrażanie na Render.com

Kompletny przewodnik do wdrożenia projektu **Qualitet Market** na platformie Render.

---

## 📋 Przegląd architektury

```
Render
├── Web Service (Backend Node.js)
│   ├── /backend
│   ├── Node 18+
│   └── Port 10000
├── PostgreSQL Database
│   ├── PostgreSQL 14+
│   └── 256MB RAM
└── Environment Variables
    └── Współdzielone między serwisami
```

---

## 🔧 Krok 1: Przygotowanie repozytorium

### 1.1 Sprawdź pliki konfiguracyjne

Upewnij się, że istnieją:
- ✅ `backend/.env.example` – zmienne środowiskowe
- ✅ `backend/package.json` – dependencje
- ✅ `backend/Dockerfile` – konfiguracja Dockera
- ✅ `backend/migrations/` – migracje bazy danych
- ✅ `backend/src/app.js` – punkt wejścia aplikacji

### 1.2 Zaktualizuj Dockerfile (jeśli potrzeba)

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY . .

# Run migrations and start server
CMD ["sh", "-c", "node scripts/run-migrations-safe.js && node src/app.js"]
```

**Zapisz do:** `backend/Dockerfile` (w serwisie Render ustaw **Root Directory** na `backend`)

---

## 🔐 Krok 2: Wygeneruj bezpieczne zmienne

Wymagane zmienne na Render:

```bash
# Wygeneruj losowy JWT_SECRET (w swoim terminalu):
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Wygeneruj DB_PASSWORD (Password generator na Render lub):
openssl rand -base64 32
```

---

## 🗄️ Krok 3: Utwórz PostgreSQL na Render

1. Zaloguj się na [render.com](https://render.com)
2. **New +** → **PostgreSQL**
3. Ustaw:
   - **Name**: `qualitet-market-db`
   - **Database**: `hurtdetal_qualitet`
   - **User**: `postgres`
   - **Region**: Frankfurt (lub Europa)
   - **Plan**: Free (wystarczy na start)

4. **Create** i czekaj ~2-3 minuty na stworzenie

5. Skopiuj **Internal Database URL** (wyglądać będzie tak):
   ```
   postgresql://postgres:PASSWORD@<host>:5432/hurtdetal_qualitet
   ```

---

## 🌐 Krok 4: Utwórz Web Service (Backend)

### 4.1 Nowy Web Service

1. **New +** → **Web Service**
2. **Connect your GitHub repository** → `Platforma/qualitet-market`
3. **Ustawienia:**

   | Pole | Wartość |
   |------|---------|
   | **Name** | `qualitet-market-api` |
   | **Environment** | `Docker` |
   | **Region** | Frankfurt |
   | **Branch** | `main` |
   | **Root Directory** | `backend` |
   | **Dockerfile Path** | `Dockerfile` |
   | **Plan** | Free / Starter |

### 4.2 Build & Start commands

- **Build Command**: zostaw puste (Docker buduje obraz z `backend/Dockerfile`)
- **Start Command**: zostaw puste – start jest już zdefiniowany w `backend/Dockerfile` jako `node scripts/run-migrations-safe.js && node src/server.js`

### 4.3 Ustawienie zmiennych środowiskowych

**Kliknij** → **Environment**

Dodaj następujące zmienne:

```env
# Server
NODE_ENV=production
PORT=10000

# Database (z PostgreSQL)
DATABASE_URL=<internal-connection-string-z-render-postgres>
# opcjonalnie dodatkowo:
DB_HOST=<host-z-render-postgres>
DB_PORT=5432
DB_NAME=hurtdetal_qualitet
DB_USER=postgres
DB_PASSWORD=<password-z-render-postgres>

# JWT (wygeneruj losowo!)
JWT_SECRET=<twój-losowy-32-char-hex>
JWT_EXPIRES_IN=7d

# Platform settings
PLATFORM_MARGIN_DEFAULT=15

# CORS
ALLOWED_ORIGINS=https://<twoja-domena>.com,https://www.qualitet-market.com

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=30

# Stripe (uzupełnij później)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL (dla payment redirect)
APP_URL=https://www.qualitet-market.com

# Email/SMTP (opcjonalnie)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=app_password
SMTP_FROM=noreply@qualitet-market.com
```

---

## ✅ Krok 5: Deploy i Testy

### 5.1 Wdróż service

1. **Create Web Service** – Render automatycznie builds & deploys
2. Czekaj aż status będzie **Live** (zielony)
3. Skopiuj URL: `https://qualitet-market-api.onrender.com`
4. Kolejne push'e do gałęzi `main` będą wdrażane automatycznie (`autoDeploy: true` w `render.yaml`)

### 5.2 Testuj API

```bash
# Test healthcheck
curl https://qualitet-market-api.onrender.com/health

# Test login
curl -X POST https://qualitet-market-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.pl","password":"1234"}'
```

### 5.3 Jeśli deployment zawiedzie

1. **Kliknij** serwis → **Logs**
2. Szukaj błędów (np. brakujące zmienne, baza nieosiągalna)
3. **Sprawdź:**
   - Czy migracje się uruchomiły?
   - Czy DB_* zmienne są poprawne?
   - Czy JWT_SECRET jest ustawiony?

---

## 🎨 Krok 6: Frontend statyczny (HTML/JS PWA)

1. **New +** → **Static Site**
2. Repo: `Platforma/qualitet-market`
3. Ustawienia:
   - **Root Directory**: `frontend`
   - **Build Command**: zostaw puste
   - **Publish Directory**: `.`
   - **Branch**: `main`
4. Po deployu frontend będzie dostępny np. pod `https://qualitet-market-web.onrender.com`
5. Backend w tym repo automatycznie kieruje frontend Render na `https://qualitet-market-api.onrender.com/api`, a dla domeny produkcyjnej zostawia `https://qualitet-market.com/api`.
6. Kolejne push'e do gałęzi `main` będą publikowane automatycznie przez Render.

---

## 🔗 Krok 7: Powiąż Frontend i Backend

Frontend nie używa `NEXT_PUBLIC_*` ani procesu build. Bazuje na `window.QM_API_BASE` / `js/api.js`, więc po deployu na Render powinien automatycznie użyć `https://qualitet-market-api.onrender.com/api`.

### Sprawdź łączność

W konsoli przeglądarki:

```javascript
fetch('https://qualitet-market-api.onrender.com/api/categories')
  .then(r => r.json())
  .then(d => console.log('✅ API Connected!', d))
  .catch(e => console.error('❌ Failed:', e))
```

---

## 🛡️ Krok 8: Custom domain (opcjonalnie)

### Powiąż domenę do Render

1. **Web Service** → **Settings**
2. **Custom Domain** → Dodaj `qualitet-market.com`
3. Render wyświetli **CNAME record**
4. Przejdź do DNS dostawcy (np. Namecheap, GoDaddy)
5. Dodaj CNAME record:
   ```
   qualitet-market.com CNAME qualitet-market-api.onrender.com
   ```
6. W backendzie zaktualizuj zmienną `APP_URL` na docelową domenę frontendu (np. `https://qualitet-market.com`), jeśli odchodzisz od adresu `*.onrender.com`
7. Czekaj 15-30 minut na propagację

---

## 📊 Krok 9: Monitoring

### Render Dashboard

- **Logs** – zobacz output i błędy
- **Metrics** – CPU, Memory, Network
- **Events** – historia deploymentów
- **Health** – status serwisu

### Automatyczne restartowanie i deploy

Render restartuje serwis, jeśli upadnie, oraz automatycznie wdraża nowe commity z `main`. Jeśli chcesz wymusić dodatkowy restart albo redeploy:

**Web Service** → **Manual Deploy** → **Latest**

---

## 🚨 Troubleshooting

| Problem | Rozwiązanie |
|---------|-----------|
| **502 Bad Gateway** | Czekaj na deploy, sprawdź logs |
| **DB connection refused** | Sprawdź `DB_*` zmienne i czy DB je żyje |
| **Build failed** | Sprawdź `npm install` – czy `package-lock.json` jest w repo? |
| **Migrations didn't run** | Sprawdź log startu i czy Render używa `backend/Dockerfile` z `node scripts/run-migrations-safe.js` |
| **JWT errors** | Upewnij się, że `JWT_SECRET` jest długim ciągiem (32+ znaków) |
| **CORS errors** | Dodaj domenę frontendu do `ALLOWED_ORIGINS` |
| **Email nie działa** | Skonfiguruj SMTP lub wyłącz email w backendu |

---

## ✨ Gotowe!

Twoja aplikacja powinna być live! 🎉

```
Frontend:      https://qualitet-market-web.onrender.com
Backend API:   https://qualitet-market-api.onrender.com
Database:      PostgreSQL na Render (niewidoczny)
```

---

## 📚 Przydatne linki

- [Render Docs](https://render.com/docs)
- [Render Pricing](https://render.com/pricing)
- [PostgreSQL on Render](https://render.com/docs/databases)
- [GitHub Integration](https://render.com/docs/github)
- [Custom Domains](https://render.com/docs/custom-domains)

---

## 🆘 Wsparcie

Jeśli coś nie działa:

1. Sprawdź **Logs** na Render
2. Uruchom lokalnie: `docker compose up`
3. Pytaj w [Render Community](https://community.render.com)

Powodzenia! 🚀
