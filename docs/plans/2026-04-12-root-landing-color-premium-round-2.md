# Root Landing Premium Color Round 2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Menambahkan polish ronde kedua pada section-section landing page `/` agar sistem warna premium yang sudah ada terasa lebih editorial dan lebih mahal pada level section dan card.

**Architecture:** Perubahan tetap difokuskan pada `fe/src/styles/global.css`, tanpa mengubah struktur landing page. Implementasi dilakukan dengan menambah variasi surface dan depth per section: feature cards dibuat lebih paper-like, operational panels dibuat lebih refined, section light dibedakan tipis namun jelas, dan dark closing stack dibuat lebih premium daripada dark sections sebelumnya.

**Tech Stack:** React 19, TypeScript 5.9, React Router 7, CSS global existing project

---

### Task 1: Polish section light agar lebih editorial

**Files:**
- Modify: `fe/src/styles/global.css:4807-5410`

**Step 1: Rapikan feature grid**

- Buat `landing-feature-card` terasa seperti premium paper surface
- Tambahkan perbedaan tipis antara shell light dan card di atasnya

**Step 2: Rapikan testimonial section**

- Haluskan `landing-testimonial-card`, avatar, dan nav label agar terasa paling refined di kelompok light sections

**Step 3: Rapikan efficiency user card**

- Buat `landing-efficiency-user-card` terasa lebih editorial dan less-default

### Task 2: Polish section dark agar lebih mahal

**Files:**
- Modify: `fe/src/styles/global.css:5056-5441`

**Step 1: Rapikan transfer and precision surfaces**

- `landing-transfer-card`, `landing-transfer-map`, `landing-precision-card--dark`, dan `landing-precision-card--floating` harus punya depth yang lebih jelas

**Step 2: Rapikan dark closing stack**

- `landing-stat-card` dan `landing-download-phone` dibuat terasa lebih premium dibanding dark card lainnya

**Step 3: Rapikan hero supporting cards bila perlu**

- `landing-dashboard-card` dan card pendukung lain hanya dipoles kecil jika dibutuhkan untuk menjaga harmoni tone

### Task 3: Verifikasi akhir

**Files:**
- Modify: file landing CSS terkait bila ada penyesuaian kecil setelah review visual

**Step 1: Run build**

Run: `pnpm build`
Expected: sukses tanpa error

**Step 2: Review worktree**

Run: `git status --short`
Expected: perubahan tetap terbatas pada file landing CSS dan dokumen plan/design terkait

## Catatan Eksekusi

- Jangan membuat atau memodifikasi test file karena user tidak meminta dan repo melarangnya
- Jangan ubah struktur markup landing page kecuali benar-benar perlu
- Fokus pada polish visual kecil dengan dampak besar, bukan redesign ulang
