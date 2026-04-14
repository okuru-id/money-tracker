# Before After Comparison

## Ringkasan

Perbandingan berikut hanya memakai perubahan yang benar-benar dapat dibuktikan dari implementasi file.

## Sebelum

- 1 title default global
- 0 meta description route-specific
- 0 canonical URL yang dikelola per halaman
- 0 Open Graph metadata route-specific
- 0 Twitter Card metadata route-specific
- 0 JSON-LD schema
- 0 file `robots.txt`
- 0 file `sitemap.xml`
- 0 route publik dengan robots policy eksplisit

## Sesudah

- 3 halaman publik dengan metadata route-specific: `/`, `/login`, `/register`
- 3 canonical URL route-specific
- 3 robots policy route-specific
- 1 landing page dengan JSON-LD
- 2 schema types pada landing page: `WebSite` dan `Organization`
- 1 file `robots.txt`
- 1 file `sitemap.xml`
- 1 hero image diprioritaskan untuk LCP
- 1 background image dibuat lazy

## Dampak Praktis

- crawler mendapat sinyal indexability yang lebih jelas
- social sharing halaman publik memiliki preview yang lebih konsisten
- landing page memiliki konteks semantic tambahan untuk mesin pencari
- struktur navigasi internal halaman publik menjadi lebih nyata melalui anchor links
