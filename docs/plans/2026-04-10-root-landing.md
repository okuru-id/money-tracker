# Root Landing Page Bold Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mengubah landing page publik di `/` menjadi landing page bergaya modern fintech bold dengan hero yang lebih dramatis dan treatment flat premium tanpa gradient, tanpa mengubah perilaku routing guest vs user login.

**Architecture:** Routing root tidak berubah: guest tetap melihat `LandingPage`, user login tetap masuk ke app home di `/`. Pekerjaan difokuskan pada restrukturisasi markup landing page dan penataan ulang styling di `global.css` agar fold pertama lebih kuat, section lebih ringkas, tampilan desktop terasa seperti halaman marketing premium, dan seluruh treatment visual landing memakai solid fills alih-alih gradient.

**Tech Stack:** React 19, TypeScript 5.9, React Router 7, existing session store/router gates, CSS global existing project

---

### Task 1: Susun ulang struktur konten landing page

**Files:**
- Modify: `fe/src/features/landing/pages/landing-page.tsx`
- Modify: `fe/src/styles/global.css`

**Step 1: Rapikan data section agar lebih sales-driven**

- Pangkas copy yang terlalu panjang atau generik
- Ganti struktur section menjadi: hero dramatis, value strip, product showcase, benefit cards, closing CTA
- Pertahankan CTA ke `/register` dan `/login`

**Step 2: Bangun ulang markup hero**

- Hero harus punya area copy utama dan area visual utama yang jelas
- Ganti preview abstrak kecil dengan cluster mockup/surface yang lebih dominan
- Pastikan struktur class tetap konsisten dan mudah di-style dari `global.css`

**Step 3: Rapikan section lanjutan**

- Value strip dibuat lebih ringkas sebagai penguat headline
- Product showcase dibuat lebih terasa seperti preview app nyata
- Benefit cards cukup tiga item dengan pesan yang tajam
- Closing CTA dibuat lebih singkat dan tegas

### Task 2: Bangun visual hero modern fintech bold tanpa gradient

**Files:**
- Modify: `fe/src/styles/global.css`
- Modify: `fe/src/features/landing/pages/landing-page.tsx`

**Step 1: Perkuat layout hero mobile-first**

- Atur spacing hero agar headline, subcopy, dan CTA langsung terbaca
- Buat CTA utama lebih dominan daripada CTA sekunder
- Pastikan visual hero tetap menarik di layar kecil tanpa terasa sesak

**Step 2: Perkuat focal point visual desktop**

- Buat area kanan hero memiliki cluster card/mockup yang dominan
- Gunakan layering, border radius, shadow, dan warna solid untuk depth
- Hindari layout yang terlalu ramai atau terlalu banyak kartu kecil

**Step 3: Perkuat kontras visual**

- Heading, CTA, dan panel utama harus lebih tegas
- Tetap jaga palette teal + warm orange + off-white
- Pastikan page masih konsisten dengan app redesign yang sudah ada

### Task 3: Tata ulang section bawah agar lebih premium

**Files:**
- Modify: `fe/src/styles/global.css`
- Modify: `fe/src/features/landing/pages/landing-page.tsx`

**Step 1: Jadikan value strip sebagai penguat cepat**

- Tampilkan tiga poin utama dalam satu strip/grid yang cepat dipindai
- Kurangi copy deskriptif yang tidak perlu

**Step 2: Perjelas product showcase**

- Buat kartu preview lebih dekat ke bentuk produk finansial yang nyata
- Gunakan hierarchy tipografi dan surface yang kuat

**Step 3: Rapikan benefit cards dan CTA akhir**

- Benefit cards harus konsisten, tidak terlalu verbose
- Footer CTA harus terasa sebagai penutup premium, bukan section tambahan yang lemah

### Task 4: Jaga UX responsive dan scroll behavior

**Files:**
- Modify: `fe/src/styles/global.css`
- Modify: `fe/src/features/landing/pages/landing-page.tsx` bila perlu

**Step 1: Pastikan desktop tidak terlihat seperti mobile yang dibesarkan**

- Atur max-width, grid, alignment, dan whitespace untuk desktop
- Pastikan hero dan section bawah punya ritme vertikal yang seimbang

**Step 2: Pastikan scroll tetap natural**

- Pertahankan solusi `body.landing-route` untuk scroll route landing
- Hindari styling baru yang mengunci overflow atau membuat section terpotong

**Step 3: Pastikan mobile tetap aman**

- Semua section harus tetap stack dengan rapi
- CTA dan preview tidak boleh menyebabkan overflow horizontal

### Task 5: Final verification

**Files:**
- Modify: file frontend terkait landing bila perlu polish akhir

**Step 1: Run typecheck**

Run: `pnpm typecheck`
Expected: sukses tanpa error

**Step 2: Run lint**

Run: `pnpm lint`
Expected: sukses

**Step 3: Run build**

Run: `pnpm build`
Expected: sukses dan bundle ter-build tanpa error

**Step 4: Review worktree**

Run: `git status --short`
Expected: hanya file terkait landing redesign dan dokumen plan yang berubah

## Catatan Eksekusi

- Jangan membuat atau mengubah test file karena user tidak memintanya dan repo melarang itu
- Jangan ubah routing root lagi karena perilaku guest/authenticated sudah benar
- Fokus pada perubahan markup landing dan CSS yang paling kecil namun memberi dampak visual besar
