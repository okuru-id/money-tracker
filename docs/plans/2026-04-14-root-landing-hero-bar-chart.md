# Root Landing Hero Bar Chart Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Menambahkan ilustrasi `bar-chart.png` ke pojok kiri atas background hero landing dengan ukuran sedang dan responsif.

**Architecture:** Perubahan dibatasi ke `fe/src/features/landing/pages/landing-page.tsx` dan `fe/src/styles/global.css`. Hero background yang sudah ada akan menerima satu elemen gambar dekoratif baru, lalu styling absolute positioning dipakai untuk mengunci posisi kiri atas, mengatur layering terhadap stat card dan foto, serta menjaga ukuran tetap proporsional pada mobile dan desktop.

**Tech Stack:** React 19, TypeScript 5.9, Vite 8, global CSS existing project

---

### Task 1: Tambah gambar dekoratif ke hero landing

**Files:**
- Modify: `fe/src/features/landing/pages/landing-page.tsx`

**Step 1: Sisipkan elemen gambar ke background hero**

- tambahkan `<img src="/bar-chart.png" />` di dalam `landing-hero-bg-circles`
- pertahankan gambar sebagai dekoratif tanpa behavior baru

**Step 2: Pastikan struktur hero tetap minimal**

- jangan ubah stat card, foto hero, atau CTA yang sudah ada

### Task 2: Tambah styling posisi dan layering gambar

**Files:**
- Modify: `fe/src/styles/global.css`

**Step 1: Tambahkan class baru untuk gambar hero**

- buat rule untuk posisi absolute di kiri atas
- atur ukuran sedang dan `z-index` agar gambar tetap di background hero

**Step 2: Tambahkan penyesuaian mobile**

- kecilkan ukuran dan rapikan offset di breakpoint mobile agar tidak mengganggu konten utama

### Task 3: Verifikasi frontend

**Files:**
- Review: `fe/src/features/landing/pages/landing-page.tsx`
- Review: `fe/src/styles/global.css`

**Step 1: Run typecheck**

Run: `pnpm typecheck`
Expected: sukses tanpa error TypeScript

**Step 2: Run build**

Run: `pnpm build`
Expected: sukses tanpa error build Vite

**Step 3: Review diff**

Run: `git diff -- docs/plans/2026-04-14-root-landing-hero-bar-chart-design.md docs/plans/2026-04-14-root-landing-hero-bar-chart.md fe/src/features/landing/pages/landing-page.tsx fe/src/styles/global.css`
Expected: diff hanya menunjukkan penambahan gambar hero, styling terkait, dan dua dokumen plan baru

## Catatan Eksekusi

- Tidak menambah atau mengubah test file karena user tidak meminta test dan frontend belum punya test runner khusus
- Tidak membuat commit karena user belum meminta commit
