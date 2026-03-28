# PWA Install Prompt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan notif install PWA berbentuk bottom prompt ringan yang muncul otomatis saat app installable, dengan aksi `Install` dan `Nanti`.

**Architecture:** Prompt install dipisahkan dari sistem toast transaksi agar tidak saling menimpa. State installability dikelola oleh modul kecil khusus PWA yang menyimpan deferred browser prompt, dismissal per sesi, dan cleanup saat install sukses. Komponen prompt dirender di shell global agar tampil konsisten di seluruh area utama aplikasi.

**Tech Stack:** React 19, TypeScript, Vite PWA plugin, CSS custom, browser `beforeinstallprompt`/`appinstalled` events.

---

## File Structure Map

- `apps/web/src/lib/pwa-install.ts` (new)
  - Store kecil untuk status prompt install, deferred event browser, dismissal per sesi, dan helper prompt install.
- `apps/web/src/components/pwa-install-prompt.tsx` (new)
  - UI prompt install persistent ringan di atas bottom nav.
- `apps/web/src/app/providers.tsx`
  - Titik integrasi global agar prompt bisa tampil lintas halaman.
- `apps/web/src/styles/global.css`
  - Style prompt install, tombol action, dan safe-area positioning di atas bottom nav.


### Task 1: Buat Store PWA Install Prompt

**Files:**
- Create: `apps/web/src/lib/pwa-install.ts`

- [ ] **Step 1: Definisikan type untuk deferred install prompt event**

Tambahkan type aman untuk event `beforeinstallprompt` yang memuat `prompt()` dan `userChoice`.

- [ ] **Step 2: Simpan state install availability dan dismissal session**

Implement store module-level dengan state minimal: `isAvailable`, `isInstalled`, `isDismissedForSession`, dan deferred prompt reference.

- [ ] **Step 3: Tambah listener browser install events**

Tangani `beforeinstallprompt` untuk menyimpan deferred prompt dan `appinstalled` untuk reset state; saat inisialisasi juga cek `display-mode: standalone` agar prompt tidak tampil pada context yang sudah ter-install.

- [ ] **Step 4: Tambah helper action store**

Expose helper seperti `initializePwaInstallPrompt()`, `dismissPwaInstallPrompt()`, `promptPwaInstall()`, dan hook/subscription reader.


### Task 2: Bangun Komponen UI Prompt Install

**Files:**
- Create: `apps/web/src/components/pwa-install-prompt.tsx`
- Modify: `apps/web/src/styles/global.css`

- [ ] **Step 1: Render prompt hanya saat install tersedia**

Komponen membaca state dari store PWA dan hanya muncul bila `isAvailable` true serta belum dismissed.

- [ ] **Step 2: Tambahkan copy dan CTA sesuai spec**

Tampilkan judul singkat, deskripsi manfaat install, tombol `Install`, dan tombol `Nanti`.

- [ ] **Step 3: Tangani action `Install` dan `Nanti`**

`Install` memanggil helper prompt native browser; `Nanti` menyembunyikan prompt untuk sesi aktif.

- [ ] **Step 4: Tambahkan state loading/disabled bila diperlukan**

Pastikan CTA tidak spam-click dan fallback aman jika prompt gagal.


### Task 3: Integrasi Prompt ke Shell Global

**Files:**
- Modify: `apps/web/src/app/providers.tsx`

- [ ] **Step 1: Inisialisasi store install prompt di entry global**

Pasang bootstrap listener event browser sekali saat app mount, dan sediakan cleanup listener saat provider/global entry unmount.

- [ ] **Step 2: Render `PwaInstallPrompt` di area global**

Tempatkan prompt di luar konten halaman utama agar tidak bergantung pada page tertentu.

- [ ] **Step 3: Pastikan tidak bentrok dengan toast transaksi**

Susun urutan render dan class positioning supaya prompt install dan toast tetap hidup berdampingan.


### Task 4: Styling Positioning dan Safe Area Mobile

**Files:**
- Modify: `apps/web/src/styles/global.css`

- [ ] **Step 1: Tambah class layout untuk install prompt**

Gunakan posisi fixed di atas bottom nav, dengan lebar mobile-friendly dan shadow ringan.

- [ ] **Step 2: Hormati safe area dan tab bar height**

Pastikan prompt tidak menutupi bottom nav pada perangkat dengan inset bawah.

- [ ] **Step 3: Rapikan visual hierarchy tombol utama dan sekunder**

`Install` tampil dominan, `Nanti` tetap jelas tapi sekunder.


### Task 5: Verifikasi Event Flow dan Edge Case

**Files:**
- Modify: `apps/web/src/lib/pwa-install.ts`
- Modify: `apps/web/src/components/pwa-install-prompt.tsx`

- [ ] **Step 1: Pastikan dismissal bertahan pada reload tab yang sama**

Gunakan `sessionStorage` agar prompt tetap tersembunyi saat reload di sesi aktif.

- [ ] **Step 2: Pastikan prompt hilang setelah install sukses**

Event `appinstalled` harus membersihkan state dan menyembunyikan banner otomatis.

- [ ] **Step 3: Tangani browser yang tidak mendukung install prompt**

Jika event tidak tersedia, komponen harus fail silently tanpa error UI.

- [ ] **Step 4: Tangani rejection dari native prompt**

Jika user menolak prompt native browser, sembunyikan banner untuk sesi aktif agar tidak terasa spam.


### Task 6: Validasi Build dan Manual QA Ringan

**Files:**
- Modify: `docs/superpowers/runbooks/mvp-manual-qa-money-tracking.md`

- [ ] **Step 1: Jalankan quality checks frontend**

Run: `corepack pnpm --filter @money-tracker/web lint && corepack pnpm --filter @money-tracker/web typecheck && corepack pnpm --filter @money-tracker/web build`
Expected: semua command selesai tanpa error.

- [ ] **Step 2: Tambahkan catatan QA untuk install prompt**

Update runbook dengan langkah verifikasi prompt install PWA di browser yang mendukung.

- [ ] **Step 3: Verifikasi manual behavior utama**

Checklist minimum:
- Prompt muncul saat app installable.
- Klik `Nanti` menyembunyikan prompt untuk sesi/tab aktif.
- Klik `Install` memicu native browser install prompt.
- Setelah install sukses, prompt hilang.
- Prompt tidak menutupi bottom nav dan tidak bentrok dengan toast transaksi.


## Notes and Constraints

- Sesuai kebijakan workspace, plan ini tidak menambah test file otomatis.
- Scope tetap frontend-only dan tidak membutuhkan perubahan backend.
