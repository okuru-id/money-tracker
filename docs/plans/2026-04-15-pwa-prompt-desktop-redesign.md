# PWA Prompt Desktop Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mendesain ulang prompt install PWA di desktop sidebar agar terlihat rapi dan cocok dengan proporsi sidebar.

**Architecture:** Implementasi akan mempertahankan komponen `PwaInstallPrompt` yang ada, lalu menambahkan styling desktop-scoped khusus di dalam wrapper `.mobile-shell__pwa-prompt-desktop`. Dengan begitu, mobile tetap mempertahankan pola floating prompt existing, sementara desktop mendapatkan visual baru yang lebih vertikal dan premium.

**Tech Stack:** React 19, TypeScript 5.9, global CSS existing project

---

### Task 1: Redesign visual prompt desktop di sidebar

**Files:**
- Modify: `fe/src/styles/global.css`
- Review: `fe/src/components/pwa-install-prompt.tsx`
- Review: `fe/src/layouts/mobile-shell.tsx`

**Step 1: Ubah card desktop menjadi layout vertikal**

- scope perubahan ke `.mobile-shell__pwa-prompt-desktop .pwa-install-prompt`
- pastikan spacing dan hierarchy visual sesuai lebar sidebar

**Step 2: Rapikan icon, copy, dan close button**

- icon menjadi accent badge kecil
- copy ditata stack
- close button dibuat ringan dan tidak mengganggu layout

**Step 3: Rapikan action buttons**

- tombol action tidak lagi terasa padat secara horizontal
- gunakan susunan yang lebih pas untuk lebar sidebar

### Task 2: Pastikan scope hanya desktop sidebar

**Files:**
- Modify: `fe/src/styles/global.css`

**Step 1: Pastikan mobile tidak ikut berubah**

- semua redesign di-scope ke wrapper desktop

**Step 2: Pastikan auth/top prompt tidak ikut berubah**

- jangan ubah selector umum yang memengaruhi prompt auth

### Task 3: Verifikasi implementasi

**Files:**
- Review: `fe/src/styles/global.css`

**Step 1: Run lint**

Run: `pnpm lint`
Expected: sukses tanpa error ESLint

**Step 2: Run build**

Run: `pnpm build`
Expected: sukses tanpa error build Vite

**Step 3: Review diff**

Run: `git diff -- docs/plans/2026-04-15-pwa-prompt-desktop-redesign-design.md docs/plans/2026-04-15-pwa-prompt-desktop-redesign.md fe/src/styles/global.css`
Expected: diff hanya menunjukkan redesign prompt desktop dan dokumen plan baru

## Catatan Eksekusi

- Tidak menambah atau mengubah test file karena user tidak meminta test
- Tidak membuat commit karena user belum meminta commit untuk task ini
