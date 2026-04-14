# Root Landing Compact Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Memangkas landing page `/` agar lebih ringkas, lebih dekat ke referensi user, dan lebih jelas menyampaikan value produk dompetku.id sebagai money tracker.

**Architecture:** Perubahan dilakukan dengan menyederhanakan struktur JSX di `fe/src/features/landing/pages/landing-page.tsx` dan membersihkan CSS yang tidak lagi diperlukan di `fe/src/styles/global.css`. Banyak section lama akan dihapus atau digabung menjadi tiga area utama: hero, social proof ringan, product showcase utama, lalu closing CTA dan footer.

**Tech Stack:** React 19, TypeScript 5.9, React Router 7, CSS global existing project

---

### Task 1: Sederhanakan struktur JSX landing page

**Files:**
- Modify: `fe/src/features/landing/pages/landing-page.tsx:4-395`

**Step 1: Pertahankan hero**

- Tetap gunakan brand, nav, headline, CTA, dan visual dashboard
- Ringkas data pendukung bila perlu

**Step 2: Gabungkan testimonial ke social proof ringan**

- trusted logos dan quote singkat ditempatkan dalam area yang lebih ringkas

**Step 3: Hapus section middle yang terlalu banyak**

- hapus feature grid, precision, transfer, efficiency, testimonial standalone, dan stats standalone
- ganti dengan satu product showcase utama

**Step 4: Ringkas closing CTA dan footer**

- CTA dibuat lebih pendek
- footer tetap ada namun lebih simple

### Task 2: Tulis ulang copy agar lebih relevan

**Files:**
- Modify: `fe/src/features/landing/pages/landing-page.tsx:4-395`

**Step 1: Rapikan headline dan subheadline**

- langsung menjelaskan bahwa produk membantu mencatat transaksi, memantau saldo, dan mengelola uang keluarga

**Step 2: Rapikan showcase content**

- fokus hanya pada capability inti yang relevan
- hindari copy marketing generik yang tidak spesifik ke money tracker

**Step 3: Rapikan CTA**

- buat ajakan akhir singkat dan tegas

### Task 3: Sederhanakan CSS landing

**Files:**
- Modify: `fe/src/styles/global.css:4716-5717`

**Step 1: Hapus style section yang tidak dipakai lagi**

- bersihkan style untuk precision, transfer, efficiency, testimonial, stats lama bila tidak lagi dipakai

**Step 2: Style ulang struktur baru**

- hero
- social proof ringan
- product showcase utama
- closing CTA
- footer

**Step 3: Jaga visual tetap clean**

- lebih sedikit border, shadow, dan card yang tidak perlu
- pertahankan dark hero + dark footer sesuai arah user

### Task 4: Verifikasi akhir

**Files:**
- Modify: file landing terkait bila ada adjustment kecil setelah review visual

**Step 1: Run build**

Run: `pnpm build`
Expected: sukses tanpa error

**Step 2: Review diff**

Run: `git diff -- fe/src/features/landing/pages/landing-page.tsx fe/src/styles/global.css`
Expected: diff menunjukkan section yang lebih sedikit dan struktur yang lebih ringkas

## Catatan Eksekusi

- Jangan buat test file
- Fokus ke pengurangan struktur, bukan memperindah struktur lama yang sudah terlalu penuh
- Lebih baik sedikit section yang kuat daripada banyak section yang lemah
