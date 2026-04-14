# Root Landing Navbar Width Design

**Tanggal:** 2026-04-12

## Tujuan

Membuat navbar hero terasa sedikit lebih lebar tanpa mengubah ritme vertikal atau membuatnya tampak lebih berat.

## Arah Perubahan

- lebar maksimum `landing-navbar` dinaikkan sedikit dari ukuran sekarang
- padding internal tetap dipertahankan agar perubahan terasa sebagai pelebaran horizontal, bukan pembesaran komponen
- perubahan dibatasi pada navbar landing hero saja

## Verifikasi

- navbar terasa lebih panjang di desktop
- proporsi hero tetap rapi
- `pnpm build` sukses

## Catatan

- Tidak dibuat commit karena user belum meminta commit
