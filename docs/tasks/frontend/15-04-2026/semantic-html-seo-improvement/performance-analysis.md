# Performance Analysis

## Fokus Optimasi

Optimasi performa dibatasi pada perubahan frontend publik yang paling relevan terhadap SEO tanpa mengubah arsitektur aplikasi.

## Perubahan

### Hero Image

- image utama landing page diberi:
  - `loading="eager"`
  - `decoding="async"`
  - `fetchPriority="high"`

Tujuan: membantu browser memprioritaskan aset yang paling terlihat di atas fold dan berpotensi mempengaruhi LCP.

### Background Image

- grafik dekoratif landing page diberi:
  - `loading="lazy"`
  - `decoding="async"`

Tujuan: mengurangi kompetisi resource terhadap konten hero utama.

### JavaScript Runtime

- tidak ada dependency SEO baru
- tidak ada library head manager tambahan

Tujuan: menjaga bundle tetap kecil dan menghindari biaya runtime yang tidak perlu.

## Dampak yang Diharapkan

- prioritas render lebih baik untuk hero visual
- metadata per route tanpa overhead library tambahan
- baseline crawlability meningkat melalui sitemap dan robots

## Di Luar Scope

- SSR atau prerender
- optimasi image format generasi baru
- compression server
- tuning backend response time
