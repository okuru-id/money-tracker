#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  printf 'Error: file %s tidak ditemukan.\n' "$ENV_FILE" >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  printf 'Error: psql tidak ditemukan di PATH.\n' >&2
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

RESET_DB_CONFIRM=yes

if [[ "${RESET_DB_CONFIRM:-}" != "yes" ]]; then
  printf 'Error: set RESET_DB_CONFIRM=yes untuk mengizinkan reset schema lokal.\n' >&2
  exit 1
fi

cd "$SCRIPT_DIR"

DATABASE_URL="postgres://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=$DB_SSLMODE"

psql "$DATABASE_URL" -c "DROP SCHEMA IF EXISTS atlas_schema_revisions CASCADE; DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;"

printf 'Schema database %s berhasil di-reset.\n' "$DB_NAME"
