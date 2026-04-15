# PWA Prompt Desktop Variant Design

**Tanggal:** 2026-04-15

## Tujuan

Mendesain ulang `pwa-install-prompt--bottom` di desktop view dengan struktur markup khusus agar cocok ditempatkan di bagian bawah sidebar, tanpa mengubah pengalaman mobile.

## Kondisi Saat Ini

- prompt desktop sudah berada di bawah sidebar
- tampilan masih berangkat dari struktur mobile, sehingga komposisinya tetap terasa sempit dan berantakan
- styling saja tidak cukup karena hierarchy dan susunan elemen dasar kurang cocok untuk lebar sidebar

## Pendekatan yang Dipilih

Dipilih variant desktop di dalam komponen `PwaInstallPrompt`. Variant ini memakai logic install/dismiss yang sama, tetapi punya struktur markup tersendiri untuk konteks sidebar desktop.

## Alternatif yang Dipertimbangkan

1. Komponen desktop terpisah

Ditolak karena akan menduplikasi logic install dan dismissal.

2. CSS-only pada struktur existing

Ditolak karena akar masalah ada pada struktur layout, bukan sekadar spacing atau warna.

## Arah Visual

- desktop prompt menjadi widget sidebar premium
- card vertikal dengan hierarchy yang jelas
- badge kecil di atas
- title singkat dan description ringkas
- tombol utama full-width
- tombol sekunder lebih ringan
- close button kecil di sudut card

## Scope Implementasi

- `PwaInstallPrompt` mendapat variant desktop sidebar
- `MobileShell` desktop memakai variant itu
- CSS desktop sidebar diarahkan ke variant baru
- mobile prompt tetap memakai struktur lama

## Verifikasi

- mobile prompt tetap sama
- desktop prompt tampil sebagai widget sidebar yang rapi
- `pnpm lint` sukses
- `pnpm build` sukses

## Catatan

- Tidak dibuat commit karena user belum meminta commit untuk task ini
