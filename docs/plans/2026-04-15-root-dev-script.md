# Root Dev Script Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Menambahkan `dev.sh` di root repo agar frontend dan backend bisa dijalankan bersama untuk local development.

**Architecture:** Implementasi dibatasi ke satu shell script baru di root repo. Script akan menjadi wrapper kecil yang memanggil `be/run.sh` untuk backend dan `pnpm dev` di folder `fe`, dengan guard clause untuk dependency minimum dan trap cleanup untuk menghentikan semua child process saat user menghentikan script.

**Tech Stack:** Bash, Go toolchain existing project, pnpm 10, Vite dev server, backend runner existing project

---

### Task 1: Tambah root wrapper untuk FE dan BE dev

**Files:**
- Create: `dev.sh`
- Review: `be/run.sh`
- Review: `fe/package.json`

**Step 1: Tulis struktur script dan path dasar**

- set `set -euo pipefail`
- hitung `SCRIPT_DIR`, `BACKEND_DIR`, `FRONTEND_DIR`, dan `BACKEND_RUNNER`
- gunakan path absolut relatif ke root repo agar script stabil dijalankan dari lokasi mana pun

**Step 2: Tambah validasi dependency minimum**

- cek `go` ada di `PATH`
- cek `pnpm` ada di `PATH`
- cek file `be/.env` tersedia karena `be/run.sh` membutuhkannya
- cek file `be/run.sh` tersedia dan executable bila perlu

**Step 3: Jalankan backend dan frontend paralel**

- jalankan backend via `"$BACKEND_RUNNER"` di background
- jalankan frontend via `pnpm dev` dengan `workdir` `fe/` di background
- simpan PID keduanya untuk shutdown handling

**Step 4: Tambah trap cleanup**

- buat fungsi `cleanup()` untuk mengirim `TERM` ke kedua PID bila masih hidup
- pasang `trap cleanup INT TERM EXIT`
- hindari error saat salah satu proses sudah selesai lebih dulu

**Step 5: Tampilkan informasi startup singkat**

- tampilkan bahwa backend dan frontend sedang dijalankan
- tampilkan PID kedua proses agar mudah ditelusuri bila ada masalah

### Task 2: Pastikan script aman untuk penggunaan sehari-hari

**Files:**
- Modify: `dev.sh`

**Step 1: Atur wait logic**

- tunggu kedua child process agar shell utama tidak langsung selesai
- bila salah satu proses berhenti, cleanup tetap dijalankan untuk proses lainnya

**Step 2: Pastikan exit behavior rapi**

- jangan biarkan `kill` gagal membuat cleanup rusak
- pastikan `EXIT` trap tidak spam error saat PID sudah mati

**Step 3: Buat pesan error singkat dan jelas**

- gunakan format pesan konsisten untuk dependency yang hilang atau file yang tidak ditemukan

### Task 3: Verifikasi perubahan

**Files:**
- Review: `dev.sh`
- Review: `docs/plans/2026-04-15-root-dev-script-design.md`
- Review: `docs/plans/2026-04-15-root-dev-script.md`

**Step 1: Verifikasi syntax script**

Run: `bash -n dev.sh`
Expected: sukses tanpa output error

**Step 2: Verifikasi perubahan file**

Run: `git diff -- docs/plans/2026-04-15-root-dev-script-design.md docs/plans/2026-04-15-root-dev-script.md dev.sh`
Expected: diff hanya menunjukkan dua dokumen plan baru dan satu script root baru

**Step 3: Verifikasi run manual**

Run: `./dev.sh`
Expected: backend dan frontend start dari root repo, lalu `Ctrl+C` menghentikan keduanya dengan rapi

## Catatan Eksekusi

- Tidak menambah atau mengubah test file karena user tidak meminta test
- Tidak membuat commit karena user belum meminta commit
