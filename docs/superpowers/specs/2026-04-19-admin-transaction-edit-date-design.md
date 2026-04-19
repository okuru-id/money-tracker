# Admin Transaction Edit Date Design

## Latar Belakang

Halaman admin pada menu transaction sudah memiliki aksi edit, tetapi modal edit saat ini hanya mengirim perubahan `amount` dan `note`. Akibatnya admin belum bisa mengubah tanggal transaksi dari alur admin, baik pada desktop maupun mobile view.

## Tujuan

- Menambahkan kemampuan edit `transaction_date` pada modal edit transaksi admin.
- Memastikan perubahan berlaku untuk desktop dan mobile view tanpa membuat alur edit terpisah.
- Menjaga scope tetap kecil dengan memanfaatkan endpoint backend yang sudah ada.

## Scope

### Masuk scope

- Tambah field input tanggal pada modal edit transaksi admin.
- Isi default tanggal dari data transaksi yang sedang diedit.
- Kirim `transaction_date` ke API admin saat submit.
- Pastikan alur yang sama bekerja dari desktop table dan mobile card action.

### Di luar scope

- Perubahan backend.
- Menambah field edit lain seperti kategori, bank account, type, atau wallet owner.
- Refactor shared form antara admin dan history.

## Pendekatan yang Dipilih

Memperluas modal edit transaksi admin yang sudah ada dengan satu field `type="date"`, lalu mengirim `transaction_date` bersama payload edit yang sudah ada. Pendekatan ini paling kecil karena admin desktop dan mobile sama-sama membuka modal yang sama, dan backend sudah menerima field tanggal.

## Opsi yang Dipertimbangkan

### 1. Tambah field tanggal pada modal edit admin yang sudah ada

Pendekatan ini dipilih karena perubahan kecil, langsung menyelesaikan kebutuhan, dan tidak mengubah struktur alur edit yang sudah dipakai oleh desktop maupun mobile.

### 2. Menyamakan penuh editor admin dengan halaman history

Pendekatan ini tidak dipilih karena scope melebar ke category dan bank account, padahal kebutuhan saat ini hanya tanggal.

### 3. Membuat komponen editor transaksi shared baru

Pendekatan ini tidak dipilih untuk tahap ini karena biaya perubahan lebih besar daripada manfaat kebutuhan sekarang.

## Perubahan Teknis

- Ubah modal edit transaksi di `fe/src/features/admin/pages/admin-page.tsx`.
- Tambahkan input `type="date"` dengan `name="transaction_date"`.
- Gunakan nilai awal dari `editingTransaction.transaction_date` dalam format yang cocok untuk input tanggal.
- Saat submit, baca field tanggal dari `FormData` dan kirim sebagai `transaction_date` ke `updateTransactionAdmin()` bersama `amount` dan `note`.
- Pertahankan penggunaan modal dan mutation yang sama agar desktop dan mobile tetap berbagi alur edit yang identik.

## Dampak dan Risiko

- Desktop dan mobile admin akan sama-sama mendapat kemampuan edit tanggal.
- Risiko utama adalah format tanggal dari data list tidak cocok untuk input date browser. Implementasi harus memastikan nilai default yang dikirim ke input tetap berbentuk `YYYY-MM-DD`.
- Karena backend tidak diubah, risiko regresi dipusatkan di frontend admin saja.

## Verifikasi

- Jalankan `pnpm typecheck` di `fe/`.
- Verifikasi manual bahwa modal edit transaksi admin di desktop menampilkan field tanggal dan dapat menyimpan perubahan tanggal.
- Verifikasi manual bahwa aksi edit transaksi admin di mobile card juga menampilkan field tanggal dan dapat menyimpan perubahan tanggal.
- Pastikan edit `amount` dan `note` tetap berfungsi.
