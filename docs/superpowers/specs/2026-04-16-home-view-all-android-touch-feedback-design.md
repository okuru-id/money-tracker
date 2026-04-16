# Home View All Android Touch Feedback Design

## Latar Belakang

Di halaman home, tombol `View all` pada section recent transactions memakai selector `button.home-recent__link` di `fe/src/features/home/pages/home-page.tsx`. Di iOS, feedback sentuh mengikuti bentuk pill tombol. Di Android, feedback sentuh bawaan terlihat mengotak sehingga tampak seperti efek link/browser default dan tidak sesuai dengan bentuk tombol.

## Tujuan

- Menghilangkan feedback sentuh bawaan Android yang tampil kotak pada tombol `View all`.
- Mempertahankan bentuk pill, warna, dan perilaku tombol yang sekarang.
- Membatasi perubahan hanya pada tombol `View all` agar risiko regresi kecil.

## Pendekatan yang Dipilih

Menambahkan styling touch/focus khusus pada `.home-recent__link` untuk device touch agar feedback bawaan Android tidak menimpa bentuk visual tombol.

## Opsi yang Dipertimbangkan

### 1. Scope lokal pada `.home-recent__link`

Pendekatan ini dipilih karena paling kecil dan langsung menyasar komponen yang dilaporkan bermasalah.

### 2. Scope ke semua tombol pill di home

Pendekatan ini tidak dipilih untuk sekarang karena memperlebar perubahan ke elemen lain yang belum terbukti bermasalah.

### 3. Scope global ke semua button pada device touch

Pendekatan ini ditolak karena terlalu luas dan berisiko mengubah feedback sentuh komponen lain secara tidak perlu.

## Perubahan Teknis

- Tambahkan `-webkit-tap-highlight-color: transparent` pada `.home-recent__link`.
- Tambahkan rule touch-specific untuk menetralkan `outline`, `box-shadow`, atau feedback bawaan yang tampil kotak pada state `:focus`, `:focus-visible`, dan `:active` bila diperlukan.
- Tidak mengubah struktur JSX `HomePage` karena masalah ada pada styling touch browser, bukan markup.

## Dampak dan Risiko

- Android/WebView: feedback kotak bawaan saat tombol disentuh hilang.
- iOS: bentuk pill tetap konsisten.
- Desktop: tidak ada perubahan perilaku klik yang diharapkan.

Risiko utama hanya jika tombol ini membutuhkan feedback sentuh tambahan untuk accessibility. Untuk saat ini, perubahan dibatasi ke state touch pada device coarse pointer agar impact tetap kecil.

## Verifikasi

- Jalankan `pnpm typecheck` karena ada perubahan frontend.
- Verifikasi manual di Android bahwa tombol `View all` tidak lagi menampilkan feedback kotak saat ditekan.
- Pastikan bentuk pill dan warna tombol tetap sama di iOS dan Android.
