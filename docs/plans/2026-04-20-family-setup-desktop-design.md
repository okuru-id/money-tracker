# Design: Desktop View untuk `/family/setup`

Tanggal: 2026-04-20

## Latar Belakang
Halaman `/family/setup` saat ini masih mengikuti layout mobile-first satu kolom. Pada desktop, area kosong menjadi terlalu banyak dan hierarchy visual kurang kuat. Dibutuhkan layout dua kolom agar onboarding terasa lebih seimbang dan informatif.

## Tujuan
- Menyediakan desktop layout dua kolom untuk halaman `/family/setup`
- Menjaga pengalaman mobile tetap sama
- Menambahkan aside kanan yang menampilkan ringkasan family setup dan tombol skip
- Mengikuti pola visual halaman desktop lain yang sudah ada di aplikasi

## Pendekatan Terpilih
Menggunakan pattern konsisten seperti halaman `add-page` dan `settings-page`:
- kolom kiri sebagai konten utama form setup family
- kolom kanan sebagai aside desktop
- aside hanya muncul pada breakpoint desktop
- mobile layout tetap single-column

## Struktur Layout
### Main column
Kolom kiri tetap menampilkan:
- heading onboarding
- deskripsi singkat
- form pembuatan family

### Aside column
Kolom kanan menampilkan:
- card ringkasan manfaat setup family
- penjelasan singkat bahwa family dipakai untuk berbagi transaksi dan pengaturan rumah tangga
- tombol skip sebagai secondary action

## Perubahan Teknis
### Komponen
File utama: `fe/src/features/family/pages/family-setup-page.tsx`

Perubahan yang direncanakan:
- bungkus konten utama dengan container desktop layout baru
- pisahkan area form dan area aside
- pindahkan tombol skip ke aside untuk desktop, sambil tetap menjaga UX mobile bila perlu

### CSS
File style: `fe/src/styles/global.css`

Tambahan style yang direncanakan:
- class layout desktop khusus family setup
- grid atau flex dua kolom pada breakpoint desktop
- style aside card mengikuti tone komponen yang sudah ada
- spacing dan max-width menyesuaikan halaman desktop lain

## Responsiveness
- Mobile dan tablet kecil tetap memakai layout existing
- Desktop memakai dua kolom
- Aside disembunyikan di viewport kecil

## Error Handling
Tidak ada perubahan logic API atau validasi form. Perubahan hanya pada presentasi UI.

## Verifikasi
Untuk perubahan frontend ini, verifikasi minimal:
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`

## Catatan
Perubahan ini fokus pada desktop presentation saja, tanpa mengubah alur onboarding atau behavior submit form.
