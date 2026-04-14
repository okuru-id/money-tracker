#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/be"
FRONTEND_DIR="$SCRIPT_DIR/fe"
BACKEND_RUNNER="$BACKEND_DIR/run.sh"
BACKEND_ENV_FILE="$BACKEND_DIR/.env"

cleanup_done=false

err() {
  printf 'Error: %s\n' "$1" >&2
  exit 1
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    err "$1 tidak ditemukan di PATH."
  fi
}

cleanup() {
  if [[ "$cleanup_done" == true ]]; then
    return
  fi

  cleanup_done=true

  if [[ -n "${backend_pid:-}" ]] && kill -0 "$backend_pid" >/dev/null 2>&1; then
    kill "$backend_pid" >/dev/null 2>&1 || true
  fi

  if [[ -n "${frontend_pid:-}" ]] && kill -0 "$frontend_pid" >/dev/null 2>&1; then
    kill "$frontend_pid" >/dev/null 2>&1 || true
  fi
}

handle_signal() {
  cleanup
  exit 130
}

require_command go
require_command pnpm

[[ -f "$BACKEND_RUNNER" ]] || err "file $BACKEND_RUNNER tidak ditemukan."
[[ -f "$BACKEND_ENV_FILE" ]] || err "file $BACKEND_ENV_FILE tidak ditemukan."
[[ -d "$FRONTEND_DIR" ]] || err "directory $FRONTEND_DIR tidak ditemukan."

trap handle_signal INT TERM
trap cleanup EXIT

bash "$BACKEND_RUNNER" &
backend_pid=$!

(
  cd "$FRONTEND_DIR"
  pnpm dev
) &
frontend_pid=$!

printf 'Menjalankan backend (PID %s) dan frontend (PID %s).\n' "$backend_pid" "$frontend_pid"
printf 'Tekan Ctrl+C untuk menghentikan keduanya.\n'

set +e
wait -n "$backend_pid" "$frontend_pid"
exit_code=$?
cleanup
wait "$backend_pid" 2>/dev/null
wait "$frontend_pid" 2>/dev/null
set -e

exit "$exit_code"
