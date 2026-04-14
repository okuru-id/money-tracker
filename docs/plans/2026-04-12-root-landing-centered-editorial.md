# Root Landing Centered Editorial Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Membuat hero dan showcase landing page `/` lebih terpusat, lebih lapang, dan lebih dekat ke referensi visual user tanpa kembali membuat halaman terlalu penuh.

**Architecture:** Perubahan dilakukan dengan mengubah struktur JSX dan CSS hero/showcase di landing page. Hero akan bergeser dari komposisi dua kolom ke komposisi centered stack dengan satu panel produk besar di bawah CTA. Showcase juga akan disederhanakan dari grid kartu menjadi satu panel utama dengan tab kecil di atasnya.

**Tech Stack:** React 19, TypeScript 5.9, React Router 7, CSS global existing project

---

### Task 1: Ubah hero menjadi centered layout

**Files:**
- Modify: `fe/src/features/landing/pages/landing-page.tsx:36-144`
- Modify: `fe/src/styles/global.css:4840-5248`

**Step 1: Pusatkan hero copy**

- eyebrow, headline, subheadline, dan CTA ditata centered

**Step 2: Turunkan visual dashboard menjadi panel utama di bawah copy**

- dashboard card tidak lagi berperan sebagai kolom kanan yang berat

**Step 3: Kurangi floating visuals**

- sisakan hanya elemen kecil yang benar-benar membantu depth

### Task 2: Rapikan social proof dan testimonial ringan

**Files:**
- Modify: `fe/src/features/landing/pages/landing-page.tsx:146-170`
- Modify: `fe/src/styles/global.css:5035-5485`

**Step 1: Buat logos lebih ringan dan centered**

- logos tidak terasa seperti card besar

**Step 2: Buat quote lebih editorial**

- testimonial singkat jadi blok pendukung, bukan section dengan weight berlebihan

### Task 3: Ubah showcase menjadi satu panel besar

**Files:**
- Modify: `fe/src/features/landing/pages/landing-page.tsx:172-214`
- Modify: `fe/src/styles/global.css:5254-5675`

**Step 1: Heading showcase dibuat centered**

- section title dan supporting copy dipusatkan

**Step 2: Tab kecil ditempatkan di atas panel**

- lebih mirip segmented control pada referensi

**Step 3: Satu panel utama menjadi fokus**

- manfaat inti ada di satu panel besar
- card pendukung diminimalkan

### Task 4: Verifikasi akhir

**Files:**
- Modify: file landing terkait bila ada adjustment kecil setelah review visual

**Step 1: Run build**

Run: `pnpm build`
Expected: sukses tanpa error

**Step 2: Review diff**

Run: `git diff -- fe/src/features/landing/pages/landing-page.tsx fe/src/styles/global.css`
Expected: diff menunjukkan hero/showcase lebih terpusat dan elemen visual lebih sedikit

## Catatan Eksekusi

- Jangan tambah dependency atau test file
- Jaga jumlah section tetap sedikit
- Fokus pada whitespace, hirarki, dan komposisi visual, bukan dekorasi berlebihan
