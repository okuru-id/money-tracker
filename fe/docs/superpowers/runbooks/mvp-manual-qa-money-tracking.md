# MVP Manual QA Runbook - Money Tracking

Runbook ini mengikuti skenario manual QA pada spec MVP money tracking (auth, family invite, transaksi, history, retry, KPI Add flow, dan install prompt PWA). Akses fitur family sekarang masuk lewat `Settings > Family Management`, bukan lagi tab `Family` di bottom nav.

## Scope

- Register/login success dan failure path
- Invite generation, invite acceptance, dan family join
- Submit transaksi dan verifikasi update family summary
- Filter history (`today`, `week`, `month`)
- Simulasi network failure saat submit + retry
- Verifikasi KPI Add flow `< 15s`
- Verifikasi prompt install PWA pada browser yang mendukung

## Prasyarat

1. Backend jalan di `http://localhost:8081`.
2. Frontend jalan di `http://localhost:5173`.
3. `.env` sudah mengarah ke backend lokal.
4. Siapkan 2 akun untuk uji family (`member-a`, `member-b`).
5. Pastikan bottom nav menampilkan `Home`, `History`, `Add`, `Insights`, dan `Settings`.
6. Gunakan browser Chromium yang mendukung event `beforeinstallprompt` dan buka app dalam mode tab biasa (bukan PWA yang sudah terpasang).

## Data Uji Rekomendasi

- Family name: `Keluarga QA`
- Expense category: kategori default pengeluaran
- Income category: kategori default pemasukan
- Nominal contoh: `50000`, `125000`

## Skenario Manual QA

### QA-01 Register/Login (Success + Failure)

Langkah:

1. Register `member-a` dengan email baru dan password valid.
2. Logout, lalu login ulang dengan kredensial benar.
3. Coba login dengan password salah.

Ekspektasi:

- Register sukses dan user masuk sesi aktif.
- Login dengan kredensial benar sukses.
- Login gagal menampilkan error yang jelas tanpa crash UI.

### QA-02 Family Invite dan Join

Langkah:

1. Login sebagai `member-a`, buat family baru.
2. Buka tab `Settings`, masuk ke `Family Management`, lalu generate invite token.
3. Login sebagai `member-b`, gunakan token invite untuk join.
4. Kembali ke akun `member-a` dan refresh halaman `Settings > Family Management`.

Ekspektasi:

- Token invite berhasil dibuat.
- `member-b` berhasil join family yang sama.
- Daftar member memperlihatkan kedua akun.

### QA-03 Submit Transaction dan Update Family Summary

Langkah:

1. Login `member-a`, buka tab Add.
2. Input transaksi expense (contoh `50000`) dan submit.
3. Buka Home atau `Settings > Family Management` untuk melihat ringkasan keluarga.

Ekspektasi:

- Submit sukses menampilkan feedback (toast/snackbar).
- Transaksi masuk ke history milik `member-a`.
- Family summary berubah sesuai transaksi baru (target freshness <= 2 detik).

### QA-04 History Filter Today/Week/Month

Langkah:

1. Buka tab History sebagai `member-a`.
2. Ganti filter ke `today`, `week`, lalu `month`.
3. Cek apakah daftar transaksi berubah sesuai rentang waktu.

Ekspektasi:

- Setiap filter mengembalikan data yang konsisten.
- Tidak ada transaksi akun lain yang muncul.

### QA-05 Network Failure on Submit + Retry

Langkah:

1. Buka tab Add, isi form transaksi.
2. Simulasikan gagal jaringan (matikan backend sementara atau blok request via DevTools).
3. Tekan submit dan verifikasi kondisi gagal.
4. Pulihkan koneksi/backend, tekan `Retry`.

Ekspektasi:

- Saat gagal, form tetap terisi (tidak hilang).
- Error ditampilkan jelas.
- `Retry` berhasil submit tanpa perlu isi ulang manual.

### QA-06 KPI Add Flow < 15 Detik

Langkah pengukuran singkat:

1. Siapkan stopwatch (HP/DevTools timer).
2. Mulai timer saat kursor aktif di input amount pada tab Add.
3. Jalankan alur tipikal: `amount -> category -> submit`.
4. Stop timer saat toast sukses muncul.
5. Ulangi 10 kali pada data nominal/category umum.

Kriteria lulus:

- Minimal 8/10 percobaan selesai `< 15 detik`.
- Jika gagal, catat titik lambat (mis. pemilihan kategori, loading API, atau feedback submit).

Template log cepat:

```text
Run # | Durasi (detik) | Lulus/Gagal | Catatan
1     | 12.4           | Lulus       | -
2     | 16.1           | Gagal       | Delay setelah submit
```

### QA-07 PWA Install Prompt

Langkah:

1. Buka app di browser Chromium pada tab biasa, lalu pastikan app memenuhi syarat installable.
2. Verifikasi prompt install muncul di area bawah layar tanpa menutupi bottom nav.
3. Klik `Nanti`, lalu pastikan prompt hilang.
4. Reload tab yang sama dan verifikasi prompt tetap tersembunyi untuk sesi aktif.
5. Buka tab baru ke app yang sama, lalu verifikasi prompt bisa muncul lagi saat app masih installable.
6. Klik `Install` dan pastikan browser menampilkan native install prompt.
7. Selesaikan install dari native prompt, lalu verifikasi banner install hilang otomatis.
8. Trigger toast transaksi setelah itu untuk memastikan posisi prompt/toast tidak saling menimpa saat prompt tampil atau setelah install selesai.

Ekspektasi:

- Prompt hanya muncul saat app installable dan belum di-dismiss pada sesi/tab aktif.
- Aksi `Nanti` menyembunyikan prompt sampai tab aktif ditutup.
- Reload pada tab yang sama tidak memunculkan ulang prompt.
- Tab baru dapat menampilkan prompt lagi karena dismissal hanya berlaku per sesi/tab.
- Aksi `Install` memicu native browser install prompt.
- Setelah install sukses, prompt hilang otomatis.
- Prompt tidak menutupi bottom nav dan tidak bentrok dengan toast transaksi.

## Exit Criteria MVP Manual QA

- Semua skenario QA-01 s/d QA-05 pass.
- KPI QA-06 memenuhi ambang `< 15s` sesuai kriteria.
- QA-07 pass pada minimal satu browser Chromium yang mendukung install prompt.
- Tidak ada bug blocker pada auth, family join via `Settings > Family Management`, submit transaksi, refresh summary, dan install prompt PWA.
