#!/usr/bin/env bash
# setup-owner-render.sh
#
# One-shot setup script for the QualitetMarket backend on Render (or any Node.js host).
#
# What it does:
#   1. Validates required environment variables.
#   2. Runs database migrations (safe wrapper: skips if already applied).
#   3. Seeds / updates the platform owner account.
#
# Usage:
#   # Locally (with a .env file in backend/):
#   bash setup-owner-render.sh
#
#   # On Render – run as a one-off job or as a post-deploy shell command:
#   bash setup-owner-render.sh
#
# Required environment variables (set in Render dashboard or backend/.env):
#   DATABASE_URL   – PostgreSQL connection string  (or DB_HOST / DB_PORT / DB_* alternatives)
#   JWT_SECRET     – long random secret for signing JWTs
#   OWNER_EMAIL    – platform owner e-mail address
#   OWNER_PASSWORD – platform owner password (min. 8 characters)
#
# Optional:
#   OWNER_NAME  – display name           (default: "Właściciel Platformy")
#   OWNER_PHONE – phone stored on account (optional)

set -euo pipefail

BACKEND_DIR="$(cd "$(dirname "$0")/backend" && pwd)"

# ─── colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[setup]${NC} $*"; }
warn()  { echo -e "${YELLOW}[setup]${NC} $*"; }
error() { echo -e "${RED}[setup] ERROR:${NC} $*" >&2; }

# ─── 0. Load .env if present (local development convenience) ──────────────────
if [ -f "$BACKEND_DIR/.env" ]; then
  info "Loading $BACKEND_DIR/.env"
  set -a
  # shellcheck source=/dev/null
  source "$BACKEND_DIR/.env"
  set +a
fi

# ─── 1. Validate required variables ──────────────────────────────────────────
MISSING=()
for VAR in DATABASE_URL JWT_SECRET OWNER_EMAIL OWNER_PASSWORD; do
  if [ -z "${!VAR:-}" ]; then
    MISSING+=("$VAR")
  fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
  error "Missing required environment variables: ${MISSING[*]}"
  echo ""
  echo "  Set them in your Render service dashboard (Environment tab)"
  echo "  or in $BACKEND_DIR/.env for local development."
  echo ""
  echo "  See $BACKEND_DIR/.env.example for reference."
  exit 1
fi

# ─── 2. Install production dependencies (if node_modules is absent) ───────────
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
  info "Installing backend dependencies…"
  (cd "$BACKEND_DIR" && npm ci --only=production)
fi

# ─── 3. Run database migrations ───────────────────────────────────────────────
info "Running database migrations…"
(cd "$BACKEND_DIR" && node scripts/run-migrations-safe.js)
info "Migrations complete."

# ─── 4. Seed / update owner account ──────────────────────────────────────────
info "Seeding owner account: ${OWNER_EMAIL}"
(cd "$BACKEND_DIR" && node scripts/seed-owner.js)
info "Owner account ready."

# ─── 5. Summary ───────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "  Owner account : ${OWNER_EMAIL}"
echo "  Role          : owner (elite plan)"
echo ""
echo "  Next steps:"
echo "    • Open https://<your-frontend-url>/login.html"
echo "    • Log in with ${OWNER_EMAIL}"
echo "    • Navigate to owner-panel.html to access the Owner Control Centre"
echo ""
echo "  Backend health: curl https://<your-api-url>/health"
