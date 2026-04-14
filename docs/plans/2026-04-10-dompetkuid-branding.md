# dompetku.id Branding Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mengganti branding user-facing frontend dari `Money Tracker` menjadi `dompetku.id` tanpa mengubah perilaku aplikasi.

**Architecture:** Perubahan dibatasi pada surface frontend yang terlihat user: landing, auth, shell title, settings copy, HTML title, dan manifest PWA. Nama repo, struktur internal, dan implementasi API tetap tidak berubah.

**Tech Stack:** React 19, TypeScript 5.9, Vite 8, React Router 7, CSS global existing project, static frontend assets

---

### Task 1: Ganti branding di surface React

**Files:**
- Modify: `fe/src/features/landing/pages/landing-page.tsx`
- Modify: `fe/src/features/auth/pages/login-page.tsx`
- Modify: `fe/src/features/auth/pages/register-page.tsx`
- Modify: `fe/src/features/settings/pages/settings-page.tsx`
- Modify: `fe/src/layouts/mobile-shell.tsx`

**Step 1: Ganti nama brand utama**

- Ubah copy `Money Tracker` menjadi `dompetku.id`
- Pastikan label brand turunan di landing juga ikut konsisten

**Step 2: Rapikan copy produk turunan**

- Ubah label seperti `Money Tracker App` dan `Money Tracker Visa` ke nama yang selaras dengan brand baru

### Task 2: Ganti branding di surface browser/PWA

**Files:**
- Modify: `fe/index.html`
- Modify: `fe/public/manifest.webmanifest`

**Step 1: Ganti title HTML**

- Ubah title halaman agar browser tab menampilkan `dompetku.id`

**Step 2: Ganti manifest branding**

- Ubah `name`, `short_name`, dan `description` bila perlu agar PWA konsisten dengan brand baru

### Task 3: Selaraskan dokumen plan aktif

**Files:**
- Modify: `docs/plans/2026-04-10-root-landing-design.md`
- Modify: `docs/plans/2026-04-10-root-landing-moneyhub-flat.md` bila perlu

**Step 1: Selaraskan nama produk di dokumen aktif**

- Pastikan plan/design yang sedang dipakai tidak bertentangan dengan brand baru di surface frontend

### Task 4: Final verification

**Files:**
- Modify: file branding terkait bila perlu polish akhir

**Step 1: Run typecheck**

Run: `pnpm typecheck`
Expected: sukses tanpa error

**Step 2: Run lint**

Run: `pnpm lint`
Expected: sukses

**Step 3: Run build**

Run: `pnpm build`
Expected: sukses dan bundle ter-build tanpa error

## Catatan Eksekusi

- Jangan sentuh nama repo/folder internal kecuali memang muncul ke user
- Fokus pada branding yang benar-benar terlihat user
- Jangan ubah asset binary/icon kecuali user meminta versi visual baru
