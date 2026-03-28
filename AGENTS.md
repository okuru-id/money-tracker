# AGENTS.md

Panduan ini ditujukan untuk agentic coding agents yang bekerja di repository ini.
Ikuti instruksi yang lebih lokal jika ada (`CLAUDE.md`, nested `CLAUDE.md`, atau instruksi user langsung).

## Repo Overview

- Monorepo Money Tracker untuk pelacakan keuangan keluarga.
- `be/`: Go backend API berbasis Gin, PostgreSQL, Redis, Atlas.
- `fe/`: Frontend PWA mobile-first berbasis React, Vite, TypeScript.
- Target produk utama: input transaksi cepat, idealnya < 15 detik.

## Instruction Priority

Urutan prioritas saat ada konflik:

1. Instruksi user langsung.
2. `CLAUDE.md` root.
3. `be/CLAUDE.md` saat mengubah backend.
4. Dokumen ini.

Aturan penting dari instruksi repo saat ini:

- Selalu jawab dalam Bahasa Indonesia.
- Jangan membuat file test baru atau menambah test case kecuali user meminta eksplisit.
- Jangan ubah file generated kecuali benar-benar diperlukan.

## Rules Files Present

- Ditemukan: `CLAUDE.md` di root.
- Ditemukan: `be/CLAUDE.md` untuk backend.
- Tidak ditemukan: `.cursorrules`.
- Tidak ditemukan: `.cursor/rules/`.
- Tidak ditemukan: `.github/copilot-instructions.md`.

## High-Level Architecture

### Backend (`be/`)

Gunakan 4-layer clean architecture yang sudah ada:

1. Handler: parsing request, response HTTP, status code.
2. Service: business logic, validation, authorization.
3. Repository: akses PostgreSQL/Redis.
4. Model: entity dan DTO.

Flow standar: HTTP -> Handler -> Service -> Repository -> Database -> Response.

### Frontend (`fe/src/`)

Struktur berbasis fitur:

- `app/`: router, providers, gates.
- `features/`: modul fitur utama.
- `layouts/`: shell/layout.
- `lib/`: utilitas lintas fitur.
- `components/`: shared components.

Hormati route gates yang sudah ada:

- `PublicOnlyGate`
- `SessionGate`
- `NoFamilyOnlyGate`
- `FamilyRequiredGate`

## Build, Run, Lint, Typecheck, Test

## Root / Monorepo

Jalankan dari root hanya untuk navigasi atau dokumentasi. Root bukan git repo utama.
Gunakan command di subproject terkait.

## Backend Commands (`be/`)

Masuk ke folder backend sebelum menjalankan command.

```bash
go build ./...
go run ./cmd/server
docker compose up --build
atlas migrate apply --env local
docker exec postgres_db psql -U app_user -d money_tracker -c "\d transactions"
go test ./...
```

Single test backend:

```bash
# single package
go test ./internal/service

# single test name in package
go test ./internal/service -run TestAuthLogin

# verbose single test name
go test ./internal/service -run TestAuthLogin -v
```

Catatan backend testing saat ini:

- Belum ditemukan file `*_test.go` di `be/`.
- Jadi `go test ./...` valid untuk verifikasi cepat, tetapi saat ini kemungkinan hanya melaporkan tidak ada test file.

## Frontend Commands (`fe/`)

Jalankan dari `fe/` kecuali disebut lain.

```bash
pnpm install
pnpm dev
pnpm build
pnpm typecheck
pnpm lint
pnpm preview
```

Single test frontend:

- Belum ada test runner proyek yang dikonfigurasi di `fe/package.json`.
- Belum ditemukan test file milik aplikasi di `fe/src/`.
- Jangan mengasumsikan `vitest`, `jest`, atau `playwright` tersedia untuk app kecuali user meminta penambahan.

Jika nanti test runner ditambahkan, pola yang paling konsisten untuk single test kemungkinan akan berbentuk:

```bash
pnpm test -- <path-to-test>
pnpm test -- -t "test name"
```

Namun anggap command di atas hanya template, bukan command aktif saat ini.

## Local E2E Notes

Panduan lokal yang sudah ada:

- Backend lokal biasanya di `http://localhost:8081`.
- Frontend dev default biasanya di `http://localhost:5173`.
- Frontend `.env` memakai `fe/.env.example`.

## Code Style Guidelines

## General

- Ikuti pola file yang sudah ada; jangan refactor besar tanpa alasan langsung.
- Buat perubahan sekecil mungkin namun lengkap.
- Gunakan nama yang eksplisit, bukan singkatan kabur.
- Hindari komentar yang menjelaskan hal obvious; tambah komentar hanya untuk konteks non-obvious.
- Jangan menambah dependency baru tanpa kebutuhan nyata.

## Imports

### Frontend

- Pertahankan pemisahan impor eksternal lalu internal, dipisahkan satu baris kosong.
- Gunakan relative import yang konsisten dengan pola sekarang; repo belum memakai path alias.
- Import type-only dengan `type` bila relevan, misalnya `type FormEvent`.
- Jangan sisipkan import yang tidak dipakai; TypeScript strict aktif.

### Backend

- Gunakan grouping impor standar Go: stdlib, third-party, internal module.
- Biarkan formatter Go menangani urutan impor.

## Formatting

### Frontend

- Ikuti format file yang ada: single quotes, semicolon-free, trailing commas multiline.
- Gunakan functional components dan named exports bila pola file demikian.
- Pecah logic ke helper function lokal bila satu komponen mulai padat.

### Backend

- Format dengan `gofmt` setelah edit file Go.
- Jangan melawan format default Go untuk alignment atau wrapping.

## Types and Data Modeling

### Frontend

- Gunakan `type` aliases sebagaimana pola codebase sekarang.
- Hindari `any`; pakai `unknown` jika perlu narrowing.
- Simpan parsing/normalisasi API dekat layer API, bukan tersebar di UI.
- Gunakan literal union sederhana jika domain kecil dan jelas.

### Backend

- DTO request/response berada di `internal/model/dto.go` atau file model terkait.
- Gunakan pointer untuk field opsional yang memang bisa null.
- Gunakan `decimal.Decimal` untuk amount finansial; jangan ganti ke float.
- Gunakan `context.Context` sebagai argumen awal untuk service/repository yang melakukan I/O.

## Naming Conventions

### Frontend

- Komponen React: `PascalCase`.
- Hook: awali `use`.
- Helper function lokal: `camelCase`.
- Nama file fitur mengikuti pola yang ada: `login-page.tsx`, `session-store.ts`, `amount-input.tsx`.
- Query key React Query berupa array string yang deskriptif.

### Backend

- Exported type/function: `PascalCase`.
- Unexported helper: `camelCase`.
- Constructor: `NewX`.
- Interface diberi nama berdasarkan role, misalnya `AuthService`, `TransactionRepository`.

## Error Handling

### Frontend

- Gunakan wrapper request terpusat dan `ApiError` untuk kegagalan HTTP.
- Ubah error menjadi pesan user-friendly dekat boundary UI.
- Tangani network failure secara eksplisit bila alur UX membutuhkannya.
- Jangan swallow error diam-diam jika statusnya memengaruhi routing/session.

### Backend

- Kembalikan error response dengan bentuk standar:
  - `VALIDATION_ERROR`
  - `UNAUTHORIZED`
  - `FORBIDDEN`
  - `NOT_FOUND`
  - `CONFLICT`
  - `RATE_LIMITED`
  - `INTERNAL_ERROR`
- Handler bertanggung jawab memetakan error ke HTTP status dan payload response.
- Jangan bocorkan raw internal error ke client.
- Logging boleh dilakukan di handler/middleware, tetapi response ke client tetap generik.

## Backend Implementation Notes

- Keep business rules di service, bukan di handler.
- Repository fokus ke query dan persistence, bukan policy.
- Session disimpan di Redis dengan key `session:{session_id}`.
- Auth menggunakan cookie-based session, bukan bearer token.
- Legacy transaction fields harus dipertahankan; jangan hapus support tanpa permintaan eksplisit.
- Hanya creator transaksi yang boleh update/delete sesuai aturan domain repo.

## Frontend Implementation Notes

- Gunakan React Query untuk server state.
- Konfigurasi global query client sudah ada di `fe/src/app/providers.tsx`.
- Session/auth state memakai external store, bukan Redux.
- Routing dan access control harus lewat gate yang ada, bukan condition tersebar di page.
- PWA behavior sudah aktif; hati-hati pada side effect startup seperti `registerSW`.
- Desain UI harus mobile-first dan mengikuti visual language yang sudah ada, bukan redesign total.

## Validation and Verification Expectations

- Untuk backend change: minimal jalankan `go build ./...`.
- Untuk frontend change: minimal jalankan `pnpm typecheck`.
- Jika menyentuh frontend UI logic signifikan, jalankan juga `pnpm lint` dan `pnpm build` bila memungkinkan.
- Jika command verifikasi tidak bisa dijalankan, sebutkan alasannya secara eksplisit.

## Things Agents Should Not Assume

- Jangan asumsikan root adalah git repo; backend tampak punya git sendiri.
- Jangan asumsikan frontend sudah punya automated tests.
- Jangan asumsikan nama env atau port berbeda dari yang terdokumentasi.
- Jangan asumsikan boleh menambah test file; itu dilarang kecuali user meminta.

## Good Defaults for Future Agents

- Saat ragu, pilih perubahan kecil yang mengikuti pattern existing.
- Saat menambah endpoint backend, sentuh layer handler -> service -> repository secara eksplisit.
- Saat menambah fitur frontend, mulai dari `features/` dan hubungkan ke router/gates bila perlu.
- Saat menulis dokumentasi atau penjelasan ke user, gunakan Bahasa Indonesia.

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

## Navigation Components

### TopBar (`fe/src/components/top-bar.tsx`)
Komponen top bar yang ditampilkan di semua halaman authenticated.

**Fitur:**
- Menampilkan email user yang sedang login
- Badge "Admin" (hanya jika `session.isAdmin === true`)
- Button logout dengan icon `IconLogout`

### MobileShell (`fe/src/layouts/mobile-shell.tsx`)
Layout utama untuk halaman user dengan bottom tab navigation.

**Structure:**
```
MobileShell
├── TopBar
├── PullToRefresh
│   └── Outlet (page content)
└── Bottom Tab Navigation
```

**Filter Logic:**
- Jika `session.hasFamily === false`: Tabs Home, History, Add, Insights disembunyikan
- Tab Settings selalu visible

### AdminPage (`fe/src/features/admin/pages/admin-page.tsx`)
Layout untuk halaman admin dengan internal tab navigation.

**Structure:**
```
AdminPage
├── TopBar (admin-topbar)
├── Header (Back button + title)
├── Tab Navigation (horizontal tabs)
├── Content (Transactions/Families/Users)
└── Modals (CRUD operations)
```

## Pull-to-Refresh

**Location:** `MobileShell` wraps content with `PullToRefresh`

**Behavior:**
- Triggered when user pulls down while at top of scroll
- Threshold: 80px pull distance
- Default action: `queryClient.invalidateQueries()` (refresh all data)

**Admin Page:** Tidak ada pull-to-refresh (`overscroll-behavior: none`)
