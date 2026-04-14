# Root Dev Script Design

**Tanggal:** 2026-04-15

## Tujuan

Menambahkan satu script di root repo untuk menjalankan frontend dan backend mode development secara bersamaan dari satu command.

## Kebutuhan Utama

- cukup satu entry point dari root repo
- backend tetap memakai flow existing melalui `be/run.sh`
- frontend tetap memakai `pnpm dev` di folder `fe`
- saat user menekan `Ctrl+C`, kedua proses ikut berhenti dengan rapi
- tidak menambah dependency baru dan tidak mengubah flow deploy

## Pendekatan yang Dipilih

Dipilih pendekatan `dev.sh` di root repo sebagai wrapper tipis untuk dua flow yang sudah ada. Script ini hanya bertugas memvalidasi dependency minimum, menjalankan backend dan frontend di background, lalu menangani cleanup process saat script dihentikan.

## Alternatif yang Dipertimbangkan

1. Root `package.json`

Pendekatan ini ditolak karena repo saat ini belum memakai root Node workspace dan kebutuhan sekarang belum cukup untuk menambah struktur baru.

2. Docker Compose untuk dev

Pendekatan ini ditolak karena terlalu berat untuk kebutuhan local development cepat dan akan mencampur flow dev dengan flow deploy yang saat ini sudah dipisah.

## Scope Perubahan

- tambah file `dev.sh` di root repo
- jalankan `be/run.sh` untuk backend
- jalankan `pnpm dev` di `fe/` untuk frontend
- tambahkan validasi dependency dasar: `go`, `pnpm`, dan `be/.env`
- tambahkan trap cleanup agar kedua proses mati saat script dihentikan

## Detail Behavior

- script dijalankan dari root repo
- bila dependency penting tidak tersedia, script gagal lebih awal dengan pesan yang jelas
- backend dan frontend dijalankan paralel di background
- script menunggu kedua child process dan meneruskan shutdown ke keduanya saat menerima `INT` atau `TERM`

## Verifikasi

- `bash -n dev.sh` sukses
- script dapat dijalankan dari root repo tanpa error syntax
- `Ctrl+C` menghentikan proses frontend dan backend tanpa menyisakan child process dari script

## Catatan

- Tidak dibuat commit karena user belum meminta commit
- Tidak menambah test file karena user tidak meminta test dan perubahan ini cukup diverifikasi lewat syntax check dan run manual
