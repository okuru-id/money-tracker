# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language

Selalu jawab dalam Bahasa Indonesia.

## Project Overview

Money Tracker - Monorepo untuk aplikasi pelacakan keuangan keluarga. Terdiri dari:
- **be/**: Go backend API (Gin, PostgreSQL, Redis)
- **fe/**: Frontend PWA mobile-first (React, Vite, TypeScript)

Target utama: Fast transaction input dalam < 15 detik untuk pengguna keluarga.

## Commands

### Backend (be/)

```bash
cd be

# Build
go build ./...

# Run server
go run ./cmd/server

# Run with Docker
docker compose up --build

# Deploy from root
../deploy.sh
../deploy.sh backend
../deploy.sh frontend
../deploy.sh status

# Apply database migrations (Atlas)
atlas migrate apply --env local

# Verify schema
docker exec postgres_db psql -U app_user -d money_tracker -c "\d transactions"
```

### Frontend (fe/)

```bash
cd fe

# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Build
pnpm build

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## Architecture

### Backend (be/) - 4-Layer Clean Architecture

1. **Handler** (`internal/handler/`) - Gin HTTP handlers, request parsing, response formatting
2. **Service** (`internal/service/`) - Business logic, authorization, validation
3. **Repository** (`internal/repository/`) - PostgreSQL/Redis operations
4. **Model** (`internal/model/`) - Domain entities and DTOs

Flow: HTTP Request → Handler → Service → Repository → Database → Response

### Frontend (fe/) - Feature-Based Structure

```
fe/src/
├── app/           # Router, providers, gates
├── features/      # Feature modules (auth, family, transactions, etc.)
├── layouts/       # Mobile shell layout
├── lib/           # Utilities (toast, analytics, pwa)
└── components/    # Shared components
```

Route gates menentukan akses berdasarkan session dan family membership:
- `PublicOnlyGate`: Untuk login/register (hanya jika belum login)
- `SessionGate`: Membutuhkan session aktif
- `NoFamilyOnlyGate`: Untuk family setup/join (hanya jika belum punya family)
- `FamilyRequiredGate`: Membutuhkan family membership

## Key Design Decisions

### Session Management
- Redis-backed sessions dengan key `session:{session_id}`, 7-day TTL
- Cookie-based auth: HttpOnly, Secure, SameSite=Strict

### Transaction Ownership
- Hanya `created_by` user dapat update/delete transactions
- `wallet_owner_id` dapat berbeda dari creator (untuk tracking family members' wallets)
- Legacy transactions (dari email parsing system) bersifat read-only

### Legacy Data Handling
- System user (`system@money-tracker.local`) untuk legacy data ownership
- Legacy fields preserved: `message_id`, `bank_name`, `account_number`, `balance`, `raw_email`
- Existing transactions dimigrasi ke schema baru dengan family dan owner placeholder

## Rate Limiting Rules

- `/api/auth/login`: 5 attempts per 15 minutes per IP
- `/api/auth/register`: 3 attempts per hour per IP
- `/api/families/:id/invites`: 10 per hour per family

## Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Amount must be greater than 0",
    "details": { "field": "amount" }
  }
}
```

Error codes: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, `INTERNAL_ERROR`

## Tech Stack

### Backend
- Go 1.23+, Gin, PostgreSQL 17, Redis, Atlas, Docker
- Driver: `github.com/jackc/pgx/v5` untuk PostgreSQL
- Redis client: `github.com/redis/go-redis/v9`

### Frontend
- React 19, TypeScript, Vite 8
- React Router DOM 7, TanStack Query
- PWA dengan vite-plugin-pwa, workbox
- Tabler Icons untuk UI icons

## Menu Structure

### User Pages (MobileShell Layout)
Halaman yang diakses oleh semua user dengan bottom navigation:

| Route | Tab Label | Icon | Family Required |
|-------|-----------|------|-----------------|
| `/` | Home | IconHome | Yes |
| `/history` | History | IconCash | Yes |
| `/add` | Add | IconPlus (featured) | Yes |
| `/insights` | Insights | IconChartBar | Yes |
| `/settings` | Settings | IconSettings | No |

**TopBar**: Menampilkan email user, badge Admin (jika role=admin), dan button logout.

### Admin Pages (AdminPage Layout)
Halaman yang diakses hanya oleh user dengan role `admin`:

| Route | Tab Label | Icon | Description |
|-------|-----------|------|-------------|
| `/admin` | Transactions | IconList | List semua transaksi |
| `/admin` | Families | IconBuildingCommunity | CRUD families + manage members |
| `/admin` | Users | IconUsers | CRUD users |

**TopBar**: Sama dengan user pages (email, badge Admin, logout).

### Settings Page Menu
Menu items di `/settings`:
- **Admin Dashboard** - Link ke `/admin` (hanya untuk admin)
- **Family Management** - Link ke `/settings/family` (hanya jika punya family)
- **Install App** - PWA install prompt
- **Logout** - Button logout
