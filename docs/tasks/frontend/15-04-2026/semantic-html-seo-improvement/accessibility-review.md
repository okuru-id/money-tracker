# Accessibility Review

## Relevansi ke SEO

Struktur semantic dan aksesibilitas yang baik membantu crawler memahami konten utama sekaligus meningkatkan usability.

## Temuan dan Perbaikan

### Semantic HTML

- landing page tetap memakai `main`, `header`, `nav`, `section`, dan `footer`
- login dan register memakai struktur section dengan heading yang jelas

### Heading Hierarchy

- setiap halaman publik mempertahankan satu `h1`
- section turunan memakai `h2` dan item kartu memakai `h3`

### Images

- image dekoratif tetap memakai `alt=""`
- image hero informatif sekarang memakai alt deskriptif

### ARIA dan Navigation

- `aria-label` existing pada navigation tetap dipertahankan
- anchor links di menu landing membantu orientasi keyboard dan navigasi halaman
- viewport halaman publik tidak lagi mematikan pinch-zoom browser
- tombol show/hide password di login dan register kembali bisa diakses lewat keyboard

## Catatan

Tidak semua aspek WCAG 2.1 AA diaudit penuh secara visual. Fokus perubahan ini dibatasi pada area publik yang bersinggungan langsung dengan SEO teknis dan semantic markup.
