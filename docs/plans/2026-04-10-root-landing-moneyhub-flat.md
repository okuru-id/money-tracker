# Root Landing MoneyHub Flat Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Merombak landing page publik di `/` agar mengikuti vibe fintech modern ala MoneyHub dalam versi dark flat tanpa gradient, tanpa mengubah perilaku routing guest vs user login.

**Architecture:** Routing root tetap sama: guest melihat `LandingPage`, user login tetap masuk ke app home di `/`. Pekerjaan dipusatkan pada restrukturisasi besar `fe/src/features/landing/pages/landing-page.tsx` dan styling landing di `fe/src/styles/global.css` agar landing berubah dari hero flat premium sederhana menjadi landing marketing dark fintech dengan navbar, hero dashboard, feature sections, stats, testimonial, CTA, dan footer.

**Tech Stack:** React 19, TypeScript 5.9, React Router 7, existing session store/router gates, CSS global existing project

---

### Task 1: Susun ulang struktur landing menjadi marketing page penuh

**Files:**
- Modify: `fe/src/features/landing/pages/landing-page.tsx`
- Modify: `fe/src/styles/global.css`

**Step 1: Ganti struktur section utama**

- Ubah landing menjadi urutan: navbar, hero, trusted logos, features, precision section, transfer section, efficiency section, testimonial, stats, CTA akhir, footer
- Hapus struktur lama yang terlalu fokus pada app preview sederhana

**Step 2: Rapikan source data statis**

- Definisikan array data untuk menu, logos, features, metrics, testimonial, dan footer links langsung di file page
- Pastikan copy tetap menjual dompetku.id, bukan brand referensi

**Step 3: Pertahankan CTA route existing**

- `Sign up` dan CTA utama tetap ke `/register`
- `Login` tetap ke `/login`

### Task 2: Bangun hero dark fintech flat

**Files:**
- Modify: `fe/src/features/landing/pages/landing-page.tsx`
- Modify: `fe/src/styles/global.css`

**Step 1: Buat hero dua kolom**

- Kiri untuk headline, subcopy, CTA, dan trusted logos
- Kanan untuk dashboard cluster, rating card, user stat card, dan small chart card

**Step 2: Terapkan visual dark flat**

- Gunakan background gelap solid
- Tambahkan subtle grid/pattern non-gradient untuk rasa SaaS
- Gunakan CTA hijau solid dan panel solid gelap/terang

**Step 3: Jaga hierarchy hero**

- Headline harus dominan
- CTA utama lebih kontras dari CTA sekunder
- Visual kanan harus jadi focal point desktop tanpa membuat mobile rusak

### Task 3: Bangun section marketing lanjutan

**Files:**
- Modify: `fe/src/features/landing/pages/landing-page.tsx`
- Modify: `fe/src/styles/global.css`

**Step 1: Features section**

- Tampilkan tiga feature cards dengan copy singkat
- Setiap card harus terasa seperti benefit fintech/SaaS, bukan list generik

**Step 2: Precision dan transfer sections**

- Buat kombinasi dark cards, light cards, stats block, dan mock transfer panel
- Section harus menjual kontrol finansial, tracking, dan operasional harian

**Step 3: Efficiency, testimonial, dan stats**

- Buat visual + copy block untuk section efisiensi
- Tambahkan testimonial card premium
- Tambahkan stats strip 4 metrik utama

### Task 4: Bangun CTA akhir dan footer marketing

**Files:**
- Modify: `fe/src/features/landing/pages/landing-page.tsx`
- Modify: `fe/src/styles/global.css`

**Step 1: CTA akhir**

- Buat block promo akhir dengan smartphone/dashboard mockup
- CTA tetap mengarah ke alur register/login existing

**Step 2: Footer**

- Tambahkan brand summary, newsletter input, grouped links, dan social placeholders
- Jaga footer tetap rapi di mobile dan desktop

### Task 5: Responsive pass dan no-gradient pass

**Files:**
- Modify: `fe/src/styles/global.css`
- Modify: `fe/src/features/landing/pages/landing-page.tsx` bila perlu

**Step 1: Responsive desktop/mobile**

- Desktop harus terasa seperti landing marketing modern
- Mobile harus stack rapi tanpa overflow horizontal

**Step 2: Scroll dan route behavior**

- Pastikan `body.landing-route` tetap mengizinkan scroll alami
- Jangan ganggu route logic guest vs authenticated yang sudah benar

**Step 3: Pastikan landing tetap nol-gradient**

- Gunakan hanya warna solid, border, shadow, opacity, dan pattern non-gradient
- Jangan menambah deklarasi `linear-gradient(...)` atau `radial-gradient(...)`

### Task 6: Final verification

**Files:**
- Modify: file frontend terkait landing bila perlu polish akhir

**Step 1: Run zero-gradient check**

Run: `grep -n "gradient" fe/src/styles/global.css`
Expected: tidak ada hasil

**Step 2: Run typecheck**

Run: `pnpm typecheck`
Expected: sukses tanpa error

**Step 3: Run lint**

Run: `pnpm lint`
Expected: sukses

**Step 4: Run build**

Run: `pnpm build`
Expected: sukses dan bundle ter-build tanpa error

**Step 5: Review worktree**

Run: `git status --short`
Expected: hanya file terkait landing redesign dan dokumen plan yang berubah

### Task 7: Balanced refinement polish

**Files:**
- Modify: `fe/src/features/landing/pages/landing-page.tsx` bila perlu
- Modify: `fe/src/styles/global.css`

**Step 1: Rapikan hero density**

- Kurangi rasa padat pada fold pertama
- Rapikan headline, CTA, dan floating cards agar lebih tenang

**Step 2: Rapikan ritme section**

- Sesuaikan spacing vertikal antar section dan card
- Kurangi rasa numpuk pada mobile

**Step 3: Perkuat CTA akhir dan footer**

- Buat area closing lebih meyakinkan
- Rapikan struktur footer agar lebih bersih dan mudah dipindai

## Catatan Eksekusi

- Jangan membuat atau mengubah test file karena user tidak memintanya dan repo melarang itu
- Jangan ubah routing root lagi karena perilaku guest/authenticated sudah benar
- Fokus hanya pada landing page publik, bukan app setelah login
- Vibe MoneyHub hanya sebagai referensi visual; branding dan konten tetap dompetku.id
