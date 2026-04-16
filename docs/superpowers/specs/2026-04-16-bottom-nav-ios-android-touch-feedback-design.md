# Bottom Nav iOS Android Touch Feedback Design

## Latar Belakang

Bottom nav di `fe/src/layouts/mobile-shell.tsx` sebelumnya diberi suppression touch feedback secara umum pada `.mobile-shell__tab-link`. Perubahan itu berhasil menghilangkan highlight kotak di Android, tetapi juga membuat iOS kehilangan highlight sentuh bawaannya yang sebelumnya masih sesuai bentuk tab.

## Tujuan

- Android tetap tidak menampilkan highlight kotak pada bottom nav.
- iOS kembali menampilkan highlight sentuh bawaan yang mengikuti bentuk tab.
- Active route state pada bottom nav tetap sama.
- Scope perubahan tetap lokal pada bottom nav.

## Pendekatan yang Dipilih

Memindahkan suppression touch feedback dari selector umum bottom nav ke class Android-only yang diterapkan pada item bottom nav ketika device bukan iOS.

## Opsi yang Dipertimbangkan

### 1. Scope Android-only lewat class di komponen

Pendekatan ini dipilih karena paling eksplisit dan paling aman untuk membedakan iOS dan Android tanpa mengandalkan media query yang mengenai keduanya.

### 2. Scope lewat media query touch/coarse pointer

Pendekatan ini tidak dipilih karena iOS dan Android sama-sama masuk kategori coarse pointer, sehingga tidak cukup spesifik.

### 3. Menghapus semua suppression touch feedback

Pendekatan ini ditolak karena akan membuka kembali masalah Android yang sebelumnya sudah terselesaikan.

## Perubahan Teknis

- Tambahkan flag/class Android-only pada item `NavLink` bottom nav di `MobileShell`.
- Pindahkan `-webkit-tap-highlight-color`, `-webkit-touch-callout`, `touch-action`, dan override state touch dari `.mobile-shell__tab-link` umum ke class Android-only.
- Pertahankan class active route dan styling visual bottom nav yang sekarang.

## Dampak dan Risiko

- Android/WebView: highlight kotak tetap hilang.
- iOS: highlight sentuh bawaan kembali muncul.
- Desktop: tidak ada perubahan perilaku yang diharapkan.

Risiko utama hanya pada penentuan platform. Untuk meminimalkan risiko, implementasi mengikuti util deteksi iOS yang sudah dipakai di frontend, bukan logika baru.

## Verifikasi

- Jalankan `pnpm typecheck` karena ada perubahan frontend.
- Verifikasi manual di Android bahwa highlight kotak bottom nav tetap hilang.
- Verifikasi manual di iOS bahwa highlight sentuh bottom nav muncul lagi.
- Pastikan active route state bottom nav tidak berubah.
