#!/usr/bin/env bash
# run.sh – Zintegrowany skrypt startowy dla QualitetMarket
#
# Wykonuje kolejno:
#   1. Uruchamia kontenery (docker compose up -d db)
#   2. Czeka, aż PostgreSQL będzie gotowy (healthcheck)
#   3. Wykonuje migracje bazodanowe w jednorazowym kontenerze
#   4. Uruchamia serwer API (docker compose up -d api)
#   5. Czeka na gotowość API i sygnalizuje sukces
#
# Użycie:
#   chmod +x run.sh
#   ./run.sh

set -euo pipefail

# ─── Kolory ───────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}[run.sh]${NC} $*"; }
info() { echo -e "${CYAN}[run.sh]${NC} $*"; }
warn() { echo -e "${YELLOW}[run.sh]${NC} $*"; }
err()  { echo -e "${RED}[run.sh] ERROR:${NC} $*" >&2; }

# ─── Konfiguracja ────────────────────────────────────────────────────────────
# Nazwy serwisów muszą odpowiadać definicjom w docker-compose.yml.
DB_SERVICE=db
API_SERVICE=api
# Dane do połączenia z bazą — muszą być spójne z docker-compose.yml (env: DB_*).
PG_USER="${DB_USER:-postgres}"
PG_DB="${DB_NAME:-hurtdetal_qualitet}"

# ─── Sprawdzenie wymagań ──────────────────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  err "Docker nie jest zainstalowany lub nie jest w PATH."
  exit 1
fi
if ! docker compose version &>/dev/null; then
  err "Docker Compose (plugin) nie jest dostępny. Zainstaluj Docker Desktop lub docker-compose-plugin."
  exit 1
fi

# ─── Krok 1: Uruchom bazę danych ─────────────────────────────────────────────
log "1/4  Uruchamianie kontenera bazy danych..."
docker compose up -d "$DB_SERVICE"

# ─── Krok 2: Czekaj na gotowość PostgreSQL ───────────────────────────────────
log "2/4  Oczekiwanie na gotowość PostgreSQL..."
MAX_DB_WAIT=60
elapsed=0
until docker compose exec -T "$DB_SERVICE" pg_isready -U "$PG_USER" -d "$PG_DB" >/dev/null 2>&1; do
  if [ "$elapsed" -ge "$MAX_DB_WAIT" ]; then
    err "Baza danych nie uruchomiła się w ciągu ${MAX_DB_WAIT}s."
    err "Sprawdź logi: docker compose logs db"
    exit 1
  fi
  warn "  Baza danych jeszcze nie gotowa — kolejna próba za 3s... (${elapsed}s/${MAX_DB_WAIT}s)"
  sleep 3
  elapsed=$((elapsed + 3))
done
info "  PostgreSQL gotowy."

# ─── Krok 3: Migracje bazodanowe ─────────────────────────────────────────────
log "3/4  Wykonywanie migracji bazodanowych..."
docker compose run --rm --no-deps "$API_SERVICE" node migrations/migrate.js
info "  Migracje zakończone."

# ─── Krok 4: Uruchom serwer API ──────────────────────────────────────────────
log "4/4  Uruchamianie serwera API..."
# Przy ponownym uruchomieniu (up -d) run-migrations-safe.js pominie już
# zastosowane migracje — start będzie szybki.
docker compose up -d "$API_SERVICE"

# Poczekaj na healthcheck API
info "  Oczekiwanie na gotowość API (healthcheck)..."
MAX_API_WAIT=90
elapsed=0
api_status="starting"
while [ "$elapsed" -lt "$MAX_API_WAIT" ]; do
  api_id=$(docker compose ps -q "$API_SERVICE" 2>/dev/null || true)
  if [ -n "$api_id" ]; then
    api_status=$(docker inspect --format='{{.State.Health.Status}}' "$api_id" 2>/dev/null || echo "starting")
    if [ "$api_status" = "healthy" ]; then
      break
    fi
  fi
  sleep 3
  elapsed=$((elapsed + 3))
done

echo ""
if [ "$api_status" = "healthy" ]; then
  log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log "  ✓  System jest gotowy do pracy!"
  log ""
  log "  API:      http://localhost:3000"
  log "  Baza:     localhost:5432"
  log "  DB name:  ${PG_DB}  |  user: ${PG_USER}"
  log ""
  log "  Logi API:   docker compose logs -f api"
  log "  Zatrzymaj:  docker compose down"
  log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
  warn "API nie zgłosiło statusu 'healthy' w ciągu ${MAX_API_WAIT}s."
  warn "Serwer może nadal startować. Sprawdź logi:"
  warn "  docker compose logs $API_SERVICE"
fi
