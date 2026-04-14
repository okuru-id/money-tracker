# Landing Alternating Section Colors Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mengubah warna section landing di antara hero dan footer menjadi pola selang-seling putih dan krem lembut.

**Architecture:** Perubahan dibatasi ke stylesheet landing yang sudah ada agar tidak mengganggu struktur JSX. CSS akan mengatur background section landing tengah berdasarkan selector yang spesifik, sementara hero dan footer dibiarkan memakai styling existing.

**Tech Stack:** React 19 frontend existing project, global CSS existing project

---

### Task 1: Atur ritme warna section landing

**Files:**
- Modify: `fe/src/styles/global.css`
- Review: `fe/src/features/landing/pages/landing-page.tsx`

**Step 1: Identifikasi selector section tengah**

- pastikan target hanya section setelah hero dan sebelum footer
- pastikan `Fitur`, `Cara Kerja`, `Pricing`, `FAQ`, dan `Final CTA` tercakup

**Step 2: Terapkan warna selang-seling**

- `Fitur` putih
- `Cara Kerja` krem lembut
- `Pricing` putih
- `FAQ` krem lembut
- `Final CTA` putih

**Step 3: Pastikan hero dan footer tidak tersentuh**

- jangan ubah selector `landing-shell--hero`
- jangan ubah selector `landing-shell--footer`

### Task 2: Verifikasi tampilan dan scope perubahan

**Files:**
- Review: `fe/src/styles/global.css`

**Step 1: Run lint**

Run: `pnpm lint`
Expected: sukses tanpa error ESLint

**Step 2: Run build**

Run: `pnpm build`
Expected: sukses tanpa error build Vite

**Step 3: Review diff**

Run: `git diff -- docs/plans/2026-04-15-landing-alternating-section-colors-design.md docs/plans/2026-04-15-landing-alternating-section-colors.md fe/src/styles/global.css`
Expected: diff hanya menunjukkan dokumen plan baru dan perubahan CSS untuk pola warna selang-seling landing

## Catatan Eksekusi

- Tidak menambah atau mengubah test file karena user tidak meminta test
- Tidak membuat commit karena user belum meminta commit untuk task ini
