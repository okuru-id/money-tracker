# Desktop Add FAB Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Memindahkan akses `Add` di desktop dari sidebar kiri ke tombol mengambang kanan bawah tanpa mengubah navigasi mobile.

**Architecture:** `MobileShell` tetap menjadi satu sumber render navigasi untuk mobile dan desktop. FAB desktop akan dirender sebagai link terpisah di shell yang sama, sementara CSS desktop menyembunyikan tab featured `Add` di sidebar dan memberi ruang aman pada area konten agar FAB tidak menutupi konten terakhir.

**Tech Stack:** React 19, React Router 7, TypeScript 5.9, global CSS existing project

---

### Task 1: Tambahkan FAB desktop pada shell

**Files:**
- Modify: `fe/src/layouts/mobile-shell.tsx`

**Step 1: Pertahankan tab existing untuk mobile**

- biarkan definisi tab `Add` tetap ada di `allTabs`

**Step 2: Render FAB desktop terpisah**

- tambahkan `NavLink` baru setelah `nav`
- render hanya ketika `session.hasFamily` agar konsisten dengan akses `Add` existing
- gunakan class aktif saat route `/add` terbuka

### Task 2: Sesuaikan styling desktop

**Files:**
- Modify: `fe/src/styles/global.css`

**Step 1: Siapkan style dasar FAB desktop**

- default hidden pada mobile
- definisikan struktur icon, label, shadow, dan interaction state

**Step 2: Sembunyikan item `Add` di sidebar desktop**

- targetkan `.mobile-shell__tab-link--featured` hanya di media query desktop

**Step 3: Tambah ruang aman konten desktop**

- tambahkan bottom padding pada `.mobile-shell__content` di desktop agar FAB tidak menutupi konten terakhir

### Task 3: Verifikasi implementasi

**Files:**
- Review: `fe/src/layouts/mobile-shell.tsx`
- Review: `fe/src/styles/global.css`
- Review: `docs/plans/2026-04-15-desktop-add-fab-design.md`
- Review: `docs/plans/2026-04-15-desktop-add-fab.md`

**Step 1: Run typecheck**

Run: `pnpm typecheck`
Expected: sukses tanpa error TypeScript

**Step 2: Review diff**

Run: `git diff -- docs/plans/2026-04-15-desktop-add-fab-design.md docs/plans/2026-04-15-desktop-add-fab.md fe/src/layouts/mobile-shell.tsx fe/src/styles/global.css`
Expected: diff hanya menunjukkan FAB desktop baru, penyembunyian item `Add` desktop, dan padding konten pendukung

## Catatan Eksekusi

- Tidak menambah atau mengubah test file karena user tidak meminta test
- Tidak membuat commit karena user belum meminta commit
