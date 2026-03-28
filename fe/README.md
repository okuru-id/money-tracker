# Money Tracker Frontend (E2E Local Setup)

Panduan ini untuk menjalankan backend (`/opt/deploy/money-tracker/be`) dan frontend (`/opt/deploy/money-tracker/fe`) secara lokal end-to-end.

## Prasyarat

- Node.js 20+ dan `pnpm` 10+
- Docker + Docker Compose (direkomendasikan untuk backend)
- Go 1.21+ (hanya jika menjalankan backend tanpa container)

## 1) Jalankan Backend (repo terpisah: `/opt/deploy/money-tracker/be`)

### Opsi A (direkomendasikan): Full Docker Compose

```bash
cd /opt/deploy/money-tracker/be
cp .env.example .env
docker compose up --build
```

Backend akan tersedia di `http://localhost:8081`.

### Opsi B: Server Go lokal (DB/Redis dari Docker)

```bash
cd /opt/deploy/money-tracker/be
cp .env.example .env
docker compose up -d postgres redis
atlas migrate apply --env local
go run ./cmd/server
```

## 2) Setup Environment Frontend (`/opt/deploy/money-tracker/fe`)

```bash
cd /opt/deploy/money-tracker/fe
cp apps/web/.env.example apps/web/.env
```

Nilai default lokal:

- `VITE_API_BASE_URL=http://localhost:8081/api`
- `VITE_APP_BASE_URL=http://localhost:5173`

## 3) Install Dependencies dan Jalankan Frontend

```bash
cd /opt/deploy/money-tracker/fe
corepack pnpm install
corepack pnpm --filter @money-tracker/web dev --host
```

Frontend dev server default: `http://localhost:5173`.

## 4) Validasi Cepat E2E

Pastikan:

1. Backend sehat di `http://localhost:8081`.
2. Frontend terbuka di `http://localhost:5173`.
3. Register/login berhasil dari UI.
4. Create family, generate invite, join dari akun kedua berhasil.
5. Tambah transaksi dari tab Add berhasil dan ringkasan keluarga ikut berubah.

## 5) Quality Commands (Frontend Repo)

Jalankan dari `/opt/deploy/money-tracker/fe`:

```bash
corepack pnpm --filter @money-tracker/web lint
corepack pnpm -r typecheck
corepack pnpm -r build
```

## KPI Check Singkat: Add Flow < 15 Detik

1. Buka tab `Add`.
2. Siapkan stopwatch.
3. Mulai hitung saat user fokus di input amount.
4. Lakukan alur tipikal: `amount -> category -> submit`.
5. Stop saat toast sukses muncul.

Lulus jika mayoritas percobaan (mis. 8 dari 10) selesai < 15 detik di kondisi jaringan lokal stabil.
