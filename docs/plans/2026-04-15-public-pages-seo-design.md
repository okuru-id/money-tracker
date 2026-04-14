# Public Pages SEO Design

**Tanggal:** 2026-04-15

## Tujuan

Mengoptimalkan SEO untuk halaman publik frontend `/', '/login', '/register'` tanpa menambah dependency baru dan tanpa mengubah arsitektur SPA yang ada.

## Kondisi Saat Ini

- `fe/index.html` hanya memiliki title brand dasar dan `theme-color`
- belum ada meta description, canonical, Open Graph, Twitter Card, atau structured data
- belum ada `robots.txt` dan `sitemap.xml` untuk halaman publik
- landing page publik berada di route `/` untuk user yang belum login
- `/login` dan `/register` adalah halaman publik utilitas yang sebaiknya tidak diindeks

## Pendekatan yang Dipilih

Dipilih SEO layer per route di frontend SPA. `index.html` akan menjadi fallback metadata global, lalu halaman publik akan mengatur metadata spesifik melalui utilitas SEO ringan internal. Pendekatan ini menjaga perubahan tetap kecil, tidak menambah library seperti React Helmet, dan cukup fleksibel untuk halaman publik yang memang perlu dibedakan metadata-nya.

## Alternatif yang Dipertimbangkan

1. Hardcode semua metadata di `index.html`

Pendekatan ini ditolak karena semua route publik akan berbagi title, description, dan canonical yang sama.

2. Fokus hanya ke landing page `/`

Pendekatan ini ditolak karena `/login` dan `/register` tetap memerlukan title, canonical, dan robots policy yang jelas.

3. Migrasi ke SSR/prerender

Pendekatan ini ditolak karena terlalu besar untuk scope perubahan saat ini dan tidak diperlukan untuk peningkatan SEO dasar yang diminta.

## Scope Perubahan

- optimasi metadata default di `fe/index.html`
- tambah utilitas internal untuk mengatur title, description, canonical, robots, Open Graph, Twitter Card, dan JSON-LD
- terapkan metadata halaman khusus di `LandingPage`, `LoginPage`, dan `RegisterPage`
- tambah `robots.txt` dan `sitemap.xml` di `fe/public/`
- rapikan elemen on-page SEO dan accessibility pada halaman publik
- buat dokumentasi SEO di `docs/tasks/frontend/15-04-2026/semantic-html-seo-improvement/`

## Strategi Metadata

### Halaman `/`

- title dan description akan fokus pada intent pencarian seputar pencatatan keuangan keluarga, catat pengeluaran, AI, dan scan struk
- canonical diarahkan ke root publik
- Open Graph dan Twitter Card memakai metadata yang cocok untuk sharing landing page
- JSON-LD ditambahkan untuk `WebSite` dan `Organization`
- halaman ini diizinkan untuk diindeks

### Halaman `/login` dan `/register`

- title dan description dibuat spesifik sesuai fungsi halaman
- canonical diarahkan ke masing-masing route
- metadata sosial tetap tersedia sebagai fallback yang rapi
- `robots` diset `noindex,follow` agar halaman utilitas tidak menjadi target organic search

## Strategi On-Page SEO dan Accessibility

- ubah `lang` dokumen menjadi `id`
- pertahankan satu `h1` per halaman publik
- pastikan section utama memakai `h2` dan item turunan memakai `h3`
- image dekoratif tetap `alt=""`, image yang mendukung konteks hero diberi alt deskriptif bila informatif
- tambahkan atribut image seperti `loading` dan `decoding` yang sesuai untuk membantu performa dan stabilitas rendering
- pertahankan semantic landmarks `main`, `header`, `nav`, `section`, dan `footer`

## Strategi Performa

- lakukan optimasi ringan yang langsung relevan untuk SEO tanpa mengubah arsitektur besar
- prioritaskan hero image publik untuk LCP
- lazy load image non-kritis
- hindari penambahan JavaScript runtime atau dependency baru
- verifikasi akhir memakai `pnpm typecheck`, `pnpm lint`, dan `pnpm build`

## Dokumentasi SEO

Folder dokumentasi implementasi akan dibuat di:

- `docs/tasks/frontend/15-04-2026/semantic-html-seo-improvement/`

Isi dokumen:

- `README.md`
- `technical-seo-audit.md`
- `performance-analysis.md`
- `content-optimization.md`
- `accessibility-review.md`
- `implementation-notes.md`
- `before-after-comparison.md`

## Risiko dan Batasan

- karena aplikasi masih SPA, metadata route-level terutama dihasilkan di client-side, sehingga hasil SEO tidak setara SSR penuh
- route yang dibalik auth tidak akan dijadikan target indexing
- optimasi server compression dan response time backend tidak termasuk perubahan frontend ini

## Verifikasi

- metadata default muncul di `index.html`
- metadata route-level untuk `/`, `/login`, `/register` berubah sesuai halaman
- `robots.txt` dan `sitemap.xml` tersedia di output frontend
- `pnpm typecheck` sukses
- `pnpm lint` sukses
- `pnpm build` sukses

## Catatan

- Tidak dibuat commit karena user belum meminta commit
- Tidak menambah test file karena user tidak meminta test dan repo frontend belum memiliki test runner terkonfigurasi
