# Money Tracking Mobile PWA (Family) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun MVP mobile-first PWA untuk pencatatan keuangan keluarga dengan alur input transaksi cepat, auth, join family via invite, riwayat personal, dan ringkasan keluarga real-time sederhana.

**Architecture:** Monorepo sederhana berisi frontend PWA (React + Vite) dan backend API (Node.js + Fastify) dengan PostgreSQL via Prisma. Frontend fokus pada 4 tab mobile (`Home`, `Add`, `History`, `Family`) dan backend menyediakan auth, membership keluarga tunggal per user, ledger transaksi, serta read model ringkasan keluarga per periode.

**Tech Stack:** React, TypeScript, Vite, React Router, TanStack Query, Fastify, Prisma, PostgreSQL, Zod, Workbox (PWA shell), pnpm.

---

### Task 1: Bootstrap Monorepo dan Fondasi Runtime

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `apps/web/package.json`
- Create: `apps/api/package.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/tsconfig.json`
- Create: `apps/api/tsconfig.json`
- Create: `.env.example`

- [ ] **Step 1: Inisialisasi workspace package manager**

Run: `pnpm init`
Expected: file `package.json` root terbentuk.

- [ ] **Step 2: Tambahkan workspace config**

Buat `pnpm-workspace.yaml` dengan package scope `apps/*`.

- [ ] **Step 3: Scaffold app web dan api**

Run: `pnpm create vite apps/web --template react-ts`
Expected: struktur dasar frontend tersedia di `apps/web`.

- [ ] **Step 4: Setup backend minimal Fastify + TypeScript**

Tambahkan entry server awal di `apps/api/src/server.ts` dan script `dev/build/start`.

- [ ] **Step 5: Tetapkan naming workspace/package yang konsisten**

Set `name` package eksplisit (mis. `@money-tracker/web`, `@money-tracker/api`) agar semua filter command `pnpm --filter` deterministik.

- [ ] **Step 6: Sinkronisasi env template**

Definisikan variabel penting di `.env.example` (`DATABASE_URL`, `JWT_SECRET`, `APP_BASE_URL`, `API_BASE_URL`).


### Task 2: Database Schema dan Prisma Setup

**Files:**
- Create: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/migrations/*`
- Create: `apps/api/src/lib/db.ts`
- Create: `apps/api/src/lib/time.ts`
- Modify: `apps/api/package.json`

- [ ] **Step 1: Definisikan model sesuai spec**

Implement model `User`, `Family`, `FamilyMember`, `InviteToken`, `Transaction`, `Category` beserta relasi one-family-per-user (MVP).

- [ ] **Step 2: Tambahkan enum domain**

Tambahkan enum `TransactionType` (`INCOME`, `EXPENSE`) dan role member sederhana (`OWNER`, `MEMBER`).

- [ ] **Step 3: Generate migration awal**

Run: `pnpm --filter @money-tracker/api prisma migrate dev --name init`
Expected: folder migration terbentuk dan schema tersinkron ke DB lokal.

- [ ] **Step 4: Buat prisma client singleton**

Implement `apps/api/src/lib/db.ts` untuk koneksi terkelola saat development.


### Task 3: Auth API dan Session Dasar

**Files:**
- Create: `apps/api/src/modules/auth/auth.schema.ts`
- Create: `apps/api/src/modules/auth/auth.service.ts`
- Create: `apps/api/src/modules/auth/auth.routes.ts`
- Create: `apps/api/src/plugins/authenticate.ts`
- Modify: `apps/api/src/server.ts`

- [ ] **Step 1: Definisikan kontrak request/response auth**

Gunakan Zod untuk payload `POST /auth/register` dan `POST /auth/login`.

- [ ] **Step 2: Implement register/login service**

Tambahkan hash password (argon2/bcrypt), validasi email unik, dan issue JWT.

- [ ] **Step 3: Daftarkan route auth**

Expose endpoint auth sesuai API surface spec.

- [ ] **Step 4: Tambahkan middleware autentikasi**

Buat plugin Fastify untuk verifikasi JWT dan inject `currentUser` ke request.

- [ ] **Step 5: Lengkapi kontrak session bootstrap**

Pastikan `POST /auth/login` (atau endpoint `GET /me`) selalu mengembalikan konteks membership aktif (`familyId`, `role`, `hasFamily`) agar frontend dapat memuat layar pasca-login tanpa menebak ID family.


### Task 4: Family Membership dan Invite Flow

**Files:**
- Create: `apps/api/src/modules/family/family.schema.ts`
- Create: `apps/api/src/modules/family/family.service.ts`
- Create: `apps/api/src/modules/family/family.routes.ts`
- Create: `apps/api/src/modules/invite/invite.service.ts`
- Modify: `apps/api/src/server.ts`

- [ ] **Step 1: Implement `POST /families`**

Buat family baru sekaligus membership `OWNER` untuk user pembuat.

- [ ] **Step 2: Implement `POST /families/:id/invites`**

Generate token single-use + expiry, validasi pembuat adalah member family.

- [ ] **Step 3: Implement `POST /invites/:token/join`**

Validasi token belum dipakai/belum kedaluwarsa, lalu buat membership user.

- [ ] **Step 4: Tegakkan aturan satu family per user**

Pastikan user yang sudah punya membership tidak bisa join/create family kedua.

- [ ] **Step 5: Implement family read endpoint untuk Family screen**

Tambahkan `GET /families/:id` (atau `GET /families/:id/overview`) berisi daftar member aktif + status invite token terbaru, dengan authorization check wajib bahwa requester adalah member family.


### Task 5: Transaction Ledger dan Family Summary

**Files:**
- Create: `apps/api/src/modules/transaction/transaction.schema.ts`
- Create: `apps/api/src/modules/transaction/transaction.service.ts`
- Create: `apps/api/src/modules/transaction/transaction.routes.ts`
- Create: `apps/api/src/modules/summary/summary.service.ts`
- Create: `apps/api/src/modules/summary/summary.routes.ts`
- Modify: `apps/api/src/server.ts`

- [ ] **Step 1: Implement `POST /transactions` dengan validasi inti**

Validasi `amount > 0`, `type`, `categoryId`, `transactionDate`, membership, dan permission wallet owner.

- [ ] **Step 2: Update read model summary setelah write**

Setiap sukses `POST /transactions` wajib memicu recompute/update summary untuk period terkait (sinkron atau async ringan) dengan target tampilan perubahan <= 2 detik.

- [ ] **Step 3: Implement `PATCH /transactions/:id`**

Batasi edit hanya untuk pemilik transaksi (`createdBy == currentUser`).

- [ ] **Step 4: Recompute summary setelah edit transaksi**

Setiap sukses `PATCH /transactions/:id` juga memicu update summary agar Home/Family tetap konsisten.

- [ ] **Step 5: Implement `GET /transactions`**

Dukung filter `period` (`today`, `week`, `month`) untuk history personal, dan paksa server mengembalikan data hanya untuk family/member context user aktif.

- [ ] **Step 6: Implement `GET /families/:id/summary`**

Implement query `period` (`today`, `week`, `month`) dan kembalikan `totalIncome`, `totalExpense`, `netBalance`, serta `perMemberContributions` agar Family screen bisa menampilkan kontribusi per member tanpa komputasi tambahan di client. Wajib ada membership authorization check.


### Task 6: Category Defaults dan Favorites Client Rules

**Files:**
- Create: `apps/api/prisma/seed.ts`
- Create: `apps/api/src/modules/category/category.routes.ts`
- Create: `apps/web/src/features/categories/favorites.ts`
- Modify: `apps/api/src/server.ts`

- [ ] **Step 1: Seed kategori default**

Tambahkan kategori default income/expense untuk pengalaman awal.

- [ ] **Step 2: Sediakan endpoint kategori**

Expose `GET /categories` berbasis family/user context jika dibutuhkan form Add, dengan authorization check membership di sisi server.

- [ ] **Step 3: Implement derivasi favorites di client**

Buat util untuk ambil maksimal 6 kategori terbaru dari histori user (tanpa endpoint favorit khusus).


### Task 7: Fondasi UI Mobile PWA dan Navigasi 4 Tab

**Files:**
- Create: `apps/web/src/app/router.tsx`
- Create: `apps/web/src/app/providers.tsx`
- Create: `apps/web/src/layouts/mobile-shell.tsx`
- Create: `apps/web/src/styles/tokens.css`
- Create: `apps/web/src/styles/global.css`
- Modify: `apps/web/src/main.tsx`

- [ ] **Step 1: Setup router dan provider global**

Tambahkan React Router + TanStack Query provider.

- [ ] **Step 2: Buat mobile shell dengan bottom tab**

Definisikan tab tetap: `Home`, `Add`, `History`, `Family`.

- [ ] **Step 3: Terapkan style tokens**

Definisikan CSS variables untuk warna, spacing, radius, dan typography agar UI konsisten mobile-first.

- [ ] **Step 4: Aktifkan web app shell**

Pastikan viewport, safe-area, dan layout satu tangan berjalan baik di layar kecil.


### Task 8: Auth Screens dan Family Onboarding Screens

**Files:**
- Create: `apps/web/src/features/auth/pages/login-page.tsx`
- Create: `apps/web/src/features/auth/pages/register-page.tsx`
- Create: `apps/web/src/features/auth/api.ts`
- Create: `apps/web/src/features/family/pages/family-setup-page.tsx`
- Create: `apps/web/src/features/family/pages/invite-join-page.tsx`
- Create: `apps/web/src/features/family/api.ts`
- Create: `apps/web/src/features/auth/session-store.ts`

- [ ] **Step 1: Implement halaman login/register**

Hubungkan form ke endpoint auth dan simpan session token.

- [ ] **Step 2: Implement guard route berbasis session**

Route private redirect ke login saat token tidak valid/expired.

- [ ] **Step 3: Implement flow create/join family**

Tambahkan halaman membuat family dan menerima invite token.

- [ ] **Step 4: Implement restore intended destination**

Saat sesi habis, setelah login ulang user kembali ke layar yang dituju sebelumnya.


### Task 9: Home dan Add Screen (KPI Path)

**Files:**
- Create: `apps/web/src/features/home/pages/home-page.tsx`
- Create: `apps/web/src/features/home/components/balance-cards.tsx`
- Create: `apps/web/src/features/transactions/pages/add-page.tsx`
- Create: `apps/web/src/features/transactions/components/amount-input.tsx`
- Create: `apps/web/src/features/transactions/components/category-picker.tsx`
- Create: `apps/web/src/features/transactions/api.ts`

- [ ] **Step 1: Bangun Home card personal + family summary bulanan**

Render balance personal dan ringkasan family dari API summary.

- [ ] **Step 2: Bangun Add flow 3 interaksi inti**

Urutan wajib: amount autofocus -> category -> submit, default type dari last used type.

- [ ] **Step 3: Tambahkan quick actions dan favorite categories**

Quick action `+ Expense` dan `+ Income` melakukan prefill ke Add.

- [ ] **Step 4: Tambahkan feedback submit**

Tampilkan toast sukses + shortcut `Add Another`; saat gagal jaringan, pertahankan form dan tawarkan `Retry`.


### Task 10: History dan Family Screen

**Files:**
- Create: `apps/web/src/features/history/pages/history-page.tsx`
- Create: `apps/web/src/features/history/components/period-filter.tsx`
- Create: `apps/web/src/features/history/components/transaction-item.tsx`
- Create: `apps/web/src/features/family/pages/family-page.tsx`
- Create: `apps/web/src/features/family/components/member-list.tsx`
- Create: `apps/web/src/features/family/components/contribution-summary.tsx`

- [ ] **Step 1: Implement history list personal**

Ambil data dari endpoint transaksi dengan filter period ringan.

- [ ] **Step 2: Implement edit ringan transaksi**

Edit amount/category/notes hanya untuk transaksi milik user aktif.

- [ ] **Step 3: Implement Family page**

Tampilkan member list, status invite, dan kontribusi per member.

- [ ] **Step 4: Implement generate invite baru dari Family page**

Expose aksi generate token baru dengan status sukses/gagal yang jelas.


### Task 11: PWA, Observability, dan Hardening MVP

**Files:**
- Create: `apps/web/public/manifest.webmanifest`
- Create: `apps/web/public/icons/*`
- Create: `apps/web/src/lib/analytics.ts`
- Create: `apps/web/src/lib/toast.ts`
- Create: `apps/api/src/plugins/rate-limit.ts`
- Modify: `apps/web/vite.config.ts`
- Modify: `apps/api/src/server.ts`

- [ ] **Step 1: Aktifkan PWA installable shell**

Tambahkan manifest + icon + service worker untuk app shell online-only.

- [ ] **Step 2: Tambahkan analytics event KPI**

Kirim event `open_add`, `submit_success`, `submit_fail`, `time_to_submit_ms`, `type_switch_before_submit`.

- [ ] **Step 3: Terapkan rate limiting endpoint sensitif**

Prioritaskan auth dan invite endpoints.

- [ ] **Step 4: Standarisasi error response**

Pastikan field validation tampil inline di UI dan error API konsisten.


### Task 12: Integrasi Akhir, Manual QA, dan Dokumentasi Runbook

**Files:**
- Create: `README.md`
- Create: `docs/superpowers/runbooks/mvp-manual-qa-money-tracking.md`
- Modify: `apps/web/.env.example`
- Modify: `apps/api/.env.example`

- [ ] **Step 1: Dokumentasikan setup lokal end-to-end**

Cantumkan cara jalankan DB, migrasi, seed, API, dan web app.

- [ ] **Step 2: Jalankan validasi kualitas non-test**

Run: `pnpm -r lint && pnpm -r typecheck && pnpm -r build`
Expected: semua command selesai tanpa error.

- [ ] **Step 3: Eksekusi manual QA sesuai spec**

Gunakan skenario register/login, invite/join, submit transaction, update summary, filter history, dan retry network fail.

- [ ] **Step 4: Finalisasi checklist readiness**

Pastikan KPI submit < 15 detik bisa dicapai untuk input umum pada perangkat mobile.


## Catatan Implementasi

- Plan ini sengaja tidak membuat/menambah test file otomatis karena kebijakan workspace saat ini melarang pembuatan unit test baru kecuali diminta eksplisit.
- Jika setelah implementasi dibutuhkan coverage otomatis, buat addendum plan khusus testing setelah ada instruksi eksplisit.
