# Settings Navigation + Family Relocation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengganti tab `Family` di bottom nav menjadi `Settings`, memindahkan fitur family ke submenu `Settings > Family Management`, dan menambahkan aksi logout di UI.

**Architecture:** Navigasi utama tetap di `MobileShell` dengan 5 tab dan `Add` di tengah sebagai tombol featured. Route `family` dipindah ke `settings/family` dengan fallback redirect dari path legacy `/family` agar deep-link lama tetap aman. Fitur family existing direuse lewat route baru sehingga perubahan fokus ke information architecture tanpa mengubah kontrak backend.

**Tech Stack:** React 19, TypeScript, React Router 7, TanStack Query 5, CSS custom tokens, Tabler Icons.

---

## File Structure Map

- `src/layouts/mobile-shell.tsx`
  - Sumber kebenaran konfigurasi bottom nav (urutan, label, icon, featured tab).
- `src/app/router.tsx`
  - Definisi route private/public, route baru settings, dan redirect route legacy `/family`.
- `src/features/settings/pages/settings-page.tsx` (new)
  - Hub halaman Settings berisi menu `Family Management`, placeholder `Account`, placeholder `App Preferences`, dan tombol `Logout`.
- `src/features/family/pages/family-management-page.tsx` (new)
  - Wrapper route untuk memuat ulang konten Family existing di bawah jalur `/settings/family`.
- `src/features/family/pages/family-page.tsx`
  - Diekstrak agar konten family bisa direuse oleh `family-management-page.tsx` tanpa duplikasi logika.
- `src/styles/global.css`
  - Styling menu Settings, badge `Soon`, dan konsistensi visual bottom nav 5 tab.
- `src/features/auth/api.ts`
  - Memakai fungsi `logout()` existing untuk aksi keluar dari Settings.


### Task 1: Ubah Bottom Nav ke Home · History · Add · Insights · Settings

**Files:**
- Modify: `src/layouts/mobile-shell.tsx`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Ganti item tab `Family` menjadi `Settings`**

Update konfigurasi tabs di `mobile-shell.tsx` sehingga route terakhir menuju `/settings` dengan icon setting yang relevan dari Tabler.

- [ ] **Step 2: Pastikan `Add` tetap di posisi tengah dan featured**

Pertahankan urutan tab 5 item dengan `Add` pada indeks tengah dan kelas featured tetap aktif.

- [ ] **Step 3: Sesuaikan visual nav untuk 5 item konsisten**

Rapikan style label/icon agar tidak overflow di layar kecil setelah penggantian tab.


### Task 2: Tambah Routing Settings dan Legacy Redirect

**Files:**
- Modify: `src/app/router.tsx`

- [ ] **Step 1: Tambah route `/settings` untuk Settings hub**

Daftarkan halaman settings di tree route private yang sama dengan tab utama.

- [ ] **Step 2: Tambah route `/settings/family` untuk Family Management**

Daftarkan halaman family management di bawah area private agar tetap dijaga guard existing.

- [ ] **Step 3: Tambah redirect legacy `/family` -> `/settings/family`**

Pastikan akses deep-link lama tidak rusak dengan redirect eksplisit.

- [ ] **Step 4: Verifikasi auth/family guard tetap berlaku**

Pastikan route baru tetap mengikuti `SessionGate` dan guard private existing.


### Task 3: Implement Settings Hub Page

**Files:**
- Create: `src/features/settings/pages/settings-page.tsx`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Buat struktur halaman settings**

Render heading, deskripsi singkat, dan daftar menu actions dalam card layout mobile-first.

- [ ] **Step 2: Tambah item `Family Management` yang menavigasi ke `/settings/family`**

Gunakan link/button jelas dengan subtext bahwa ini pengganti akses Family lama.

- [ ] **Step 3: Tambah placeholder non-interaktif `Account` dan `App Preferences`**

Tampilkan badge "Soon" tanpa navigasi sesuai keputusan spec.

- [ ] **Step 4: Tambah tombol `Logout` dan hubungkan ke API logout**

Panggil `logout()` dari `features/auth/api.ts`, tampilkan loading state, lalu redirect ke `/login` saat sukses.


### Task 4: Relokasi Family ke `/settings/family` dengan Reuse Komponen

**Files:**
- Create: `src/features/family/pages/family-management-page.tsx`
- Modify: `src/features/family/pages/family-page.tsx`

- [ ] **Step 1: Ekstrak konten family agar reusable**

Pisahkan wrapper route dari konten agar satu konten bisa dipakai di jalur baru tanpa duplikasi logic API.

- [ ] **Step 2: Buat `family-management-page.tsx` sebagai route wrapper baru**

Render konten family existing plus back affordance ke `/settings` (gunakan tombol back di header halaman wrapper agar konsisten dengan pola action internal).

- [ ] **Step 3: Pastikan fitur family tetap utuh**

Verifikasi member list, contribution summary, invite status, dan generate invite masih memakai alur existing.

- [ ] **Step 4: Tampilkan empty-state aman jika konteks family tidak valid**

Saat family context tidak tersedia, tampilkan CTA ke setup/join sesuai pola error handling existing.


### Task 5: Styling dan UX Polishing untuk Settings + Family Management

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Tambah class style untuk settings list dan action rows**

Buat style card/action dengan tap target besar dan hierarchy teks yang jelas.

- [ ] **Step 2: Tambah style badge `Soon` untuk placeholder non-interaktif**

Gunakan visual muted namun tetap terbaca sebagai rencana fitur.

- [ ] **Step 3: Rapikan state loading/error untuk tombol logout**

Pastikan disabled state dan feedback visual konsisten dengan komponen form existing.


### Task 6: Validasi Integrasi, Build, dan Manual QA Ringan

**Files:**
- Modify: `docs/superpowers/runbooks/mvp-manual-qa-money-tracking.md`

- [ ] **Step 1: Jalankan typecheck frontend**

Run: `corepack pnpm typecheck`
Expected: command selesai tanpa TypeScript error.

- [ ] **Step 2: Jalankan build frontend**

Run: `corepack pnpm build`
Expected: artifact produksi terbentuk sukses.

- [ ] **Step 3: Verifikasi route dan nav secara manual**

Checklist manual minimum:
- Bottom nav menampilkan `Home · History · Add · Insights · Settings`.
- Tab `Add` tetap berada di tengah.
- Akses `/family` otomatis redirect ke `/settings/family`.
- `Settings > Family Management` menampilkan fitur family existing.
- `Logout` di settings berhasil redirect ke login.
- User unauthenticated tidak bisa mengakses `/settings` dan `/settings/family`.

- [ ] **Step 4: Update runbook QA untuk arsitektur nav baru**

Tambahkan catatan bahwa flow family sekarang diakses dari Settings.


## Notes and Constraints

- Sesuai kebijakan workspace, plan ini **tidak** memasukkan pembuatan/modifikasi test file karena user belum meminta eksplisit.
- Perubahan ini frontend-only; backend contract tetap sama.
