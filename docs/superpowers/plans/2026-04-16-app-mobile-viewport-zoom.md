# App Mobile Viewport Zoom Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Note:** Jika sub-skill tersebut tidak tersedia di workspace saat ini, jalankan task secara inline dengan tool yang ada sambil tetap mengikuti urutan langkah di plan ini.

**Goal:** Menonaktifkan zoom hanya pada semua halaman mobile setelah login, termasuk onboarding family dan admin, sambil mempertahankan viewport normal pada landing dan halaman public.

**Architecture:** Meta viewport default tetap dipertahankan di `fe/index.html`. Karena `AppProviders` berada di atas `RouterProvider`, controller viewport harus ditempatkan di dalam tree router melalui root route wrapper baru di `fe/src/app/router.tsx`. Wrapper itu merender controller kecil yang memakai `useLocation()` dan `useSessionState()` untuk memilih viewport default atau non-zoom secara reversible saat status session dan route berubah.

**Tech Stack:** React 19, TypeScript 5.9, React Router 7, Vite 8, pnpm

---

## File Map

- Modify: `fe/src/app/router.tsx`
  Tanggung jawab: menambahkan root route wrapper yang membungkus seluruh router tree.
- Modify: `fe/src/app/router-gates.tsx`
  Tanggung jawab: menempatkan viewport controller yang punya akses ke router context dan session state.
- Reference: `fe/index.html`
  Tanggung jawab: menyediakan meta viewport default sebagai baseline dan fallback.
- Reference: `docs/superpowers/specs/2026-04-16-app-mobile-viewport-zoom-design.md`
  Tanggung jawab: spec acuan scope dan perilaku viewport.

### Task 1: Tambahkan root route wrapper untuk seluruh router tree

**Files:**
- Modify: `fe/src/app/router.tsx`

- [ ] **Step 1: Bungkus seluruh route dengan root element bersama**

Tambahkan satu route root tanpa `path` yang merender wrapper bersama, lalu pindahkan branch route yang sudah ada menjadi `children` dari root tersebut.

- [ ] **Step 2: Pastikan struktur branch route tetap sama**

Branch berikut tetap harus bekerja seperti sebelumnya:

```text
PublicOnlyGate branch
SessionGate branch
fallback * route
```

Root wrapper hanya menambahkan lokasi bersama untuk viewport controller, bukan mengubah aturan gate.

### Task 2: Tambahkan viewport controller di dalam tree router

**Files:**
- Modify: `fe/src/app/router-gates.tsx`

- [ ] **Step 1: Buat komponen kecil untuk sinkronisasi viewport**

Komponen ini harus hidup di dalam router context dan memakai:

```ts
useLocation()
useSessionState()
```

- [ ] **Step 2: Definisikan dua konstanta viewport**

Gunakan nilai eksplisit berikut:

```text
Default/public: width=device-width, initial-scale=1.0
Authenticated/non-zoom: width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no
```

- [ ] **Step 3: Tentukan sumber kebenaran non-zoom**

Rule yang dipakai harus sederhana dan eksplisit:

```text
Jika session.status === 'authenticated' => non-zoom
Selain itu => default
```

Jangan bergantung pada pathname untuk membedakan `/` karena route itu ambigu antara landing dan home app.

- [ ] **Step 4: Sinkronkan meta viewport secara aman**

Cari `meta[name="viewport"]`, lalu set `content` sesuai rule di atas. Jika meta tidak ditemukan, keluar tanpa error.

- [ ] **Step 5: Tambahkan cleanup/fallback**

Saat komponen unmount atau effect berubah, kembalikan viewport ke nilai default agar state tidak tertinggal.

### Task 3: Verifikasi frontend

**Files:**
- Verify: `fe/src/app/router.tsx`
- Verify: `fe/src/app/router-gates.tsx`

- [ ] **Step 1: Jalankan typecheck frontend**

Run: `pnpm typecheck`

Expected: sukses tanpa error TypeScript.

- [ ] **Step 2: Catat verifikasi manual mobile**

Verifikasi manual:

```text
Unauthenticated: landing, login, register tetap bisa zoom.
Authenticated: home, history, add, insights, settings, family setup/join/invite, dan admin tidak bisa zoom.
Pindah dari public ke authenticated dan sebaliknya mengubah viewport dengan benar.
```

## Catatan Implementasi

- Jangan mengubah meta viewport default di `index.html` menjadi non-zoom global.
- Jangan menaruh controller viewport di `AppProviders` karena berada di atas `RouterProvider`.
- Jangan menambah dependency baru.
- Tidak perlu commit atau deploy kecuali user meminta.
