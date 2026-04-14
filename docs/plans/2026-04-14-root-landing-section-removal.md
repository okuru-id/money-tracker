# Root Landing Section Removal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Menghapus empat section landing page yang tidak diperlukan dan merapikan urutan section tersisa agar halaman lebih ringkas.

**Architecture:** Perubahan dibatasi ke `fe/src/features/landing/pages/landing-page.tsx` dan `fe/src/styles/global.css`. JSX untuk empat section target dihapus, data statis yang menjadi sumber render ikut dibersihkan, lalu selector CSS yang tidak lagi dipakai dihapus agar stylesheet tidak menyimpan dead code.

**Tech Stack:** React 19, TypeScript 5.9, Vite 8, global CSS existing project

---

### Task 1: Hapus section landing yang tidak dipakai

**Files:**
- Modify: `fe/src/features/landing/pages/landing-page.tsx`

**Step 1: Hapus data statis yang hanya dipakai section target**

- hapus konstanta `problems`, `solutions`, `useCases`, `aiPoints`, dan `dashboardFeatures`

**Step 2: Hapus block JSX empat section target**

- hapus section `Masalah & Solusi`
- hapus section `Untuk Siapa?`
- hapus section `Keunggulan AI`
- hapus section `Tampilan Dashboard`

**Step 3: Verifikasi urutan section akhir**

- pastikan alur menjadi `Hero -> Fitur Unggulan -> Cara Kerja -> Pricing -> FAQ -> CTA -> Footer`

### Task 2: Bersihkan style landing yang sudah mati

**Files:**
- Modify: `fe/src/styles/global.css`

**Step 1: Hapus blok CSS section yang sudah dihapus**

- hapus selector `.landing-ps*`, `.landing-uc*`, `.landing-ai*`, dan `.landing-dash*`

**Step 2: Hapus rule responsive yang sudah tidak dipakai**

- hapus override grid desktop untuk empat section target

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

Run: `git diff -- docs/plans/2026-04-14-root-landing-section-removal-design.md docs/plans/2026-04-14-root-landing-section-removal.md fe/src/features/landing/pages/landing-page.tsx fe/src/styles/global.css`
Expected: diff hanya menunjukkan penghapusan empat section target, cleanup data/style terkait, dan dua dokumen plan baru

## Catatan Eksekusi

- Tidak menambah atau mengubah test file karena user tidak meminta test dan frontend belum punya test runner khusus
- Tidak membuat commit karena user belum meminta commit
