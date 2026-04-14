# Root Landing Hero Visual Editorial Design

**Tanggal:** 2026-04-12

## Tujuan

Merapikan `landing-moneyhub-hero__visual` agar tetap terasa editorial, tetapi tidak lagi terlihat seperti kumpulan widget yang melayang tanpa struktur.

## Masalah yang Diselesaikan

Komposisi hero saat ini sudah centered pada sisi copy, tetapi area visual masih memakai pola lama: satu dashboard card besar dengan dua kartu kecil berposisi absolut. Hasilnya, visual terasa terpisah dari headline dan kurang stabil di desktop maupun mobile.

Masalah utama:

- elemen pendukung terlihat seperti floating widget acak, bukan bagian dari satu komposisi
- overlap belum terasa disengaja secara editorial
- kedalaman visual ada, tetapi ritme spacing dan hierarchy belum rapi

## Arah Visual

Hero visual diarahkan ke gaya **editorial inset composition**.

Prinsipnya:

- satu panel utama tetap menjadi fokus mutlak
- dua kartu pendukung tetap overlap untuk menjaga karakter editorial
- setiap overlap harus punya anchor visual yang jelas ke panel utama
- seluruh elemen harus terasa berasal dari satu sistem produk yang sama

## Struktur Visual Baru

### Panel utama

- `landing-dashboard-card` menjadi hero shot produk
- tinggi panel sedikit diperbesar agar cukup dominan di bawah headline
- konten internal tetap ringkas: topline, saldo aktif, grafik, dan summary grid

### Inset card kiri atas

- kartu `Catatan bulan ini` diposisikan sebagai inset kecil di kiri atas
- ukurannya diperkecil agar berfungsi sebagai aksen, bukan kompetitor panel utama
- style tetap light card untuk kontras terhadap dark hero card

### Inset card kanan bawah

- kartu `Grafik arus kas` diposisikan di kanan bawah sebagai penyeimbang visual
- bentuk dan skala dibuat lebih ringkas daripada versi sekarang
- overlap dibuat terasa sengaja, bukan seperti tooltip yang kebetulan lewat

## Responsive Behavior

- desktop: overlap tetap dipertahankan dengan posisi yang disiplin
- mobile: inset card diturunkan agar tidak memotong area penting panel utama
- tinggi hero visual dikurangi ketergantungannya pada posisi absolut ekstrem

## Dampak Implementasi

- perubahan markup kecil di `fe/src/features/landing/pages/landing-page.tsx`
- penyesuaian utama di `fe/src/styles/global.css` pada area hero visual
- class lama tetap dipakai selama masih relevan untuk menjaga perubahan tetap minimal

## Verifikasi

- visual hero terlihat seperti satu komposisi editorial yang utuh
- panel utama tetap jadi fokus pertama setelah CTA
- inset card memberi depth tanpa membuat layout terasa berantakan
- `pnpm build` sukses

## Catatan

- Dokumen ini hanya mencakup refinement `hero visual`, bukan redesign ulang seluruh landing page
- Tidak dibuat commit karena user belum meminta commit
