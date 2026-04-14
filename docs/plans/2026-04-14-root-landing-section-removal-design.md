# Root Landing Section Removal Design

**Tanggal:** 2026-04-14

## Tujuan

Menghapus empat section landing page yang tidak lagi dibutuhkan agar alur halaman lebih ringkas dan langsung menuju informasi inti produk.

## Section yang Dihapus

- `Masalah & Solusi`
- `Untuk Siapa?`
- `Keunggulan AI`
- `Tampilan Dashboard`

## Arah Perubahan

- hapus empat block section dari `fe/src/features/landing/pages/landing-page.tsx`
- rapikan urutan section tersisa menjadi `Hero -> Fitur Unggulan -> Cara Kerja -> Pricing -> FAQ -> CTA -> Footer`
- hapus konstanta data yang hanya dipakai oleh section yang dihapus
- hapus blok CSS yang hanya dipakai oleh section yang dihapus
- jangan ubah copy, behavior, atau dependency di section lain

## Pendekatan yang Dipilih

Perubahan dilakukan langsung pada file page landing dan stylesheet global yang sudah dipakai saat ini. Pendekatan ini menjaga scope tetap kecil, tidak menambah abstraction baru, dan memastikan codebase tidak menyisakan JSX, data, atau selector CSS yang sudah mati.

## Scope

- Menghapus empat section dari landing page root
- Merapikan urutan section tersisa tanpa menambah pengganti baru
- Membersihkan data dan style yang sudah tidak dipakai

## Verifikasi

- urutan section akhir sesuai permintaan user
- `pnpm typecheck` sukses
- `pnpm build` sukses

## Catatan

- Tidak dibuat commit karena user belum meminta commit
