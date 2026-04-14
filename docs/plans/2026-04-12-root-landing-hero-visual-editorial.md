# Root Landing Hero Visual Editorial Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Merapikan `landing-moneyhub-hero__visual` agar tampil editorial, terstruktur, dan tidak lagi terasa berantakan.

**Architecture:** Perubahan dibatasi pada landing hero yang sudah ada. Struktur utama tetap memakai satu dashboard card besar dengan dua elemen pendukung, tetapi hubungan visual antar elemen diubah dari floating bebas menjadi inset composition yang lebih disiplin. JSX hanya disesuaikan seperlunya, sedangkan mayoritas perubahan dilakukan di CSS.

**Tech Stack:** React 19, TypeScript 5.9, React Router 7, CSS global existing project

---

### Task 1: Rapikan struktur markup hero visual

**Files:**
- Modify: `fe/src/features/landing/pages/landing-page.tsx:82-126`

**Step 1: Tinjau ulang struktur `landing-moneyhub-hero__visual`**

- pastikan urutan panel utama dan dua inset card mendukung layering yang jelas

**Step 2: Pertahankan markup seminimal mungkin**

- gunakan class yang sudah ada bila masih sesuai
- tambah wrapper baru hanya jika memang dibutuhkan untuk komposisi editorial yang stabil

### Task 2: Ubah komposisi visual hero menjadi editorial inset layout

**Files:**
- Modify: `fe/src/styles/global.css:5088-5254`

**Step 1: Jadikan panel utama sebagai anchor komposisi**

- perbesar dominasi `landing-dashboard-card`
- rapikan tinggi, padding, radius, dan shadow agar terasa seperti hero shot produk

**Step 2: Ubah dua kartu pendukung jadi inset editorial**

- kecilkan ukuran visual `landing-floating-stat` dan `landing-floating-chart`
- atur posisi overlap supaya terasa disengaja dan seimbang
- samakan ritme radius, border, dan shadow dengan panel utama

**Step 3: Kurangi kesan widget acak**

- hindari offset ekstrem
- jaga agar tidak ada inset card yang memotong area penting panel utama

### Task 3: Rapikan responsive behavior

**Files:**
- Modify: `fe/src/styles/global.css:5669-5750`

**Step 1: Sesuaikan desktop breakpoint**

- pastikan overlap tetap editorial pada layar besar

**Step 2: Sederhanakan mobile composition**

- turunkan inset card agar tidak membuat hero terlalu padat
- pastikan tinggi visual tetap masuk akal di layar kecil

### Task 4: Verifikasi hasil

**Files:**
- Modify: file landing terkait bila ada adjustment kecil setelah review

**Step 1: Run build frontend**

Run: `pnpm build`
Expected: sukses tanpa error

**Step 2: Review diff perubahan landing**

Run: `git diff -- fe/src/features/landing/pages/landing-page.tsx fe/src/styles/global.css docs/plans/2026-04-12-root-landing-hero-visual-editorial-design.md docs/plans/2026-04-12-root-landing-hero-visual-editorial.md`
Expected: diff menunjukkan hero visual lebih terstruktur dengan perubahan kecil namun tepat

## Catatan Eksekusi

- Jangan tambah dependency baru
- Jangan tambah test file atau mengubah test karena user tidak meminta
- Prioritaskan perubahan CSS minimal yang langsung menyelesaikan kekacauan komposisi
