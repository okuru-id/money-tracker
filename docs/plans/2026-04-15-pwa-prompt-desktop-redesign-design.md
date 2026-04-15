# PWA Prompt Desktop Redesign Design

**Tanggal:** 2026-04-15

## Tujuan

Mendesain ulang `pwa-install-prompt--bottom` khusus desktop sidebar agar tampil rapi, proporsional, dan terasa seperti widget sidebar premium, tanpa mengubah perilaku prompt mobile.

## Kondisi Saat Ini

- prompt desktop sudah dipindah ke bawah sidebar
- komponen yang dipakai masih layout horizontal yang sama dengan versi mobile
- akibatnya isi card terlalu rapat dan kurang cocok untuk lebar sidebar

## Pendekatan yang Dipilih

Desktop sidebar prompt akan diubah menjadi widget vertikal premium melalui styling terisolasi di wrapper desktop. Struktur komponen tetap dipakai ulang, tetapi layout, spacing, alignment, dan hierarchy visual akan diubah hanya pada konteks `.mobile-shell__pwa-prompt-desktop`.

## Alternatif yang Dipertimbangkan

1. Banner minimal dengan satu tombol

Ditolak karena terlalu tipis untuk konteks sidebar dan kurang terasa sebagai module yang intentional.

2. Card vertikal sangat ringkas

Ditolak karena terlalu utilitarian dan tidak sesuai arah visual premium yang diminta.

## Arah Implementasi

- mobile prompt tidak diubah
- desktop sidebar prompt akan menjadi card vertikal
- icon dibuat seperti badge/header kecil
- title dan description ditata menjadi stack yang lebih rapi
- action buttons ditata vertikal atau full-width agar tidak saling berebut ruang
- close button tetap ada, tetapi dibuat lebih ringan dan tidak merusak komposisi

## Verifikasi

- mobile prompt tetap berperilaku sama
- desktop prompt tampil sebagai widget sidebar premium yang rapi
- `pnpm lint` sukses
- `pnpm build` sukses

## Catatan

- Tidak dibuat commit karena user belum meminta commit untuk task ini
