# Bank Account Multi-Number Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Satu bank account card bisa menyimpan lebih dari satu nomor akun, dan semua lookup transaksi tetap konsisten ke card yang sama.

**Architecture:** Tambah tabel relasi `bank_account_numbers` sebagai sumber kebenaran untuk nomor akun, lalu ubah repository/service backend agar agregasi balance dan lookup transaksi membaca nomor dari tabel itu. Frontend tetap memakai satu card per bank account, tetapi menampilkan daftar nomor akun dan mengirim nomor individual saat memilih rekening transaksi.

**Tech Stack:** Go 1.23, PostgreSQL, Gin, React 19, TypeScript 5.9, TanStack Query, Vite

---

### Task 1: Skema database multi-number

**Files:**
- Create: `be/migrations/20260406010_add_bank_account_numbers.sql`

- [ ] **Step 1: Tambah tabel relasi nomor akun**

Buat tabel `bank_account_numbers` dengan kolom `id`, `bank_account_id`, `family_id`, `account_number`, `created_at`, `updated_at`.

- [ ] **Step 2: Pindahkan data existing**

Insert data dari `bank_accounts.account_number` lama ke tabel baru untuk semua row yang masih punya nomor.

- [ ] **Step 3: Tambah constraint unik**

Buat unique index `(family_id, account_number)` supaya satu nomor tidak bisa dipakai oleh dua bank account di family yang sama.

### Task 2: Backend model, repository, dan service

**Files:**
- Modify: `be/internal/model/bank_account.go`
- Modify: `be/internal/model/dto.go`
- Modify: `be/internal/repository/bank_account.go`
- Modify: `be/internal/service/bank_account.go`
- Modify: `be/internal/handler/bank_account.go`
- Modify: `be/internal/repository/transaction.go`
- Modify: `be/internal/service/transaction.go`

- [ ] **Step 1: Ubah model response jadi array nomor akun**

Ganti `AccountNumber` menjadi `AccountNumbers []string` pada model dan DTO bank account.

- [ ] **Step 2: Normalisasi input nomor akun**

Tambahkan helper untuk trim, buang string kosong, dan dedupe nomor akun sebelum disimpan.

- [ ] **Step 3: Simpan nomor akun di tabel relasi**

Pada create/update, simpan nomor akun ke `bank_account_numbers` dalam satu transaksi database.

- [ ] **Step 4: Agregasi nomor akun saat read**

Update `FindByID` dan `ListByFamilyID` agar mengembalikan `account_numbers` dalam satu row.

- [ ] **Step 5: Lookup transaksi lewat nomor mana pun**

Ubah join transaksi agar membaca `bank_account_numbers.account_number`, bukan kolom lama di `bank_accounts`.

- [ ] **Step 6: Recalculate balance per card**

Pastikan update saldo bank account menghitung semua transaksi dari semua nomor yang terhubung ke card yang sama.

### Task 3: Frontend API dan UI

**Files:**
- Modify: `fe/src/features/transactions/api.ts`
- Modify: `fe/src/features/insights/pages/insights-page.tsx`
- Modify: `fe/src/features/transactions/pages/add-page.tsx`
- Modify: `fe/src/features/history/components/transaction-item.tsx`

- [ ] **Step 1: Ubah tipe dan parser API bank account**

Ganti `accountNumber` menjadi `accountNumbers` dan dukung respons array dari backend.

- [ ] **Step 2: Tampilkan daftar nomor di bank account card**

Di insights card, tampilkan semua nomor akun sebagai list kecil di bawah nama card.

- [ ] **Step 3: Ubah form bank account menjadi multi-number**

Form create/edit harus bisa menambah lebih dari satu nomor akun untuk satu card.

- [ ] **Step 4: Flatten pilihan rekening transaksi**

Dropdown transaksi harus memilih nomor akun individual dengan label `nama bank - nomor`.

### Task 4: Verifikasi

**Files:**
- None

- [ ] **Step 1: Jalankan build backend**

Run: `go build ./...`

- [ ] **Step 2: Jalankan typecheck frontend**

Run: `pnpm typecheck`

- [ ] **Step 3: Jalankan lint dan build frontend bila perubahan UI signifikan**

Run: `pnpm lint` dan `pnpm build`
