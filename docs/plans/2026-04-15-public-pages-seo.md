# Public Pages SEO Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mengimplementasikan optimasi SEO teknis, on-page, dan dokumentasi untuk halaman publik `/', '/login', '/register'`.

**Architecture:** Perubahan dibatasi ke frontend SPA yang ada. `fe/index.html` akan menyediakan metadata fallback, utilitas SEO internal akan mengelola metadata per route publik, lalu halaman publik akan mengaktifkan metadata, canonical, robots, dan JSON-LD sesuai kebutuhan masing-masing. Artefak crawl seperti `robots.txt` dan `sitemap.xml` akan diletakkan di `fe/public/`, sementara dokumentasi audit dan implementasi disimpan di `docs/tasks/frontend/15-04-2026/semantic-html-seo-improvement/`.

**Tech Stack:** React 19, TypeScript 5.9, React Router 7, Vite 8, vite-plugin-pwa, static public assets existing project

---

### Task 1: Tambah fondasi metadata SEO publik

**Files:**
- Modify: `fe/index.html`
- Create: `fe/src/lib/seo.ts`

**Step 1: Rapikan metadata default di `index.html`**

- ubah `lang` dokumen menjadi `id`
- tambahkan meta description default
- tambahkan canonical fallback
- tambahkan Open Graph dan Twitter Card fallback
- tambahkan robots default yang aman untuk halaman publik

**Step 2: Buat utilitas SEO internal**

- sediakan fungsi atau hook untuk set `document.title`
- sediakan helper untuk set/update meta tag by name/property
- sediakan helper untuk set canonical URL
- sediakan helper untuk set robots policy
- sediakan helper untuk inject dan cleanup JSON-LD per halaman

**Step 3: Pastikan utilitas aman dipakai ulang**

- cleanup metadata yang khusus halaman saat unmount
- fallback tetap kembali ke metadata default bila route berpindah

### Task 2: Terapkan SEO route-level untuk halaman publik

**Files:**
- Modify: `fe/src/features/landing/pages/landing-page.tsx`
- Modify: `fe/src/features/auth/pages/login-page.tsx`
- Modify: `fe/src/features/auth/pages/register-page.tsx`

**Step 1: Landing page `/`**

- set title keyword-focused untuk landing page
- set meta description yang sesuai intent pencarian Indonesia
- set canonical ke root publik
- set OG/Twitter title, description, URL, dan image
- inject JSON-LD `WebSite` dan `Organization`

**Step 2: Login page `/login`**

- set title dan description spesifik login
- set canonical ke `/login`
- set `robots` menjadi `noindex,follow`

**Step 3: Register page `/register`**

- set title dan description spesifik registrasi
- set canonical ke `/register`
- set `robots` menjadi `noindex,follow`

### Task 3: Rapikan on-page SEO, image, dan accessibility di halaman publik

**Files:**
- Modify: `fe/src/features/landing/pages/landing-page.tsx`
- Modify: `fe/src/features/auth/pages/login-page.tsx`
- Modify: `fe/src/features/auth/pages/register-page.tsx`

**Step 1: Verifikasi heading hierarchy**

- pastikan tiap halaman publik hanya memiliki satu `h1`
- pastikan sub-section turun ke `h2` dan `h3`

**Step 2: Perbaiki image semantics**

- pertahankan `alt=""` untuk image dekoratif murni
- beri alt deskriptif bila image membawa konteks konten
- tambahkan `loading` dan `decoding` sesuai prioritas visual

**Step 3: Rapikan semantics interaktif bila perlu**

- pertahankan landmark semantic yang ada
- tambah label atau atribut ARIA hanya bila benar-benar diperlukan di halaman publik

### Task 4: Tambah artefak crawl dan indexing publik

**Files:**
- Create: `fe/public/robots.txt`
- Create: `fe/public/sitemap.xml`

**Step 1: Tambah `robots.txt`**

- izinkan crawling halaman publik utama
- arahkan crawler ke sitemap

**Step 2: Tambah `sitemap.xml`**

- daftarkan URL publik yang relevan
- prioritaskan `/`
- tentukan perlakuan eksplisit untuk `/login` dan `/register` sesuai strategi indexing

### Task 5: Tulis dokumentasi SEO implementasi

**Files:**
- Create: `docs/tasks/frontend/15-04-2026/semantic-html-seo-improvement/README.md`
- Create: `docs/tasks/frontend/15-04-2026/semantic-html-seo-improvement/technical-seo-audit.md`
- Create: `docs/tasks/frontend/15-04-2026/semantic-html-seo-improvement/performance-analysis.md`
- Create: `docs/tasks/frontend/15-04-2026/semantic-html-seo-improvement/content-optimization.md`
- Create: `docs/tasks/frontend/15-04-2026/semantic-html-seo-improvement/accessibility-review.md`
- Create: `docs/tasks/frontend/15-04-2026/semantic-html-seo-improvement/implementation-notes.md`
- Create: `docs/tasks/frontend/15-04-2026/semantic-html-seo-improvement/before-after-comparison.md`

**Step 1: Tulis audit teknis**

- dokumentasikan status sebelum perubahan
- catat metadata, structured data, robots, sitemap, dan canonical strategy

**Step 2: Tulis analisis performa dan accessibility**

- catat optimasi image, render path, dan struktur semantic
- jelaskan dampaknya terhadap SEO

**Step 3: Tulis ringkasan before/after**

- buat perbandingan kondisi awal dan akhir
- catat metrik yang benar-benar bisa dibuktikan dari implementasi dan build, tanpa mengarang skor eksternal

### Task 6: Verifikasi frontend dan dokumentasi

**Files:**
- Review: `fe/index.html`
- Review: `fe/src/lib/seo.ts`
- Review: `fe/src/features/landing/pages/landing-page.tsx`
- Review: `fe/src/features/auth/pages/login-page.tsx`
- Review: `fe/src/features/auth/pages/register-page.tsx`
- Review: `fe/public/robots.txt`
- Review: `fe/public/sitemap.xml`
- Review: `docs/tasks/frontend/15-04-2026/semantic-html-seo-improvement/*`

**Step 1: Run typecheck**

Run: `pnpm typecheck`
Expected: sukses tanpa error TypeScript

**Step 2: Run lint**

Run: `pnpm lint`
Expected: sukses tanpa error ESLint

**Step 3: Run build**

Run: `pnpm build`
Expected: sukses tanpa error build Vite

**Step 4: Review diff**

Run: `git diff -- docs/plans/2026-04-15-public-pages-seo-design.md docs/plans/2026-04-15-public-pages-seo.md fe/index.html fe/src/lib/seo.ts fe/src/features/landing/pages/landing-page.tsx fe/src/features/auth/pages/login-page.tsx fe/src/features/auth/pages/register-page.tsx fe/public/robots.txt fe/public/sitemap.xml docs/tasks/frontend/15-04-2026/semantic-html-seo-improvement`
Expected: diff hanya menunjukkan perubahan SEO publik, artefak crawl, dan dokumentasi yang relevan

## Catatan Eksekusi

- Tidak menambah atau mengubah test file karena user tidak meminta test
- Tidak membuat commit karena user belum meminta commit
