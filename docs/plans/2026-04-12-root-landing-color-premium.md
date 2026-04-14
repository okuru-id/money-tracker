# Root Landing Premium Color Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Merapikan warna seluruh section landing page `/` agar terasa lebih premium dengan hirarki navy dan soft mint yang konsisten, tanpa mengubah struktur halaman atau perilaku routing.

**Architecture:** Perubahan difokuskan pada CSS landing yang sudah ada di `fe/src/styles/global.css`. Struktur markup `LandingPage` dipertahankan, lalu setiap shell, card, dan accent surface dipetakan ulang ke sistem tone yang lebih konsisten: base navy, secondary navy, accent dark surface, main light surface, alternate light surface, dan premium white card.

**Tech Stack:** React 19, TypeScript 5.9, React Router 7, CSS global existing project

---

### Task 1: Tetapkan hirarki warna landing di CSS

**Files:**
- Modify: `fe/src/styles/global.css:4765-5465`

**Step 1: Rapikan warna shell utama**

- `landing-shell--hero`, `landing-shell--cta`, `landing-shell--stats`, dan `landing-shell--footer` memakai base navy yang sama
- `landing-shell--dark` digeser ke secondary navy agar berbeda dari hero tetapi tetap satu keluarga tone
- `landing-shell--light` dan `landing-shell--split` digeser dari putih polos ke soft mint / soft slate yang tipis

**Step 2: Rapikan warna border dan teks pendukung**

- Border light dibuat lebih lembut dan premium
- Teks deskriptif pada light section dan dark section disesuaikan agar tetap terbaca pada surface baru

### Task 2: Rapikan warna card dan panel internal

**Files:**
- Modify: `fe/src/styles/global.css:5031-5409`

**Step 1: Samakan hirarki dark card**

- `landing-dashboard-card`, `landing-transfer-card`, `landing-download-phone`, `landing-stat-card`, `landing-precision-card--dark`, dan `landing-precision-card--floating` diatur ulang agar tiap card punya peran tonal yang jelas
- Hindari banyak navy berbeda yang terasa tidak disengaja

**Step 2: Samakan hirarki light card**

- `landing-feature-card`, `landing-testimonial-card`, `landing-efficiency-user-card`, dan `landing-precision-card--light` digeser ke premium white atau alternate light surface sesuai level penekanan

**Step 3: Rapikan elemen kecil**

- badge, floating stat, nav label, avatar surface, dan progress surface ikut disesuaikan agar tidak terasa berasal dari palette lain

### Task 3: Jaga accent tetap kuat tapi lebih halus

**Files:**
- Modify: `fe/src/styles/global.css:4829-5437`

**Step 1: Pertahankan CTA utama sebagai focal point**

- Tombol utama tetap paling menonjol
- Shadow dan fill hijau tetap hidup tetapi tidak terlalu neon dibanding palette baru

**Step 2: Rapikan accent pendukung**

- outline, badge hijau, graph line, map dot, dan indicator lain dibuat tetap jelas namun lebih tenang

### Task 4: Verifikasi akhir

**Files:**
- Modify: file landing terkait bila ada polish kecil setelah review

**Step 1: Run build**

Run: `pnpm build`
Expected: sukses tanpa error

**Step 2: Review worktree**

Run: `git status --short`
Expected: hanya file landing CSS dan dokumen plan/design yang berubah

## Catatan Eksekusi

- Jangan membuat atau memodifikasi test file karena user tidak meminta dan repo melarangnya
- Prioritaskan perubahan paling kecil yang cukup untuk membangun sistem warna yang lebih konsisten
- Target utama adalah premium tonal polish, bukan redesign struktur landing page
