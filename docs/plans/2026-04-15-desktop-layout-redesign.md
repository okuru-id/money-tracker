# Desktop Layout Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mendesain ulang area content desktop pada halaman app utama agar lebih memanfaatkan layar lebar sambil mempertahankan behavior mobile dan logika data yang sudah ada.

**Architecture:** Gunakan satu set aturan layout desktop global di `MobileShell`/`global.css`, lalu sesuaikan struktur JSX dan class pada halaman-halaman utama untuk membentuk variasi layout yang ringan per halaman. Fokus perubahan ada pada susunan content, grid, section grouping, dan hierarchy visual; query, mutation, dan navigasi inti tidak diubah.

**Tech Stack:** React 19, React Router 7, TypeScript 5.9, TanStack Query, global CSS existing project

---

### Task 1: Siapkan fondasi content desktop global

**Files:**
- Modify: `fe/src/layouts/mobile-shell.tsx`
- Modify: `fe/src/styles/global.css`

**Step 1: Review wrapper content desktop existing**

- pastikan area content desktop saat ini masih berada di `mobile-shell__content`
- identifikasi class global desktop yang sudah ada untuk sidebar, topbar, dan scroll region

**Step 2: Tambahkan fondasi wrapper content desktop**

- perbarui `mobile-shell__content` dan class global terkait di `fe/src/styles/global.css`
- sediakan spacing vertikal, gutter horizontal, dan helper grid desktop yang dapat dipakai ulang oleh semua halaman

**Step 3: Tambahkan class pendukung di shell bila diperlukan**

- jika perlu pembeda desktop scope yang eksplisit, tambahkan class wrapper yang kecil di `fe/src/layouts/mobile-shell.tsx`
- jangan ubah alur `Outlet` atau perilaku route

### Task 2: Redesign desktop content untuk Home dan History

**Files:**
- Modify: `fe/src/features/home/pages/home-page.tsx`
- Modify: `fe/src/features/history/pages/history-page.tsx`
- Modify: `fe/src/styles/global.css`

**Step 1: Ubah Home jadi dashboard desktop 2 kolom**

- kelompokkan hero, balance, quick actions, dan recent transactions ke dalam struktur desktop yang lebih jelas
- pertahankan data query dan tombol action existing

**Step 2: Ubah History jadi pola desktop workspace**

- tempatkan `MonthNavigator`, error/hint state, dan daftar transaksi ke dalam susunan `header + toolbar + list`
- jaga agar list transaksi tetap memakai komponen `TransactionItem` yang ada

**Step 3: Tambahkan styling desktop untuk kedua halaman**

- definisikan grid, span, card grouping, dan responsive fallback di `fe/src/styles/global.css`
- jangan mengubah mobile layout existing di luar kebutuhan yang sangat kecil

### Task 3: Redesign desktop content untuk Add dan Insights

**Files:**
- Modify: `fe/src/features/transactions/pages/add-page.tsx`
- Modify: `fe/src/features/insights/pages/insights-page.tsx`
- Modify: `fe/src/styles/global.css`

**Step 1: Ubah Add jadi layout form desktop yang lebih fokus**

- pisahkan area form utama dan area pendamping desktop dengan perubahan JSX minimal
- pertahankan semua logic submit, error state, retry state, dan query existing

**Step 2: Ubah Insights jadi grid analitik desktop**

- rapikan grouping bank accounts, insight cards, dan top categories agar memanfaatkan lebar desktop
- pertahankan komponen dan state bank account management yang ada

**Step 3: Tambahkan styling desktop khusus untuk Add dan Insights**

- buat class desktop yang menjaga kedua halaman tetap terasa satu sistem, tetapi tidak identik

### Task 4: Redesign desktop content untuk Settings dan Family Management

**Files:**
- Modify: `fe/src/features/settings/pages/settings-page.tsx`
- Modify: `fe/src/features/family/pages/family-management-page.tsx`
- Modify: `fe/src/features/family/pages/family-page.tsx`
- Modify: `fe/src/styles/global.css`

**Step 1: Ubah Settings jadi panel modular desktop**

- susun profile, family prompt, menu, install card, dan logout card menjadi grouping desktop yang lebih stabil
- pertahankan semua CTA dan state existing

**Step 2: Ubah Family Management jadi section-grid desktop**

- pertahankan hero `family-management-page`
- susun body `FamilyPageContent` agar invite center, members, dan contribution punya penempatan desktop yang lebih jelas

**Step 3: Tambahkan styling desktop untuk Settings dan Family**

- definisikan grid/panel desktop yang selaras dengan fondasi global

### Task 5: Verifikasi implementasi

**Files:**
- Review: `fe/src/layouts/mobile-shell.tsx`
- Review: `fe/src/features/home/pages/home-page.tsx`
- Review: `fe/src/features/history/pages/history-page.tsx`
- Review: `fe/src/features/transactions/pages/add-page.tsx`
- Review: `fe/src/features/insights/pages/insights-page.tsx`
- Review: `fe/src/features/settings/pages/settings-page.tsx`
- Review: `fe/src/features/family/pages/family-management-page.tsx`
- Review: `fe/src/features/family/pages/family-page.tsx`
- Review: `fe/src/styles/global.css`

**Step 1: Run typecheck**

Run: `pnpm typecheck`
Expected: sukses tanpa error TypeScript

**Step 2: Run build**

Run: `pnpm build`
Expected: sukses tanpa error Vite build

**Step 3: Review diff**

Run: `git diff -- fe/src/layouts/mobile-shell.tsx fe/src/features/home/pages/home-page.tsx fe/src/features/history/pages/history-page.tsx fe/src/features/transactions/pages/add-page.tsx fe/src/features/insights/pages/insights-page.tsx fe/src/features/settings/pages/settings-page.tsx fe/src/features/family/pages/family-management-page.tsx fe/src/features/family/pages/family-page.tsx fe/src/styles/global.css docs/plans/2026-04-15-desktop-layout-redesign-design.md docs/plans/2026-04-15-desktop-layout-redesign.md`
Expected: diff hanya menunjukkan redesign layout desktop content dan dokumentasi pendukung

## Catatan Eksekusi

- User meminta pengerjaan tanpa worktree
- Jangan menambah atau memodifikasi test file
- Jangan membuat commit kecuali user meminta
