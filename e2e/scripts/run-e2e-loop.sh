#!/usr/bin/env bash
# E2E Test Loop Script
# Runs Playwright tests, outputs structured feedback via Claude reporter.
# If tests fail, waits for fixes and re-runs (up to MAX_ITERATIONS).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
E2E_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$E2E_DIR")"

MAX_ITERATIONS=${MAX_ITERATIONS:-5}
SERVER_URL=${SERVER_URL:-"http://localhost:3000"}
CLIENT_URL=${CLIENT_URL:-"http://localhost:5173"}
RESULTS_DIR="$E2E_DIR/results"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() { echo -e "${GREEN}[E2E]${NC} $1"; }
warn() { echo -e "${YELLOW}[E2E]${NC} $1"; }
error() { echo -e "${RED}[E2E]${NC} $1"; }

# Check if servers are running
check_servers() {
  log "Checking if servers are running..."

  if ! curl -sf "$SERVER_URL/api/health" > /dev/null 2>&1; then
    error "Server is not running at $SERVER_URL"
    error "Start it with: cd server && E2E_TESTING=true pnpm run dev"
    return 1
  fi
  log "Server is running at $SERVER_URL"

  if ! curl -sf "$CLIENT_URL" > /dev/null 2>&1; then
    error "Client is not running at $CLIENT_URL"
    error "Start it with: cd client && pnpm run dev"
    return 1
  fi
  log "Client is running at $CLIENT_URL"
}

# Seed the database
seed_database() {
  log "Seeding E2E test database..."
  cd "$E2E_DIR"
  npx tsx helpers/seed.ts
  log "Database seeded successfully"
}

# Run tests
run_tests() {
  local iteration=$1
  log "Running E2E tests (iteration $iteration/$MAX_ITERATIONS)..."

  cd "$E2E_DIR"
  mkdir -p "$RESULTS_DIR"

  # Run Playwright tests
  if npx playwright test 2>&1 | tee "$RESULTS_DIR/test-output-$iteration.log"; then
    return 0
  else
    return 1
  fi
}

# Main loop
main() {
  log "=== E2E Test Loop ==="
  log "Max iterations: $MAX_ITERATIONS"
  log ""

  # Pre-flight checks
  check_servers || exit 1

  # Seed database
  seed_database

  # Install Playwright browsers if needed
  cd "$E2E_DIR"
  if [ ! -d "node_modules" ]; then
    log "Installing E2E dependencies..."
    pnpm install
  fi
  npx playwright install chromium --with-deps 2>/dev/null || npx playwright install chromium

  # Test loop
  for ((i = 1; i <= MAX_ITERATIONS; i++)); do
    log ""
    log "=========================================="
    log "  Iteration $i of $MAX_ITERATIONS"
    log "=========================================="

    if run_tests "$i"; then
      log ""
      log "ALL TESTS PASSED on iteration $i!"
      log "Report: $RESULTS_DIR/report.md"
      exit 0
    fi

    log ""
    warn "Tests failed on iteration $i"
    warn "Report: $RESULTS_DIR/report.md"
    warn "JSON:   $RESULTS_DIR/report.json"

    if [ "$i" -lt "$MAX_ITERATIONS" ]; then
      log ""
      log "Review the report, fix the issues, then press Enter to re-run..."
      read -r
    fi
  done

  error ""
  error "Tests still failing after $MAX_ITERATIONS iterations."
  error "Review $RESULTS_DIR/report.md for details."
  exit 1
}

main "$@"
