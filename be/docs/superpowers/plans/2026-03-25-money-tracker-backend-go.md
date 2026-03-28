# Money Tracker Backend (Go) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun backend Go berbasis Gin untuk Money Tracker PWA dengan auth session-based, family management, invite flow, dan transaction ledger di PostgreSQL.

**Architecture:** Gunakan clean architecture ringan dengan batas jelas per layer (handler, service, repository, model) dalam satu monolith. Session disimpan di Redis, migration dikelola Atlas, dan seluruh endpoint mengikuti kontrak spec agar frontend bisa langsung integrasi.

**Tech Stack:** Go 1.21+, Gin, PostgreSQL 17, Redis, Atlas, Docker

---

## File Map

- Create: `cmd/server/main.go`
- Create: `internal/config/config.go`
- Create: `internal/model/user.go`
- Create: `internal/model/family.go`
- Create: `internal/model/invite.go`
- Create: `internal/model/category.go`
- Create: `internal/model/transaction.go`
- Create: `internal/model/dto.go`
- Create: `internal/repository/user.go`
- Create: `internal/repository/family.go`
- Create: `internal/repository/invite.go`
- Create: `internal/repository/category.go`
- Create: `internal/repository/transaction.go`
- Create: `internal/repository/session.go`
- Create: `internal/service/auth.go`
- Create: `internal/service/family.go`
- Create: `internal/service/invite.go`
- Create: `internal/service/category.go`
- Create: `internal/service/transaction.go`
- Create: `internal/handler/auth.go`
- Create: `internal/handler/family.go`
- Create: `internal/handler/invite.go`
- Create: `internal/handler/category.go`
- Create: `internal/handler/transaction.go`
- Create: `internal/middleware/auth.go`
- Create: `internal/middleware/error.go`
- Create: `internal/middleware/ratelimit.go`
- Create: `internal/router/router.go`
- Create: `internal/bootstrap/container.go`
- Create: `migrations/atlas.hcl`
- Create: `migrations/20260325_001_init_core_tables.sql`
- Create: `migrations/20260325_002_upgrade_transactions_for_family.sql`
- Create: `migrations/20260325_003_seed_default_categories.sql`
- Create: `migrations/20260325_004_migrate_legacy_transactions.sql`
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `.env.example`
- Modify: `go.mod`
- Modify: `go.sum`

## Constraints

- Fokus pada scope spec `docs/superpowers/specs/2026-03-25-money-tracker-backend-go-design.md`.
- Tidak menambah subsystem baru di luar auth/family/invite/transaction/category.
- Tidak membuat file unit test baru (sesuai policy saat ini).
- Verifikasi dilakukan lewat build, migrate, dan API smoke checks.

### Task 1: Bootstrap Project Skeleton

**Files:**
- Create: `go.mod`
- Create: `cmd/server/main.go`
- Create: `internal/bootstrap/container.go`
- Create: `internal/router/router.go`
- Create: `internal/config/config.go`
- Create: `.env.example`
- Create: `Dockerfile`
- Create: `docker-compose.yml`

- [ ] **Step 1: Inisialisasi module dan dependency inti**

Run: `go mod init money-tracker-be`

- [ ] **Step 2: Tambahkan dependency runtime utama**

Run: `go get github.com/gin-gonic/gin github.com/jackc/pgx/v5 github.com/redis/go-redis/v9 github.com/google/uuid golang.org/x/crypto/bcrypt`

- [ ] **Step 3: Buat config loader berbasis manual env vars**

Implement parser `os.Getenv` + default value untuk DB, Redis, CORS, dan session.

- [ ] **Step 4: Buat bootstrap container dependency**

Wiring koneksi PostgreSQL, Redis, config object, dan registry service/handler.

- [ ] **Step 5: Buat router dasar dengan health endpoint**

Expose `GET /health` dan route group `/api`.

- [ ] **Step 6: Buat entrypoint server**

Start Gin server dari config (`SERVER_PORT`) dan attach middleware global.

- [ ] **Step 7: Tambahkan `.env.example` dan container setup**

Siapkan env template + Dockerfile + `docker-compose.yml` dengan service `backend`, `postgres`, dan `redis` agar sesuai kontrak spec.

- [ ] **Step 8: Verifikasi compile dan startup lokal**

Run: `go build ./...`

Run: `go run ./cmd/server`

Expected: server start tanpa panic dan `GET /health` return 200.

- [ ] **Step 9: Commit bootstrap**

Run:
```bash
git add go.mod go.sum cmd/server/main.go internal/bootstrap/container.go internal/router/router.go internal/config/config.go .env.example Dockerfile docker-compose.yml
git commit -m "chore: bootstrap go backend skeleton with gin, pg, and redis"
```

### Task 2: Implement Atlas Migrations dan Legacy Mapping

**Files:**
- Create: `migrations/atlas.hcl`
- Create: `migrations/20260325_001_init_core_tables.sql`
- Create: `migrations/20260325_002_upgrade_transactions_for_family.sql`
- Create: `migrations/20260325_003_seed_default_categories.sql`
- Create: `migrations/20260325_004_migrate_legacy_transactions.sql`

- [ ] **Step 1: Konfigurasi Atlas untuk environment lokal**

Set URL koneksi ke database `money_tracker` (`app_user/app_password`) dan folder migration lokal.

- [ ] **Step 2: Buat migration core tables**

Create `users`, `families`, `family_members`, `invite_tokens`, `categories` + FK/index utama.

- [ ] **Step 3: Buat migration perubahan table `transactions`**

Tambah kolom `family_id`, `wallet_owner_id`, `category_id`, `note`, `created_by`, `updated_at`; ubah `id` ke UUID sesuai strategi yang aman.

- [ ] **Step 4: Buat migration seed kategori default**

Seed kategori income/expense minimal untuk kebutuhan frontend.

- [ ] **Step 5: Buat migration legacy data**

Create system user (`system@money-tracker.local`), create family `Imported Transactions`, dan map seluruh row lama ke family/system user.

- [ ] **Step 6: Tambahkan guard read-only untuk legacy creator**

Simpan penanda di data user/system agar service layer bisa blok update/delete legacy rows.

- [ ] **Step 7: Jalankan migration di lokal**

Run: `atlas migrate apply --env local`

Expected: semua migration applied tanpa error.

- [ ] **Step 8: Verifikasi schema hasil migration**

Run: `docker exec postgres_db psql -U app_user -d money_tracker -c "\d transactions"`

Expected: kolom baru dan constraint utama tersedia.

- [ ] **Step 8b: Verifikasi kolom legacy tetap dipertahankan**

Run: `docker exec postgres_db psql -U app_user -d money_tracker -c "SELECT message_id, bank_name, account_number, balance, raw_email FROM transactions LIMIT 1"`

Expected: kolom legacy masih ada dan bisa dibaca.

- [ ] **Step 9: Commit migration set**

Run:
```bash
git add migrations
git commit -m "feat: add atlas migrations for family-aware money tracker schema"
```

### Task 3: Implement Domain Models, Repository, dan Session Store

**Files:**
- Create: `internal/model/user.go`
- Create: `internal/model/family.go`
- Create: `internal/model/invite.go`
- Create: `internal/model/category.go`
- Create: `internal/model/transaction.go`
- Create: `internal/model/dto.go`
- Create: `internal/repository/user.go`
- Create: `internal/repository/family.go`
- Create: `internal/repository/invite.go`
- Create: `internal/repository/category.go`
- Create: `internal/repository/transaction.go`
- Create: `internal/repository/session.go`

- [ ] **Step 1: Definisikan struct domain entities**

Model untuk User, Family, FamilyMember, InviteToken, Category, Transaction dengan field sesuai spec.

- [ ] **Step 2: Definisikan DTO request/response**

DTO untuk auth, create family, invite join, create/update transaction, list transactions, family summary.

- [ ] **Step 3: Buat interface repository per domain**

Pisahkan kontrak `UserRepository`, `FamilyRepository`, `TransactionRepository`, `SessionRepository`, dll.

- [ ] **Step 4: Implement PostgreSQL repository method utama**

Minimal method untuk use case MVP (create/read/update) + pagination transaksi.

- [ ] **Step 5: Implement Redis session repository**

Store/get/delete session berdasarkan `session:{session_id}` dan TTL session duration.

- [ ] **Step 6: Tambahkan query summary family**

Implement aggregate income/expense/net by period (today/week/month) sesuai kebutuhan frontend.

- [ ] **Step 7: Verifikasi build layer data**

Run: `go build ./...`

Expected: model + repository compile clean.

- [ ] **Step 8: Commit data layer**

Run:
```bash
git add internal/model internal/repository
git commit -m "feat: implement domain models and repositories for money tracker"
```

### Task 4: Implement Service Layer (Business Rules)

**Files:**
- Create: `internal/service/auth.go`
- Create: `internal/service/family.go`
- Create: `internal/service/invite.go`
- Create: `internal/service/category.go`
- Create: `internal/service/transaction.go`

- [ ] **Step 1: Implement auth service**

Register/login/logout dengan bcrypt hashing (cost 10), validasi minimum password 8 karakter, session creation, dan conflict handling email.

Tambahkan hard rule: user dengan flag system/legacy (`system@money-tracker.local`) tidak boleh login.

- [ ] **Step 2: Implement family service**

Create family + auto-add owner membership + get members + get summary.

- [ ] **Step 3: Implement invite service**

Generate token single-use + expiry, validate join, enforce owner-only create invite.

- [ ] **Step 4: Implement category service**

List kategori berdasarkan type (income/expense).

- [ ] **Step 5: Implement transaction service**

Create/list/update/delete dengan rules:
- family_id dari session
- wallet_owner_id optional default current user
- update/delete hanya `created_by`
- block modification untuk legacy transactions milik system user

- [ ] **Step 6: Implement error mapping domain ke API code**

Map ke `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, `INTERNAL_ERROR`.

- [ ] **Step 7: Verifikasi flow service dengan smoke script manual**

Run: `go build ./...`

Expected: semua service compile dan rule utama ter-cover di code path.

- [ ] **Step 8: Commit service layer**

Run:
```bash
git add internal/service
git commit -m "feat: add business services for auth family invite and transactions"
```

### Task 5: Implement HTTP Handlers, Middleware, dan Routing

**Files:**
- Create: `internal/handler/auth.go`
- Create: `internal/handler/family.go`
- Create: `internal/handler/invite.go`
- Create: `internal/handler/category.go`
- Create: `internal/handler/transaction.go`
- Create: `internal/middleware/auth.go`
- Create: `internal/middleware/error.go`
- Create: `internal/middleware/ratelimit.go`
- Modify: `internal/router/router.go`

- [ ] **Step 1: Implement middleware error recovery global**

Panic recovery + JSON error envelope konsisten.

- [ ] **Step 2: Implement middleware auth session**

Read cookie `session_id`, validate ke Redis, inject user context ke Gin context, enforce cookie flags `HttpOnly`, `Secure`, `SameSite=Strict`, refresh TTL session on activity, dan sediakan helper validasi bahwa semua `family_id` pada path/query harus match `family_id` pada session.

Tambahkan cek membership aktif user terhadap family pada setiap request family-scoped sebelum handler dijalankan.

- [ ] **Step 3: Implement middleware rate limiting**

Apply rules sesuai spec untuk login/register/invite (`5/15m`, `3/jam`, `10/jam`).

- [ ] **Step 3b: Implement middleware CORS**

Handle preflight request dan allowed origins dari env `CORS_ALLOWED_ORIGINS`.

- [ ] **Step 4: Implement auth handlers**

`POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`.

- [ ] **Step 5: Implement family + invite handlers**

`POST /api/families`, `GET /api/families/:id/summary`, `GET /api/families/:id/members`, `POST /api/families/:id/invites`, `POST /api/invites/:token/join`.

Tambahkan validasi otorisasi bahwa `family_id` pada parameter request harus match dengan `family_id` di session context.

- [ ] **Step 6: Implement transaction + category handlers**

`GET /api/transactions` (`familyId`, `ownerId`, `period`, `page`, `limit`) dengan default `page=1`, `limit=20`, `POST /api/transactions`, `PATCH /api/transactions/:id`, `DELETE /api/transactions/:id`, `GET /api/categories`.

Pastikan `familyId` pada query tervalidasi match dengan `family_id` di session sebelum query data.

- [ ] **Step 7: Wire seluruh route group dan middleware**

Endpoint non-auth wajib lewat auth middleware.

- [ ] **Step 8: Verifikasi startup + route registration**

Run: `go run ./cmd/server`

Run: `curl -i http://localhost:8080/health`

Expected: 200 OK untuk health; endpoint protected return 401 tanpa session.

- [ ] **Step 9: Commit delivery API surface**

Run:
```bash
git add internal/handler internal/middleware internal/router
git commit -m "feat: expose money tracker REST api with auth middleware"
```

### Task 6: End-to-End Smoke Validation dan Delivery Notes

**Files:**
- Create: `docs/superpowers/plans/2026-03-25-money-tracker-backend-go-smoke-checklist.md`
- Modify: `docs/superpowers/plans/2026-03-25-money-tracker-backend-go.md`

- [ ] **Step 1: Tulis checklist smoke test manual**

Isi urutan request untuk register, login, create family, create invite, join invite, create transaction, list transaction, family summary.

- [ ] **Step 2: Jalankan smoke flow auth + family**

Verifikasi cookie session tercipta dan bisa dipakai akses endpoint protected.

- [ ] **Step 3: Jalankan smoke flow transaction**

Verifikasi create/update/delete rules dan filter `familyId`, `ownerId`, `period` beserta pagination `page/limit`.

- [ ] **Step 4: Jalankan smoke flow migration compatibility**

Verifikasi legacy row tetap terbaca dan tidak bisa diupdate/delete lewat API.

- [ ] **Step 5: Verifikasi container flow**

Run: `docker compose up --build`

Expected: backend up, connect ke postgres/redis, health endpoint reachable.

- [ ] **Step 5b: Verifikasi rate limit endpoint kritikal**

Jalankan request berulang ke login/register/invite sampai melebihi batas.

Expected: response `429 RATE_LIMITED` muncul sesuai threshold spec.

- [ ] **Step 6: Rekam hasil verifikasi di checklist**

Isi pass/fail + temuan penting untuk handoff.

- [ ] **Step 7: Commit smoke checklist dan catatan rilis**

Run:
```bash
git add docs/superpowers/plans/2026-03-25-money-tracker-backend-go-smoke-checklist.md docs/superpowers/plans/2026-03-25-money-tracker-backend-go.md
git commit -m "docs: add backend smoke checklist and implementation handoff notes"
```

## Definition of Done

- Semua endpoint di spec tersedia dan mengikuti format response error yang konsisten.
- Session-based auth aktif via Redis cookie session.
- Migration Atlas sukses diterapkan pada database `money_tracker` existing.
- Legacy transactions tetap tersedia dengan policy read-only.
- Backend dapat dijalankan lokal via `go run` dan via `docker compose up --build`.
