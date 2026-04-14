# Landing Alternating Section Colors Design

**Tanggal:** 2026-04-15

## Tujuan

Memperbaiki warna selang-seling section landing page agar area di antara hero dan footer memiliki ritme visual yang lebih jelas, tanpa mengubah hero dan footer.

## Scope

- hanya section landing di tengah halaman
- hero tetap memakai style existing
- footer tetap memakai style existing
- urutan warna menjadi `putih -> krem lembut -> putih -> krem lembut -> putih`

## Section yang Terdampak

- `Fitur Unggulan`
- `Cara Kerja`
- `Pricing`
- `FAQ`
- `Final CTA`

## Pendekatan yang Dipilih

Perubahan dilakukan di level CSS landing section agar scope tetap kecil. Warna background akan diatur berdasarkan posisi section landing setelah hero, tanpa menambah modifier class baru di JSX selama belum diperlukan.

## Alternatif yang Dipertimbangkan

1. Set warna satu per satu per section

Pendekatan ini ditolak karena lebih verbose dan lebih rapuh jika urutan section berubah lagi.

2. Tambah modifier class baru di setiap section

Pendekatan ini ditolak karena terlalu berat untuk kebutuhan styling sederhana.

## Arah Implementasi

- gunakan selector CSS untuk section landing non-hero dan non-footer
- jadikan `Fitur`, `Pricing`, dan `Final CTA` berlatar putih
- jadikan `Cara Kerja` dan `FAQ` berlatar krem lembut
- pertahankan border, spacing, dan card internal yang sudah ada

## Verifikasi

- hero tidak berubah warna
- footer tidak berubah warna
- section tengah tampil selang-seling dengan ritme yang jelas
- `pnpm lint` sukses
- `pnpm build` sukses

## Catatan

- Tidak dibuat commit karena user belum meminta commit untuk task ini
