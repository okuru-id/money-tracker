# Root Landing Hero Bar Chart Design

**Tanggal:** 2026-04-14

## Tujuan

Menambahkan ilustrasi `bar-chart.png` pada area `landing-hero-bg-circles` di pojok kiri atas agar hero landing terasa lebih hidup tanpa mengganggu fokus utama pada stat card dan foto hero.

## Arah Perubahan

- tambahkan satu elemen gambar dekoratif di dalam `landing-hero-bg-circles`
- tempatkan gambar di kiri atas dengan ukuran sedang agar jelas terlihat namun tetap sekunder
- jaga layering agar gambar tetap berada di background hero, di bawah stat card dan foto hero
- tambahkan penyesuaian ukuran dan posisi untuk mobile

## Pendekatan yang Dipilih

Pendekatan yang dipilih adalah menambahkan `<img>` langsung di `fe/src/features/landing/pages/landing-page.tsx` lalu mengatur posisi dan ukuran melalui class CSS khusus di `fe/src/styles/global.css`. Cara ini paling mudah dikontrol untuk layout existing karena elemen bisa diposisikan presisi, responsif, dan tetap jelas hubungannya dengan struktur visual hero.

## Scope

- Menambah elemen `bar-chart.png` pada background hero landing
- Menambah style posisi, ukuran, dan layering gambar
- Menjaga section hero lain tetap sama

## Verifikasi

- gambar muncul di area kiri atas background hero
- gambar tidak menutupi stat card atau foto hero
- `pnpm typecheck` sukses
- `pnpm build` sukses

## Catatan

- Tidak dibuat commit karena user belum meminta commit
