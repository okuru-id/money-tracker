# Desktop Layout Redesign Design

**Tanggal:** 2026-04-15

## Tujuan

Merancang ulang layout desktop untuk area content pada halaman-halaman app utama tanpa mengubah navigasi mobile, business logic, atau alur data yang sudah ada.

## Scope

Halaman yang berada di dalam `MobileShell` dan perlu penyesuaian content desktop:

- `fe/src/features/home/pages/home-page.tsx`
- `fe/src/features/history/pages/history-page.tsx`
- `fe/src/features/transactions/pages/add-page.tsx`
- `fe/src/features/insights/pages/insights-page.tsx`
- `fe/src/features/settings/pages/settings-page.tsx`
- `fe/src/features/family/pages/family-management-page.tsx`
- `fe/src/features/family/pages/family-page.tsx`
- styling global desktop di `fe/src/styles/global.css`

Halaman auth, landing, dan admin tidak termasuk scope redesign ini.

## Kondisi Saat Ini

- Desktop saat ini sudah memiliki sidebar kiri dan topbar, tetapi area content masih banyak mewarisi pola mobile.
- `mobile-shell__content` baru dilebarkan, namun belum ada sistem layout desktop yang konsisten untuk semua halaman.
- Beberapa halaman sudah cukup rapi pada mobile, tetapi di desktop masih tampil terlalu stack-heavy, kurang memanfaatkan lebar layar, dan belum punya hierarchy desktop yang jelas.

## Pendekatan yang Dipilih

Menggunakan satu kerangka content desktop global yang konsisten, lalu memberi variasi ringan per halaman sesuai kebutuhan domain. Dengan pendekatan ini, pengalaman desktop tetap terasa sebagai satu aplikasi, tetapi `Home`, `History`, `Add`, `Insights`, `Settings`, dan `Family` bisa punya susunan content yang lebih pas untuk layar lebar.

## Alternatif yang Dipertimbangkan

1. Satu layout content global yang sama persis untuk semua halaman.

Ditolak karena terlalu generik untuk halaman seperti `Add` dan `History` yang butuh struktur kerja berbeda.

2. Layout desktop yang sepenuhnya bebas per halaman.

Ditolak karena effort besar, berisiko mengurangi konsistensi aplikasi, dan membuat maintenance styling desktop lebih berat.

## Arah Desain Global

- `MobileShell` tetap menjadi shell utama desktop dan mobile.
- Redesign difokuskan pada area content kanan.
- Desktop akan memakai pola content wrapper yang lebih jelas:
  - gutter horizontal konsisten
  - section spacing lebih lapang
  - grid desktop reusable untuk 2 kolom atau 3 kolom
  - alignment header halaman yang lebih stabil
- Mobile tetap mempertahankan pola stack existing.

## Arah Desain Per Halaman

### Home

- Ubah menjadi dashboard desktop dua kolom.
- Area hero dan summary utama menjadi blok besar di kiri.
- Area quick stats dan shortcut menjadi blok pendamping di kanan.
- Recent transactions menjadi section bawah yang lebih lebar dan terasa seperti activity panel desktop.

### History

- Ubah menjadi pola `header + toolbar + content`.
- `MonthNavigator` ditempatkan dalam header/toolbar desktop yang lebih horizontal.
- List transaksi diberi wadah desktop yang terasa seperti workspace, bukan sekadar tumpukan kartu mobile.

### Add

- Ubah menjadi halaman form desktop yang lebih fokus.
- Form utama menjadi kolom dominan.
- Kolom samping dipakai untuk ringkasan state input, shortcut, atau konteks submit agar layar lebar tidak kosong.

### Insights

- Ubah menjadi grid analitik desktop.
- Area bank accounts dan insight cards perlu memanfaatkan ruang horizontal dengan grouping yang lebih kuat.
- Top categories menjadi pasangan panel yang lebih seimbang di desktop.

### Settings

- Ubah menjadi layout panel modular desktop.
- Profile, family prompt, menu settings, install card, dan logout card diberi grouping yang lebih terstruktur agar halaman terasa seperti control center, bukan stack linear.

### Family Management

- Pertahankan hero/header yang sudah ada, lalu susun ulang body desktop menjadi section-grid.
- Invite center, members, dan contribution lebih cocok ditata dalam panel desktop yang terpisah dengan ritme visual yang konsisten.

## Aturan Implementasi

- Hindari perubahan business logic, query, mutation, dan API flow.
- Utamakan perubahan pada struktur JSX dan class CSS existing.
- Jangan menambah dependency baru.
- Jangan menambah atau mengubah test file karena user tidak meminta test.
- Perubahan global harus seminimal mungkin, cukup untuk mendukung variasi layout desktop per halaman.

## Verifikasi

- `pnpm typecheck`
- `pnpm build`
- review visual manual pada halaman desktop utama: `Home`, `History`, `Add`, `Insights`, `Settings`, dan `Family Management`

## Catatan

- User meminta kerja tanpa worktree.
- Dokumen ini tidak di-commit karena user belum meminta commit.
