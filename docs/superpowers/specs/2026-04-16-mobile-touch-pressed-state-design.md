# Mobile Touch Pressed State Design

## Latar Belakang

Saat ini feedback sentuh pada komponen yang bisa diklik di aplikasi belum konsisten. Beberapa komponen masih memakai highlight bawaan browser, sebagian lain sudah diberi penanganan khusus, dan hasilnya berbeda antara Android dan iOS. Kebutuhan tahap ini adalah menyamakan pressed state agar terasa lebih rapi dan konsisten di mobile touch.

## Tujuan

- Menyamakan feedback sentuh pada komponen interaktif utama di mobile touch.
- Mengganti highlight bawaan browser yang kurang rapi dengan pressed state custom.
- Mempertahankan active state, focus state, dan visual permanen yang sudah dipakai aplikasi.
- Membatasi scope ke halaman aplikasi utama, bukan landing/marketing atau desktop-only.

## Scope Tahap Pertama

### Masuk scope

- Bottom nav.
- Tombol aksi utama seperti `View all`, quick actions, submit button, button modal, dan aksi utama di settings/family yang sudah tampil sebagai button atau pill action.
- Clickable row/card yang berfungsi sebagai aksi utama di halaman aplikasi.

### Di luar scope

- Halaman landing/marketing.
- Elemen desktop-only.
- Input, select, textarea.
- Link teks biasa di paragraf.
- Komponen admin yang belum disinggung, kecuali ternyata berbagi selector yang sama dengan komponen dalam scope.

## Pendekatan yang Dipilih

Menambahkan pola pressed state custom yang aktif hanya untuk mobile touch pada selector komponen interaktif utama yang sudah ada. Pola ini memberi background tipis mengikuti radius komponen, sedikit scale saat ditekan, dan transisi singkat, sambil mematikan highlight bawaan browser pada komponen dalam scope.

## Opsi yang Dipertimbangkan

### 1. Pola global terbatas untuk komponen utama di app

Pendekatan ini dipilih karena memberi konsistensi lintas komponen tanpa harus menyentuh seluruh frontend sekaligus.

### 2. Perbaikan satu per satu per komponen

Pendekatan ini tidak dipilih karena lambat, rawan tidak konsisten, dan akan menghasilkan banyak variasi style sentuh.

### 3. Utility class baru yang ditempel manual ke semua komponen

Pendekatan ini juga tidak dipilih untuk tahap ini karena membutuhkan banyak perubahan JSX dan berisiko ada komponen yang terlewat.

## Perubahan Teknis

- Gunakan media query mobile touch seperti `@media (hover: none) and (pointer: coarse)`.
- Tambahkan pressed state custom pada selector komponen dalam scope.
- Pressed state terdiri dari:
  - background tipis/transparan mengikuti `border-radius`
  - sedikit `transform: scale(...)`
  - transisi singkat
- Matikan highlight bawaan browser hanya pada komponen yang masuk scope.
- Jangan ubah state active/focus permanen yang sudah dipakai aplikasi.

## Dampak dan Risiko

- Mobile touch: feedback sentuh menjadi seragam dan lebih rapi.
- Desktop: tidak ada perubahan yang diharapkan.
- Risiko utama adalah perubahan terasa terlalu luas jika selector yang dipilih terlalu umum. Karena itu implementasi harus memakai selector yang sudah dipakai komponen aplikasi, bukan rule global untuk semua `button` atau `a`.

## Verifikasi

- Jalankan `pnpm typecheck` setelah perubahan frontend.
- Verifikasi manual di Android dan iOS pada komponen dalam scope bahwa:
  - pressed state tampil seragam
  - background tipis mengikuti radius komponen
  - sedikit scale muncul saat ditekan
  - active state permanen tidak berubah
- Pastikan desktop tidak berubah.
