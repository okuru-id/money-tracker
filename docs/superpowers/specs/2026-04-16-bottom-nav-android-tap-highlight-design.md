# Bottom Nav Android Tap Highlight Design

## Latar Belakang

Bottom navigation di `fe/src/layouts/mobile-shell.tsx` memakai `NavLink` untuk setiap tab. Di Android, saat tab ditekan muncul tap highlight bawaan browser/WebView yang terlihat seperti hover link. Di iOS perilaku ini tidak terlihat bermasalah.

## Tujuan

- Menghilangkan tap highlight bawaan Android pada item bottom nav.
- Mempertahankan active state route yang sudah ada.
- Membatasi perubahan hanya pada bottom nav agar risiko regresi kecil.

## Pendekatan yang Dipilih

Menambahkan styling khusus pada elemen link bottom nav untuk mematikan tap highlight bawaan WebKit/Android, dengan fokus pada `.mobile-shell__tab-link` dan area turunannya bila diperlukan.

## Opsi yang Dipertimbangkan

### 1. Scope lokal di bottom nav

Pendekatan ini paling kecil dan paling aman. Bug yang dilaporkan hanya terjadi di bottom nav, jadi styling cukup ditempatkan di selector komponen tersebut.

### 2. Scope global untuk semua elemen interaktif

Pendekatan ini ditolak karena terlalu luas. Walau bisa menghilangkan highlight di banyak tempat, perubahan akan memengaruhi komponen lain yang tidak sedang bermasalah.

### 3. Ganti dengan feedback sentuh custom

Pendekatan ini juga tidak dipilih untuk sekarang karena membutuhkan desain interaksi tambahan dan berisiko bertabrakan dengan route active state yang sudah ada.

## Perubahan Teknis

- Tambahkan `-webkit-tap-highlight-color: transparent` pada `.mobile-shell__tab-link`.
- Jika masih ada highlight di area ikon, tambahkan properti yang sama pada `.mobile-shell__tab-icon`.
- Tidak mengubah struktur JSX `MobileShell` karena masalah ada pada perilaku styling browser, bukan markup atau routing.

## Dampak dan Risiko

- Android/WebView: tap highlight bawaan hilang pada bottom nav.
- iOS: tidak ada perubahan visual yang diharapkan.
- Desktop: tidak ada perubahan perilaku klik/hover yang diharapkan.

Risiko utama hanya bila ada kebutuhan accessibility terhadap feedback sentuh tambahan. Untuk saat ini, active route state tetap tersedia sehingga navigasi masih punya indikator visual setelah perpindahan halaman.

## Verifikasi

- Jalankan `pnpm typecheck` karena ada perubahan frontend.
- Verifikasi manual di Android bahwa tap pada setiap item bottom nav tidak lagi menampilkan highlight bawaan browser.
- Pastikan tab aktif tetap memakai style active yang sekarang.
