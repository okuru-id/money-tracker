# Root Landing Section Gap Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Menambah gap antar section di landing page `/` agar ritme vertikal terasa lebih lega sambil mempertahankan background gap sebagai lanjutan section atas.

**Architecture:** Spacing antar section akan dipindahkan dari container `.landing-page--moneyhub-flat` ke `padding-bottom` pada `.landing-shell` yang bukan section terakhir di `fe/src/styles/global.css`, lalu margin overlap antar `.landing-shell` tetap dihapus. Radius pada sisi antar sibling juga dirapikan agar background parent tidak muncul sebagai seam tipis di mobile. Pendekatan ini menjaga perubahan tetap kecil, konsisten lintas breakpoint, tidak membutuhkan perubahan JSX, dan membuat warna gap mengikuti section atas.

**Tech Stack:** React 19, TypeScript 5.9, Vite 8, CSS global existing project

---

### Task 1: Rapikan spacing antar section landing

**Files:**
- Modify: `fe/src/styles/global.css:4727-4766`
- Modify: `fe/src/styles/global.css:5894-5913`
- Modify: `fe/src/styles/global.css:6101-6103`

**Step 1: Kembalikan gap container landing utama**

- reset `gap` pada `.landing-page--moneyhub-flat` agar parent tidak lagi menggambar strip warna di antara section

**Step 2: Tambahkan jarak dari section atas**

- tambahkan `padding-bottom` sedang pada `.landing-shell` yang bukan section terakhir
- biarkan ruang antar section menjadi bagian dari background section atas

**Step 3: Hapus overlap antar section**

- ubah rule `.landing-shell + .landing-shell` agar tidak lagi memakai margin negatif
- lakukan hal yang sama pada override mobile agar ritmenya konsisten

**Step 4: Rapikan sambungan antar sibling**

- nolkan radius sisi yang saling bertemu agar tidak ada seam tipis saat background section berganti

### Task 2: Verifikasi perubahan frontend

**Files:**
- Review: `fe/src/styles/global.css`

**Step 1: Run build frontend**

Run: `pnpm build`
Expected: sukses tanpa error

**Step 2: Review diff**

Run: `git diff -- fe/src/styles/global.css docs/plans/2026-04-13-root-landing-section-gap-design.md docs/plans/2026-04-13-root-landing-section-gap.md`
Expected: diff hanya menunjukkan penambahan dokumen plan dan perubahan spacing landing yang kecil

## Catatan Eksekusi

- Tidak menambah test file karena project frontend belum punya test runner terkonfigurasi dan user tidak meminta test
- Fokus hanya pada ritme antar section, bukan redesign layout landing

### Task 3: Pindahkan testimonial ke bawah CTA

**Files:**
- Modify: `fe/src/features/landing/pages/landing-page.tsx:138-150`
- Modify: `fe/src/features/landing/pages/landing-page.tsx:247-249`

**Step 1: Hapus testimonial dari posisi awal**

- keluarkan block `landing-feature-grid` dari bawah hero

**Step 2: Tempatkan testimonial setelah CTA**

- sisipkan block testimonial yang sama tepat sebelum footer
- jangan ubah mapping data atau class CSS bila tidak diperlukan

**Step 3: Verifikasi urutan section**

- pastikan urutan akhir menjadi hero, produk, CTA, testimonial, footer

### Task 4: Lebarkan gap landing sedikit

**Files:**
- Modify: `fe/src/styles/global.css:4769-4772`

**Step 1: Naikkan spacing aktif**

- ubah `padding-bottom` pada `.landing-shell:not(:last-child)` sedikit lebih besar dari nilai sekarang
- pertahankan model background gap mengikuti section atas

**Step 2: Verifikasi ritme akhir**

- pastikan section terasa lebih lega tanpa membuat footer atau mobile terlihat terlalu longgar

### Task 5: Naikkan gap bertahap ke 3.25rem

**Files:**
- Modify: `fe/src/styles/global.css:4769-4772`

**Step 1: Naikkan nilai spacing aktif**

- ubah `padding-bottom` dari `3rem` ke `3.25rem`
- pertahankan semua aturan background dan radius yang sudah dirapikan sebelumnya
