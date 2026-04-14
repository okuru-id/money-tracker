# Frontend Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Merombak seluruh tampilan utama frontend Money Tracker agar mengikuti nuansa visual referensi yang lembut, mobile-first, premium, dan flat tanpa gradient, tanpa mengubah alur bisnis aplikasi.

**Architecture:** Pendekatan implementasi berfokus pada redesign UI layer yang sudah ada. Styling inti dipusatkan di `fe/src/styles/global.css`, lalu setiap halaman utama disesuaikan markup dan hierarchy-nya agar memakai pola visual yang konsisten: hero card, metric card, floating nav, dan panel card. Revisi akhir memprioritaskan penghapusan gradient pada area redesign dan menggantinya dengan solid fills, border, dan shadow. Struktur routing, query, dan API tetap dipertahankan.

**Tech Stack:** React 19, TypeScript 5.9, React Router 7, TanStack Query 5, CSS global existing project

---

### Task 1: Refresh design tokens and shared shell styling

**Files:**
- Modify: `fe/src/styles/global.css`
- Modify: `fe/src/layouts/mobile-shell.tsx`
- Modify: `fe/src/components/top-bar.tsx`

**Step 1: Update global visual foundation**

- Ganti background app menjadi abu kebiruan lembut dengan surface off-white
- Sesuaikan token visual yang dipakai `mobile-shell`, `topbar`, dan generic cards agar konsisten dengan teal + warm orange
- Tambahkan utility styling seperlunya untuk panel gelap, CTA orange, floating nav, dan shadow baru

**Step 2: Rebuild `MobileShell` visual hierarchy**

- Pertahankan struktur tab yang ada di `fe/src/layouts/mobile-shell.tsx`
- Ubah markup sekecil mungkin untuk mendukung nav yang lebih mirip referensi: floating white dock, active tab yang kalem, dan tombol tengah `Add` yang dominan
- Pastikan tab masih accessible dan tetap sesuai route existing

**Step 3: Refine top bar**

- Sesuaikan `fe/src/components/top-bar.tsx` agar tampil lebih ringan dan selaras dengan shell baru
- Pertahankan aksi logout dan badge admin tanpa mengubah logika
- Pastikan title, email, dan action button tetap muat di layar mobile

**Step 4: Verify shell styling**

Run: `pnpm typecheck`
Expected: sukses tanpa error TypeScript

### Task 2: Redesign auth and family onboarding screens

**Files:**
- Modify: `fe/src/features/auth/pages/login-page.tsx`
- Modify: `fe/src/features/auth/pages/register-page.tsx`
- Modify: `fe/src/features/family/pages/family-setup-page.tsx`
- Modify: `fe/src/features/family/pages/invite-join-page.tsx`
- Modify: `fe/src/styles/global.css`

**Step 1: Build shared onboarding visual pattern**

- Gunakan class yang ada bila masih masuk akal, dan tambah class baru seperlunya di `fe/src/styles/global.css`
- Bentuk pola yang konsisten untuk hero copy, supporting card, form shell, notice, error, dan secondary actions

**Step 2: Update auth page markup**

- Di `login-page.tsx` dan `register-page.tsx`, rapikan hierarchy menjadi lebih visual tanpa mengubah field, validation, atau redirect logic
- Tambahkan blok hero/intro pendek yang masih relevan untuk money tracker
- Jaga perubahan minimal pada state handling yang sudah ada

**Step 3: Update family onboarding pages**

- Di `family-setup-page.tsx` dan `invite-join-page.tsx`, samakan bahasa visual dengan auth screen
- Pertahankan `TopBar`, submit flow, skip flow, dan join/create family behavior yang sudah ada

**Step 4: Verify onboarding pages**

Run: `pnpm typecheck`
Expected: sukses tanpa error TypeScript

### Task 3: Redesign `Home` as the main hero screen

**Files:**
- Modify: `fe/src/features/home/pages/home-page.tsx`
- Modify: `fe/src/styles/global.css`

**Step 1: Reframe home content into visual sections**

- Pertahankan data sources existing (`personal-summary`, `recent`)
- Susun ulang markup agar ada greeting/hero summary, quick actions, metric cards, dan recent transaction section yang lebih hidup
- Jangan tambah fetch baru bila tidak diperlukan

**Step 2: Improve quick actions and summary blocks**

- Gunakan action buttons yang lebih menyerupai control utama app
- Visualkan income dan expense sebagai card turunan dari hero section
- Pastikan nominal tetap menjadi elemen paling mudah dipindai

**Step 3: Polish recent transactions block**

- Ubah list item agar tampil sebagai soft cards dengan hierarchy kategori, tanggal, dan amount yang lebih jelas
- Tetap pertahankan tombol `View all` ke `/history`

**Step 4: Verify home page**

Run: `pnpm typecheck`
Expected: sukses tanpa error TypeScript

### Task 4: Redesign `Add` page to align with center CTA

**Files:**
- Modify: `fe/src/features/transactions/pages/add-page.tsx`
- Modify: `fe/src/styles/global.css`

**Step 1: Wrap transaction form in stronger visual shell**

- Tambahkan header atau intro card yang menjelaskan konteks input transaksi
- Pertahankan seluruh logika state, analytics, retry mode, dan submit flow existing

**Step 2: Rework field grouping**

- Rapikan toggle type, amount input, category picker, dropdown account, note input, dan error/retry state menjadi section yang lebih mudah dipindai
- Pastikan submit button tetap menonjol dan nyaman dijangkau di mobile

**Step 3: Verify add page behavior**

Run: `pnpm typecheck`
Expected: sukses tanpa error TypeScript

### Task 5: Redesign `History` page without losing efficiency

**Files:**
- Modify: `fe/src/features/history/pages/history-page.tsx`
- Modify: `fe/src/features/history/components/transaction-item.tsx`
- Modify: `fe/src/features/history/components/period-filter.tsx`
- Modify: `fe/src/styles/global.css`

**Step 1: Refresh month navigator section**

- Pertahankan behavior existing untuk pindah bulan
- Ubah visual navigator agar terasa seperti control card, bukan toolbar datar

**Step 2: Update history page structure**

- Tambahkan header/summary tipis jika diperlukan
- Pertahankan loading, empty, dan error states yang sudah ada

**Step 3: Redesign transaction item card**

- Di `transaction-item.tsx`, ubah hierarchy visual untuk kategori, tanggal, notes, account, amount, dan action button
- Pastikan mode edit dan delete confirm masih terbaca jelas di layout baru
- Hindari perubahan ke rule `canEdit`/`canDelete`

**Step 4: Verify history flow**

Run: `pnpm typecheck`
Expected: sukses tanpa error TypeScript

### Task 6: Redesign `Insights` page with softer premium cards

**Files:**
- Modify: `fe/src/features/insights/pages/insights-page.tsx`
- Modify: `fe/src/styles/global.css`

**Step 1: Rework insights page layout**

- Pertahankan semua query dan mutation existing
- Susun ulang section bank accounts, metrics, dan top categories agar lebih terstruktur dan lapang

**Step 2: Refine bank account cards and forms**

- Bank account cards dibuat lebih elegan dengan emphasis pada balance dan identity account
- Form add/edit tetap dipakai, tetapi shell visualnya disamakan dengan bahasa desain baru
- Jangan ubah behavior create/update/delete

**Step 3: Refine metrics and category cards**

- Buat metrics lebih konsisten dengan home cards
- Jaga agar data tetap cepat dibaca, terutama amount dan transaction count

**Step 4: Verify insights page**

Run: `pnpm typecheck`
Expected: sukses tanpa error TypeScript

### Task 7: Redesign `Settings` and family-linked sections

**Files:**
- Modify: `fe/src/features/settings/pages/settings-page.tsx`
- Modify: `fe/src/features/family/pages/family-management-page.tsx`
- Modify: `fe/src/features/family/components/member-list.tsx`
- Modify: `fe/src/features/family/components/contribution-summary.tsx`
- Modify: `fe/src/styles/global.css`

**Step 1: Refresh settings page composition**

- Pertahankan family prompt, settings menu, install card, dan logout card
- Ubah hierarchy dan styling agar konsisten dengan surface baru dan lebih terasa premium

**Step 2: Refresh family management views**

- Sesuaikan visual page dan list components family agar selaras dengan settings ecosystem
- Pertahankan semua action dan informasi existing

**Step 3: Verify settings and family views**

Run: `pnpm typecheck`
Expected: sukses tanpa error TypeScript

### Task 8: Flat premium pass and verification

**Files:**
- Modify: `fe/src/styles/global.css`
- Modify: file frontend lain yang sudah disentuh pada task sebelumnya, bila perlu untuk final polish

**Step 1: Do consistency sweep**

- Samakan radius, spacing, button treatment, shadows, title sizing, dan empty/error states
- Pastikan tidak ada gaya lama yang bentrok keras dengan bahasa visual baru
- Hapus gradient dari area redesign utama dan ganti dengan warna solid yang setara secara hierarchy
- Pastikan panel teal, CTA orange, dan surface putih tetap punya emphasis tanpa bantuan gradient
- Revisi akhir: bersihkan deklarasi gradient secara literal dari `fe/src/styles/global.css`, bukan hanya dengan override penimpa

**Step 2: Run full frontend verification**

Run: `pnpm typecheck`
Expected: sukses

Run: `pnpm lint`
Expected: sukses

Run: `pnpm build`
Expected: sukses dan Vite build selesai tanpa error

**Step 3: Review worktree**

Run: `git status --short`
Expected: hanya file redesign yang berubah

## Catatan Eksekusi

- Jangan menambah dependency baru
- Jangan membuat atau memodifikasi test file karena user belum meminta dan repo melarang itu
- Utamakan perubahan kecil namun lengkap per halaman
- Jika styling global terlalu besar, tetap pisahkan perubahan berdasarkan area agar mudah ditinjau
- Gunakan `pnpm typecheck` berkala setelah menyelesaikan tiap area besar untuk mencegah error menumpuk
