# Desktop Add FAB Design

**Tanggal:** 2026-04-15

## Tujuan

Mengubah akses utama `Add` pada desktop dari item sidebar kiri menjadi tombol mengambang di kanan bawah, sambil mempertahankan tab `Add` existing pada mobile.

## Kondisi Saat Ini

- `Add` saat ini didefinisikan sebagai tab featured di `fe/src/layouts/mobile-shell.tsx`
- pada mobile, tab ini menjadi tombol tengah pada bottom navigation
- pada desktop, tab yang sama ikut muncul di sidebar kiri karena layout nav berubah menjadi kolom vertikal

## Pendekatan yang Dipilih

Gunakan render FAB desktop terpisah di `MobileShell`, lalu sembunyikan item nav `Add` khusus desktop melalui media query. Dengan pendekatan ini, perilaku mobile tetap utuh dan perubahan logic React tetap kecil.

## Alternatif yang Dipertimbangkan

1. Menghapus tab `Add` dari data navigasi dan membuat branching React berdasarkan viewport.

Ditolak karena butuh logic viewport tambahan di komponen, padahal kebutuhan ini bisa diselesaikan lewat struktur render sederhana dan CSS desktop.

2. Membiarkan `Add` tetap di sidebar lalu menambah FAB desktop.

Ditolak karena menghasilkan dua entry point untuk aksi yang sama pada desktop.

## Arah Implementasi

- tetap pertahankan `Add` di array tab agar mobile tidak berubah
- render `NavLink` baru untuk FAB desktop hanya ketika user punya family
- sembunyikan `.mobile-shell__tab-link--featured` pada breakpoint desktop
- tambahkan styling FAB desktop agar berada di kanan bawah dan memiliki state aktif saat route `/add` terbuka
- tambah ruang bawah konten desktop agar FAB tidak menutupi area scroll terakhir

## Verifikasi

- mobile: tab `Add` tengah tetap muncul seperti sebelumnya
- desktop: item `Add` tidak lagi muncul di sidebar kiri
- desktop: FAB `Add` muncul di kanan bawah dan membuka `/add`
- `pnpm typecheck` sukses

## Catatan

- Tidak menambah atau mengubah test file karena user tidak meminta test
- Tidak membuat commit karena user belum meminta commit
