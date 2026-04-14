# Root Landing Centered Editorial Design

**Tanggal:** 2026-04-12

## Tujuan

Membuat hero dan product showcase landing page `/` lebih dekat ke referensi user: lebih terpusat, lebih lapang, lebih sedikit elemen, dan lebih editorial.

## Masalah yang Diselesaikan

Walau struktur landing sudah lebih ringkas, hero dan showcase masih terasa terlalu “app dashboard split layout”. Referensi yang diberikan user justru mengandalkan headline terpusat, ritme whitespace yang lega, dan satu panel utama yang menjadi fokus.

Masalah utama saat ini:

- hero masih berat karena layout dua kolom dan terlalu banyak elemen mengapung
- visual dashboard terasa seperti section tersendiri, bukan panel fokus di bawah headline
- showcase masih berupa grid kartu, bukan satu pengalaman produk utama yang lebih tenang

## Scope

- Mengubah komposisi visual hero menjadi lebih terpusat
- Menyederhanakan elemen visual yang mengapung di hero
- Mengubah showcase menjadi satu panel besar yang lebih editorial
- Tidak mengubah arah copy utama yang sudah disederhanakan kecuali penyesuaian kecil visual

## Arah Visual

Landing diarahkan ke gaya **centered editorial product page**.

Prinsipnya:

- headline menjadi pusat perhatian pertama
- CTA ada tepat di bawah headline
- visual produk hadir sebagai panel utama di bawahnya, bukan pesaing headline
- showcase utama terlihat seperti satu kanvas produk, bukan kumpulan card fitur

## Struktur Visual Baru

### Hero

- navbar tetap tipis dan ringan
- eyebrow kecil di tengah atas
- headline besar terpusat
- subheadline ringkas dan terpusat
- dua CTA di tengah
- dashboard card dipindah ke bawah sebagai hero panel utama
- floating cards dikurangi drastis; cukup 1-2 elemen kecil bila masih dibutuhkan

### Social proof

- logos tetap ringan
- quote/testimonial ditaruh sebagai blok singkat yang centered

### Showcase

- heading section terpusat
- tabs kecil berada di atas panel
- satu panel utama horizontal menjadi fokus
- panel berisi poin manfaat utama dan satu preview ringkas

## Dampak Implementasi

- perubahan utama di `fe/src/features/landing/pages/landing-page.tsx`
- `fe/src/styles/global.css` akan cukup banyak berubah pada bagian hero dan showcase
- kemungkinan beberapa class lama tetap dipakai, tetapi orientasi layout-nya berubah signifikan

## Verifikasi

- hero terasa lebih ringan dan fokus ke headline
- dashboard hero terasa sebagai panel showcase, bukan kolom kedua yang berat
- showcase lebih dekat ke referensi: satu panel besar, lebih sedikit elemen terpisah
- `pnpm build`

## Catatan

- Dokumen ini melanjutkan arah compact redesign sebelumnya
- Tidak dibuat commit karena user belum meminta commit
