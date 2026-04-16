# Bottom Nav iOS Android Touch Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Note:** Jika sub-skill tersebut tidak tersedia di workspace saat ini, jalankan task secara inline dengan tool yang ada sambil tetap mengikuti urutan langkah di plan ini.

**Goal:** Mengembalikan highlight sentuh iOS pada bottom nav sambil mempertahankan suppression highlight kotak khusus Android.

**Architecture:** Perubahan dibatasi pada `fe/src/layouts/mobile-shell.tsx` dan `fe/src/styles/global.css`. `MobileShell` akan memberi class Android-only ke item bottom nav dengan memanfaatkan util deteksi iOS yang sudah ada, lalu CSS suppression dipindahkan dari selector umum ke class Android-only agar iOS kembali memakai behavior default-nya.

**Tech Stack:** React 19, React Router 7, TypeScript 5.9, CSS, Vite 8, pnpm

---

## File Map

- Modify: `fe/src/layouts/mobile-shell.tsx`
  Tanggung jawab: merender item `NavLink` bottom nav dan menambahkan class Android-only berdasarkan platform.
- Modify: `fe/src/styles/global.css`
  Tanggung jawab: menyimpan style umum bottom nav dan suppression touch feedback khusus Android.
- Reference: `fe/src/lib/pwa-install.ts`
  Tanggung jawab: menyediakan deteksi iOS yang sudah dipakai di frontend.
- Reference: `docs/superpowers/specs/2026-04-16-bottom-nav-ios-android-touch-feedback-design.md`
  Tanggung jawab: spec acuan implementasi.

### Task 1: Tambahkan class Android-only pada item bottom nav

**Files:**
- Modify: `fe/src/layouts/mobile-shell.tsx`
- Reference: `fe/src/lib/pwa-install.ts`

- [ ] **Step 1: Ambil status iOS dari util frontend yang sudah ada**

Gunakan util frontend yang sudah ada untuk mengetahui apakah device adalah iOS, tanpa membuat logika deteksi platform baru.

- [ ] **Step 2: Tambahkan class Android-only ke `NavLink` bottom nav**

Pertahankan class berikut:

```tsx
"mobile-shell__tab-link"
"mobile-shell__tab-link--active"
"mobile-shell__tab-link--featured"
```

Tambahkan satu class tambahan hanya ketika device bukan iOS, misalnya `mobile-shell__tab-link--android`.

- [ ] **Step 3: Jaga scope hanya pada bottom nav**

Jangan ubah komponen lain. `desktop add` button tidak perlu disentuh kecuali terbukti memakai masalah yang sama.

### Task 2: Pindahkan suppression touch feedback ke class Android-only

**Files:**
- Modify: `fe/src/styles/global.css`

- [ ] **Step 1: Pertahankan styling visual umum pada `.mobile-shell__tab-link`**

Selector umum tetap hanya untuk layout dan visual bottom nav, tanpa suppression touch lintas platform.

- [ ] **Step 2: Tambahkan suppression hanya pada class Android-only**

Pindahkan properti berikut dari selector umum ke class Android-only:

```css
-webkit-tap-highlight-color: transparent;
-webkit-touch-callout: none;
touch-action: manipulation;
```

- [ ] **Step 3: Batasi override state touch ke Android-only**

Di dalam `@media (hover: none) and (pointer: coarse)`, terapkan override `:focus`, `:focus-visible`, dan `:active` hanya ke `.mobile-shell__tab-link--android`:

```css
outline: none;
box-shadow: none;
```

### Task 3: Verifikasi frontend

**Files:**
- Verify: `fe/src/layouts/mobile-shell.tsx`
- Verify: `fe/src/styles/global.css`

- [ ] **Step 1: Jalankan typecheck frontend**

Run: `pnpm typecheck`

Expected: sukses tanpa error TypeScript.

- [ ] **Step 2: Catat verifikasi manual lintas platform**

Verifikasi manual:

```text
Android: highlight kotak bottom nav tetap hilang.
iOS: highlight sentuh bottom nav muncul lagi.
Semua platform: active route state bottom nav tetap sama.
```

## Catatan Implementasi

- Jangan menambah util deteksi platform baru; gunakan yang sudah ada.
- Jangan menambah test file atau test case baru.
- Tidak perlu commit atau deploy kecuali user meminta.
