#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  printf 'Error: file %s tidak ditemukan.\n' "$ENV_FILE" >&2
  exit 1
fi

if ! command -v atlas >/dev/null 2>&1; then
  printf 'Error: atlas CLI tidak ditemukan di PATH.\n' >&2
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

cd "$SCRIPT_DIR"

atlas migrate hash --env local
atlas migrate apply --env local
