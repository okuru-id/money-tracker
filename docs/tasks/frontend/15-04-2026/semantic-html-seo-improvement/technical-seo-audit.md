# Technical SEO Audit

## Sebelum

- `index.html` hanya memiliki title dasar dan `theme-color`
- belum ada meta description default
- belum ada canonical URL
- belum ada Open Graph dan Twitter Card
- belum ada JSON-LD
- belum ada `robots.txt` dan `sitemap.xml`

## Sesudah

### Metadata Default

- `lang` dokumen diubah ke `id`
- title default menjadi `dompetku.id | Aplikasi Catat Keuangan Keluarga`
- meta description default ditambahkan
- canonical fallback ditambahkan

### Route-Level Metadata

- helper `fe/src/lib/seo.ts` mengelola:
  - `document.title`
  - meta description
  - canonical
  - robots
  - Open Graph
  - Twitter Card
  - JSON-LD

### Structured Data

- landing page `/` menambahkan schema:
  - `WebSite`
  - `Organization`

### Crawl Artifacts

- `fe/public/robots.txt` ditambahkan
- `fe/public/sitemap.xml` ditambahkan

## Canonical Strategy

- `/` di-canonical-kan ke root publik
- `/login` dan `/register` memakai canonical masing-masing
- canonical dibangun dari `VITE_APP_BASE_URL` dengan fallback aman

## Indexing Strategy

- `/`: `index,follow,max-image-preview:large`
- `/login`: `noindex,follow`
- `/register`: `noindex,follow`
