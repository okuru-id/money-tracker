# Root Landing Compact Design

**Tanggal:** 2026-04-12

## Tujuan

Menyederhanakan landing page `/` agar lebih dekat dengan referensi yang diberikan user: lebih sedikit section, copy lebih padat, dan fokus pada satu alur komunikasi yang jelas untuk produk money tracker / dompetku.id.

## Masalah yang Diselesaikan

Landing page saat ini terlalu penuh. Terlalu banyak section dengan pesan yang saling berdekatan membuat halaman terasa berat dibaca dan tidak punya ritme yang sebersih referensi. Masalah utama bukan hanya copy yang panjang, tetapi juga struktur section yang berlebihan.

Saat user membuka page, mereka seharusnya cepat memahami:

- produk ini untuk apa
- siapa yang cocok menggunakannya
- manfaat utamanya apa
- bagaimana mulai mencobanya

## Scope

- Mengurangi jumlah section landing secara signifikan
- Menulis ulang copy agar lebih singkat dan relevan dengan money tracker / dompetku.id
- Mempertahankan hero visual yang sudah ada jika masih relevan
- Menjaga halaman tetap responsif dan modern
- Tidak menambah dependency baru

## Struktur Baru

### 1. Hero

- brand + nav ringkas
- headline utama besar
- subheadline singkat
- dua CTA
- satu visual dashboard utama

Hero tetap menjadi anchor utama, tetapi copy dibuat lebih sederhana dan langsung ke value proposition inti.

### 2. Social proof + short quote

- trusted logos ringan
- satu quote / testimonial singkat

Tujuannya memberi jeda visual setelah hero tanpa membuat user harus membaca terlalu banyak.

### 3. Product showcase utama

- satu section besar seperti referensi
- satu heading yang menjelaskan manfaat inti produk
- segmented labels / tab-like pills untuk kategori capability
- satu panel showcase utama dengan 2-3 poin manfaat yang relevan

Fokus capability yang paling relevan untuk money tracker:

- catat transaksi cepat
- lihat saldo dan arus kas dengan jelas
- pantau keuangan keluarga / multi-akun dengan rapi

### 4. Closing CTA

- satu ajakan mulai menggunakan produk
- copy jauh lebih singkat dari sekarang
- CTA utama + sekunder

### 5. Footer

- tetap dark
- lebih ringkas dan bersih

## Section yang Dihapus / Digabung

Section berikut tidak berdiri sendiri lagi:

- feature grid
- precision
- transfer
- efficiency
- testimonial (digabung ke social proof ringan)
- stats

Semua informasi yang masih penting dipindahkan ke showcase utama atau ke hero/social proof.

## Prinsip Copy

- satu section = satu pesan utama
- hindari jargon generik seperti growth, asset safety, operations bila tidak benar-benar membantu user memahami produk
- gunakan bahasa yang lebih relevan untuk produk pencatatan keuangan keluarga dan personal cashflow
- lebih sedikit angka dekoratif yang tidak punya konteks nyata

## Dampak Implementasi

- perubahan utama di `fe/src/features/landing/pages/landing-page.tsx`
- style akan ikut disederhanakan di `fe/src/styles/global.css`
- kemungkinan banyak class lama tidak terpakai lagi setelah section dipangkas

## Verifikasi

- landing page terasa lebih ringan dibaca
- jumlah section jauh lebih sedikit
- pesan produk lebih cepat dipahami pada first screen dan dua scroll berikutnya
- `pnpm build`

## Catatan

- Dokumen ini menjadi arah redesign baru yang menggantikan iterasi landing yang terlalu padat
- Tidak dibuat commit karena user belum meminta commit
