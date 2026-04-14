# Root Landing Section Gap Design

**Tanggal:** 2026-04-13

## Tujuan

Menambah jarak antar section di landing page `/` dengan ritme yang lebih lega namun tetap konsisten dengan struktur dan visual yang sudah ada.

## Masalah yang Diselesaikan

Section-section utama landing saat ini terasa terlalu rapat, terutama karena spacing antar wrapper section dibuat nyaris menempel. Akibatnya ritme baca halaman terasa padat dan perpindahan antar blok konten tidak cukup jelas.

## Arah Perubahan

- spacing antar section tidak lagi dibuat dari `gap` container utama
- jarak dipindahkan ke `padding-bottom` pada wrapper `.landing-shell` yang bukan section terakhir
- margin overlap antar `.landing-shell` tetap dihilangkan agar section tidak saling menempel lagi
- radius antar sibling dirapikan agar tidak muncul seam tipis saat background section berganti
- struktur JSX landing dipertahankan apa adanya
- perubahan dibatasi ke stylesheet landing yang sudah ada

## Pendekatan yang Dipilih

Perubahan dilakukan di `fe/src/styles/global.css` dengan mengembalikan `gap` container landing ke kondisi rapat, lalu menambah `padding-bottom` sedang pada `.landing-shell` yang bukan section terakhir. Dengan cara ini, ruang antar konten tetap muncul, tetapi warna area jeda menjadi perpanjangan dari background section atas, bukan warna container induk.

Pendekatan ini lebih sesuai dengan kebutuhan visual user karena landing saat ini punya section terang dan gelap yang bergantian. Gap yang mengikuti section atas membuat transisi terasa lebih natural. Radius pada sisi yang saling bertemu juga dibuat rata agar tidak ada garis tipis dari background parent di mobile.

## Scope

- Mengubah spacing antar section landing utama
- Menjaga tampilan tetap konsisten di mobile dan desktop
- Tidak mengubah copy, struktur JSX, atau dependency

## Verifikasi

- section landing terasa lebih renggang saat discroll
- area gap terlihat sebagai lanjutan background section atas
- tidak ada overlap negatif antar section
- `pnpm build` sukses

## Catatan

- Tidak dibuat commit karena user belum meminta commit

## Revisi Lanjutan

- section testimonial dipindah ke bawah CTA dan tepat sebelum footer
- struktur testimonial tetap sama agar perubahan tetap minimal
- tujuan perpindahan adalah menjadikan testimonial sebagai social proof penutup sebelum user masuk ke area footer
- gap antar section diperlebar sedikit dari nilai aktif sebelumnya, tetap mengikuti background section atas
- gap antar section dinaikkan lagi secara bertahap ke `3.25rem`
