# Implementation Notes

## Keputusan Teknis

### Mengapa tanpa library SEO tambahan

Repo belum memakai head manager seperti React Helmet. Untuk perubahan kecil dan terkontrol, helper internal lebih ringan dan tidak menambah dependency baru.

### Mengapa login dan register `noindex`

Kedua halaman ini bersifat utilitas. Halaman tersebut perlu metadata yang rapi untuk browser dan sharing, tetapi bukan target utama organic search.

### Mengapa sitemap hanya memuat `/`

Landing page adalah halaman publik utama yang memang layak diindeks. Login dan register sengaja tidak dipromosikan lewat sitemap karena strategi indexing-nya `noindex,follow`.

### Catatan domain sitemap

`sitemap.xml` memakai domain kanonis `https://dompetku.id/`. Jika domain produksi berubah, file ini perlu disesuaikan.

## Trade-off

- metadata route-level di SPA tetap bergantung pada client-side execution
- perubahan ini meningkatkan baseline SEO teknis, tetapi belum menggantikan manfaat SSR atau prerender
