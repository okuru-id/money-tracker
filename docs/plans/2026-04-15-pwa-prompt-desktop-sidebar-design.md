# PWA Prompt Desktop Sidebar Design

**Tanggal:** 2026-04-15

## Tujuan

Memindahkan `pwa-install-prompt` ke area bawah sidebar pada desktop view, sambil mempertahankan perilaku prompt bottom existing pada mobile.

## Kondisi Saat Ini

- `PwaInstallPrompt` selalu dirender sebagai elemen sibling dari `PullToRefresh` dan `nav`
- positioning prompt bergantung pada class `pwa-install-prompt--bottom` yang berbasis `position: fixed`
- pada desktop, sidebar berada di kolom kiri (`.mobile-shell__tabs`) dan prompt belum menjadi bagian dari flow sidebar

## Pendekatan yang Dipilih

Prompt desktop akan menjadi bagian dari kolom sidebar kiri, ditempatkan di area bawah dengan padding tetap. Mobile tetap memakai prompt bottom berbasis overlay agar perilaku existing tidak berubah di layar kecil.

## Alternatif yang Dipertimbangkan

1. Tetap `fixed` lalu di-anchor ke kiri bawah desktop

Ditolak karena prompt tetap terasa overlay dan bukan bagian natural dari sidebar.

2. Menaruh prompt sebagai elemen flow biasa setelah daftar menu tanpa kontrol layout tambahan

Ditolak karena posisinya bisa tidak konsisten ketika tinggi sidebar berubah.

## Arah Implementasi

- modifikasi `MobileShell` agar prompt desktop dirender di dalam `nav` sidebar desktop
- pertahankan prompt mobile di posisi existing sebagai elemen terpisah
- tambah styling desktop khusus untuk prompt ketika berada di dalam sidebar:
  - non-fixed
  - width otomatis mengikuti sidebar
  - berada di bagian bawah dengan jarak/padding yang rapi
- jaga agar prompt auth/top tidak ikut berubah

## Verifikasi

- mobile: prompt bottom tetap muncul di atas bottom nav
- desktop: prompt muncul di bawah sidebar, bukan floating di viewport
- `pnpm lint` sukses
- `pnpm build` sukses

## Catatan

- Tidak dibuat commit karena user belum meminta commit untuk task ini
