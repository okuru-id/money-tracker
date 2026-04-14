# Root Landing Premium Color Design

**Tanggal:** 2026-04-12

## Tujuan

Merapikan warna tiap section pada landing page `/` agar terasa lebih premium: tetap kontras, tetapi memakai hirarki tone navy dan soft mint yang lebih halus dan konsisten.

## Masalah yang Diselesaikan

Landing page saat ini sudah memiliki struktur visual yang kuat, tetapi sistem warnanya belum terasa sepenuhnya rapi. Beberapa dark section dan dark card memakai tone navy yang berbeda tanpa hirarki yang jelas, sementara light section masih cenderung campur antara off-white, putih murni, dan surface terang lain tanpa ritme yang sengaja dirancang.

Akibatnya, halaman masih terasa seperti kumpulan section yang benar secara individual, tetapi belum terasa sebagai satu sistem visual premium yang utuh.

## Scope

- Menata ulang warna section dan card di landing page
- Mempertahankan struktur markup landing page yang ada
- Tidak mengubah routing, CTA, copy, atau alur interaksi
- Tidak menambah dependency baru

## Arah Visual

Landing page diarahkan ke gaya **premium tonal contrast**.

Prinsip yang dipakai:

- hero dan endcap tetap menjadi area dengan navy terdalam
- dark section sekunder memakai turunan navy yang sedikit lebih lembut, bukan warna gelap acak
- light section bergeser dari putih polos ke soft mint / soft slate yang sangat tipis
- card dan panel mengikuti hirarki yang jelas: base surface, raised surface, accent surface
- aksen hijau tetap dipakai untuk CTA dan signal penting, tetapi tone pendukungnya dibuat lebih tenang agar tidak terasa terlalu neon

## Sistem Warna yang Diusulkan

### Dark hierarchy

- **Base navy:** `#0f1f28`
- **Secondary navy:** `#132834`
- **Accent dark surface:** `#16333d`
- **Dark raised card:** `#182f3a`

### Light hierarchy

- **Main light surface:** `#f6fbfa`
- **Alternate light surface:** `#eef6f4`
- **Premium white card:** `#fcfefd`
- **Soft border tone:** slate-mint netral, tetap tipis dan halus

### Accent

- CTA / signal utama tetap di keluarga hijau yang sama
- elemen pendukung seperti badge, outline, dan subtle highlight dibuat sedikit lebih desaturated agar tidak mengganggu keseimbangan page

## Pemetaan Section

### Dark utama

- `landing-shell--hero`
- `landing-shell--cta`
- `landing-shell--footer`
- `landing-shell--stats`

Section ini tetap memakai base navy agar mempertahankan anchor visual halaman.

### Dark sekunder

- `landing-shell--dark`
- `landing-transfer-card`
- beberapa dark card di hero cluster

Bagian ini memakai secondary navy atau accent dark surface agar tetap kontras dengan light section, tetapi tidak terasa mengulang warna hero secara mentah.

### Light utama

- `landing-shell--light`
- `landing-shell--split`
- feature grid, efficiency, testimonial

Bagian ini bergeser ke soft mint/off-white agar terasa lebih refined dibanding putih murni.

## Dampak Implementasi

- Perubahan akan terpusat di `fe/src/styles/global.css`
- Tidak perlu mengubah struktur JSX selain jika dibutuhkan class tambahan kecil, tetapi target utamanya tetap CSS-only
- Section spacing dan layout desktop yang sudah dibenahi sebelumnya harus tetap dipertahankan

## Verifikasi

- Perbedaan tone antar section dark terlihat konsisten dan disengaja
- Light section tidak lagi terasa putih polos atau terlalu datar
- CTA tetap menonjol sebagai focal accent
- `pnpm build`

## Catatan

- Dokumen ini disimpan untuk menjaga jejak keputusan desain
- Tidak dibuat commit untuk dokumen ini karena belum ada permintaan commit dari user
