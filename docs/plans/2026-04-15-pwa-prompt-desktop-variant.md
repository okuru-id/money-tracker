# PWA Prompt Desktop Variant Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Menambahkan variant desktop sidebar untuk prompt install PWA agar tampil rapi di bagian bawah sidebar desktop.

**Architecture:** `PwaInstallPrompt` akan mendukung variant tampilan baru yang hanya dipakai pada desktop sidebar. Logic install/dismiss tetap dibagi dari komponen yang sama, tetapi variant desktop menggunakan struktur markup tersendiri agar hierarchy visualnya cocok untuk sidebar. `MobileShell` memilih variant sesuai konteks render, dan CSS hanya menargetkan variant desktop tersebut.

**Tech Stack:** React 19, TypeScript 5.9, global CSS existing project

---

### Task 1: Tambah variant desktop sidebar pada prompt

**Files:**
- Modify: `fe/src/components/pwa-install-prompt.tsx`

**Step 1: Tambah prop variant yang eksplisit**

- pertahankan variant default untuk mobile
- tambah variant desktop sidebar untuk render desktop

**Step 2: Buat markup desktop sidebar khusus**

- badge/header kecil
- title dan description vertikal
- action area di bawah
- close button ringan di sudut card

**Step 3: Pertahankan logic existing**

- jangan duplikasi logic install/dismiss
- iOS tetap didukung dengan copy yang sesuai

### Task 2: Pakai variant desktop di sidebar

**Files:**
- Modify: `fe/src/layouts/mobile-shell.tsx`

**Step 1: Pertahankan mobile prompt existing**

- render mobile tetap memakai variant default

**Step 2: Gunakan variant desktop di wrapper sidebar**

- render desktop prompt memakai variant desktop sidebar

### Task 3: Tambah styling variant desktop

**Files:**
- Modify: `fe/src/styles/global.css`

**Step 1: Scope styling ke variant desktop**

- hindari merusak mobile prompt

**Step 2: Terapkan hierarchy visual premium**

- card vertikal
- spacing lebih lega
- CTA utama jelas
- secondary action lebih ringan

### Task 4: Verifikasi implementasi

**Files:**
- Review: `fe/src/components/pwa-install-prompt.tsx`
- Review: `fe/src/layouts/mobile-shell.tsx`
- Review: `fe/src/styles/global.css`

**Step 1: Run lint**

Run: `pnpm lint`
Expected: sukses tanpa error ESLint

**Step 2: Run build**

Run: `pnpm build`
Expected: sukses tanpa error build Vite

**Step 3: Review diff**

Run: `git diff -- docs/plans/2026-04-15-pwa-prompt-desktop-variant-design.md docs/plans/2026-04-15-pwa-prompt-desktop-variant.md fe/src/components/pwa-install-prompt.tsx fe/src/layouts/mobile-shell.tsx fe/src/styles/global.css`
Expected: diff hanya menunjukkan variant desktop prompt dan dokumen plan baru

## Catatan Eksekusi

- Tidak menambah atau mengubah test file karena user tidak meminta test
- Tidak membuat commit karena user belum meminta commit untuk task ini
