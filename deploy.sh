#!/usr/bin/env bash
set -euo pipefail

# ── Config ──────────────────────────────────────────────
BACKEND_DIR="be"
FRONTEND_DIR="fe"

# ── Colors ──────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { printf "${CYAN}[deploy]${NC} %s\n" "$*"; }
ok()   { printf "${GREEN}[ok]${NC}    %s\n" "$*"; }
warn() { printf "${YELLOW}[warn]${NC}  %s\n" "$*"; }
err()  { printf "${RED}[err]${NC}   %s\n" "$*" >&2; exit 1; }

# ── Steps ───────────────────────────────────────────────

update_source() {
  log "Pulling latest changes..."
  git pull
  ok "Source code updated"
}

build_backend() {
  log "Building backend..."
  (cd "$BACKEND_DIR" && docker compose build --no-cache backend)
  ok "Backend image built"
}

build_frontend() {
  log "Building frontend..."
  (cd "$FRONTEND_DIR" && docker compose build --no-cache web)
  ok "Frontend image built"
}

deploy_backend() {
  log "Deploying backend..."
  (cd "$BACKEND_DIR" && docker compose up -d backend)
  ok "Backend deployed"
}

deploy_frontend() {
  log "Deploying frontend..."
  (cd "$FRONTEND_DIR" && docker compose up -d web)
  ok "Frontend deployed"
}

prune_images() {
  log "Removing dangling images..."
  docker image prune -f
  ok "Dangling images removed"
}

show_status() {
  printf "\n"
  log "Container status:"
  docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=mt-"
}

# ── CLI ─────────────────────────────────────────────────

usage() {
  cat <<EOF
Usage: $(basename "$0") <command> [options]

Commands:
  all          Build + deploy both backend & frontend, then prune
  backend      Build + deploy backend only
  frontend     Build + deploy frontend only
  build        Build both without deploying
  deploy       Deploy both without rebuilding
  prune        Remove dangling Docker images only
  status       Show mt-* container status

Options:
  --no-prune   Skip image pruning (for all/build commands)
EOF
  exit 0
}

NO_PRUNE=false
COMMAND=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --no-prune) NO_PRUNE=true; shift ;;
    -h|--help)  usage ;;
    all|backend|frontend|build|deploy|prune|status)
      COMMAND="$1"; shift ;;
    *) err "Unknown option: $1. Use --help for usage." ;;
  esac
done

[[ -z "$COMMAND" ]] && COMMAND="all"

case "$COMMAND" in
  all)
    update_source
    build_backend
    build_frontend
    deploy_backend
    deploy_frontend
    [[ "$NO_PRUNE" == false ]] && prune_images
    show_status
    ;;
  backend)
    update_source
    build_backend
    deploy_backend
    prune_images
    show_status
    ;;
  frontend)
    update_source
    build_frontend
    deploy_frontend
    prune_images
    show_status
    ;;
  build)
    update_source
    build_backend
    build_frontend
    [[ "$NO_PRUNE" == false ]] && prune_images
    ;;
  deploy)
    deploy_backend
    deploy_frontend
    show_status
    ;;
  prune)
    prune_images
    ;;
  status)
    show_status
    ;;
esac
