# AGENTS.md

Panduan untuk agentic coding agents. Prioritas: instruksi user > `CLAUDE.md` root > `be/CLAUDE.md` > dokumen ini.

## Repo Overview

Monorepo Money Tracker — pelacakan keuangan keluarga. Target: input transaksi < 15 detik.
- `be/`: Go 1.23 backend (Gin, PostgreSQL 17, Redis 7, Atlas, pgx/v5, shopspring/decimal)
- `fe/`: React 19 + TypeScript 5.9 + Vite 8 PWA mobile-first (TanStack Query, React Router 7, Tabler Icons)

Tidak ada `.cursorrules`, `.cursor/rules/`, atau `.github/copilot-instructions.md`.

## Aturan Penting

- Selalu jawab dalam Bahasa Indonesia.
- Jangan membuat file test baru atau menambah test case kecuali user meminta eksplisit.
- Jangan ubah file generated kecuali benar-benar diperlukan.
- Jangan menambah dependency baru tanpa kebutuhan nyata.
- Simpan screenshot/image hasil automation browser (`playwright`, `agent-browser`, atau sejenisnya) hanya di `.tmp-shots/`; jangan taruh di root repo atau `fe/public/`.

## Build, Run, Lint, Typecheck

### Backend (`be/`)

```bash
go build ./...                          # verify compilation
go run ./cmd/server                     # run server (default port 8080)
docker compose up --build               # full stack (backend:8081, postgres:5432, redis:6379)
atlas migrate apply --env local         # apply migrations
go test ./...                           # run all tests
go test ./internal/service -run TestAuthLogin -v  # single test verbose
```

Container names: `mt-backend`, `mt-postgres`, `mt-redis`.

### Deploy (`./deploy.sh` dari root)

```bash
./deploy.sh                 # update source, build backend+frontend, deploy keduanya
./deploy.sh backend        # update source, build+deploy backend only
./deploy.sh frontend       # update source, build+deploy frontend only
./deploy.sh build          # update source, build kedua image tanpa deploy
./deploy.sh deploy         # deploy kedua service tanpa build ulang
./deploy.sh status         # lihat status container mt-*
./deploy.sh prune          # hapus dangling Docker images
./deploy.sh --no-prune all  # jalankan all tanpa prune
```

Catatan: skrip ini memanggil `git pull`, lalu `docker compose build --no-cache` dan `docker compose up -d` pada `be/` dan `fe/`.

### Frontend (`fe/`)

```bash
pnpm install        # install dependencies (pnpm 10)
pnpm dev            # dev server (port 5173)
pnpm build          # tsc -b && vite build
pnpm typecheck      # tsc -b only
pnpm lint           # eslint . (flat config, no prettier)
```

Tidak ada test runner yang terkonfigurasi (`pnpm test` belum ada).

### Verifikasi Minimal

- Backend change: `go build ./...`
- Frontend change: `pnpm typecheck` (plus `pnpm lint` + `pnpm build` untuk UI logic signifikan)
- Deploy change: `./deploy.sh status` setelah `./deploy.sh` selesai untuk verifikasi container

## Architecture

### Backend — 4-Layer Clean Architecture

```
HTTP -> Handler (internal/handler/) -> Service (internal/service/) -> Repository (internal/repository/) -> DB
                                                                         ^
                                                                    Model (internal/model/)
```

- Handler: Gin HTTP, request parsing, response formatting, session extraction via `middleware.GetUserID(c)`, `middleware.GetFamilyID(c)`, `middleware.GetUserRole(c)`
- Service: business logic, validation, authorization
- Repository: PostgreSQL (pgx) + Redis (go-redis) operations
- Model: entities + DTOs di `internal/model/dto.go` dan file model terkait
- Middleware: auth, error recovery, rate limiting (`internal/middleware/`)
- Bootstrap: dependency wiring di `internal/bootstrap/container.go`

### Frontend — Feature-Based Structure

```
fe/src/
  app/           # router, providers (TanStack Query config), route gates
  features/      # feature modules (auth, admin, transactions, family, etc.)
  layouts/       # MobileShell (bottom nav), TopBar
  lib/           # toast, analytics, pwa, pull-to-refresh hook
  components/    # shared UI (data-table, dialog, dropdown, empty-state)
```

Route gates: `PublicOnlyGate`, `SessionGate`, `NoFamilyOnlyGate`, `FamilyRequiredGate`, `FamilyOptionalGate`, `AdminGate`.

## Code Style

### General

- Ikuti pola file yang sudah ada; perubahan sekecil mungkin namun lengkap.
- Nama eksplisit, bukan singkatan kabur. Hindari komentar obvious.
- Session: Redis-backed cookie-based auth (`session:{session_id}`, 7-day TTL, HttpOnly/Secure/SameSite=Strict).
- Hanya `created_by` user boleh update/delete transactions.

### Frontend

- **Imports**: eksternal lalu internal, dipisahkan baris kosong. Relative import (no path alias). Type-only import dengan `type`.
- **Formatting**: single quotes, no semicolons, trailing commas multiline. No prettier — ESLint only (strict: `noUnusedLocals`, `noUnusedParameters`).
- **Components**: named function exports (`export function FooPage()`). Props sebagai `type FooProps = { ... }` di file yang sama.
- **Hooks**: awali `use`. Session state memakai external store (`useSyncExternalStore`), bukan Redux.
- **Server state**: React Query dengan descriptive query key array. Query client: `retry: 1`, `refetchOnWindowFocus: false`.
- **API layer**: centralized fetch wrapper `request<T>()` dengan `credentials: 'include'`, `ApiError` class. Defensive response parsing (`typeof row.field === 'string'`).
- **Types**: `type` aliases (bukan `interface`). Hindari `any`; pakai `unknown`. Literal union untuk domain kecil.
- **Error handling**: `isNetworkFailure()`, `toErrorMessage()` dekat UI boundary. `showToast()` untuk feedback.
- **Currency**: `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })`.
- **CSS**: BEM-like classes (`home-page`, `balance-card__value`).

### Backend

- **Imports**: stdlib, third-party, internal — dipisahkan baris kosong. `gofmt` untuk format.
- **Naming**: exported `PascalCase`, unexported `camelCase`, constructor `NewX`, interface by role (`AuthService`, `TransactionRepository`).
- **Types**: `decimal.Decimal` untuk amount finansial. Pointer untuk field opsional. `context.Context` argumen awal service/repository.
- **Error response**: standar JSON `{ "error": { "code": "...", "message": "...", "details": {...} } }`. Codes: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, `INTERNAL_ERROR`.
- **Handler pattern**: struct dengan injected service, Swag annotations, `c.ShouldBindJSON(&req)`, `middleware.ErrorResponse(code, msg, details)`.
- **Logging**: `log.Printf()` di handler. Jangan bocorkan internal error ke client.

## Environment Variables

Frontend (`fe/.env`): `VITE_API_BASE_URL` (default `http://localhost:8081/api`), `VITE_APP_BASE_URL`.

Backend: lihat `be/.env.example`. Key vars: `SERVER_PORT`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `REDIS_HOST`, `SESSION_SECRET`, `ADMIN_EMAILS`.

## Hal yang Tidak Boleh Diasumsikan

- Root bukan git repo utama; backend punya git sendiri.
- Tidak ada automated tests (frontend maupun backend).
- Tidak boleh menambah test file kecuali user minta.
- Port/env default sesuai yang terdokumentasi di atas.
