# Frontend Redesign Design

**Tanggal:** 2026-04-10

## Tujuan

Merombak seluruh pengalaman frontend utama Money Tracker agar mengikuti nuansa visual referensi: mobile-first, kartu besar dengan sudut membulat, panel teal gelap, aksen warm orange, dan komposisi yang terasa lembut serta premium. Adaptasi dilakukan pada bahasa visual, bukan menyalin struktur mockup secara literal.

## Scope

Halaman yang masuk redesign:

- Area app setelah login
- `Home`
- `History`
- `Insights`
- `Add`
- `Settings`
- `Login`
- `Register`
- `Family Setup`
- `Family Join`
- `MobileShell` dan bottom navigation

Tidak ada perubahan besar pada routing, API, atau perilaku backend. Fokus redesign ada di layer UI, hierarchy visual, dan konsistensi pengalaman mobile.

## Prinsip Desain

- Menjaga konten tetap relevan untuk money tracker, bukan mengubahnya menjadi task app
- Mengutamakan keterbacaan nominal, kategori, dan CTA utama
- Menggunakan layout yang lebih lapang tetapi tetap seimbang untuk kebutuhan data finansial
- Membangun konsistensi visual dari onboarding sampai halaman utama app
- Menjaga implementasi tetap ringan, tanpa dependency baru, dan sebisa mungkin memanfaatkan struktur komponen yang sudah ada

## Arah Visual

### Revisi arah akhir

Setelah implementasi awal, arah visual diperbarui lagi agar **seluruh frontend tidak memakai gradient**. Bahasa desain final bergeser dari soft-premium dengan banyak gradasi menjadi **flat premium**: tetap hangat, lembut, dan modern, tetapi lebih tenang, lebih bersih, dan lebih konsisten dalam penggunaan solid surfaces.

### Palet

- Background utama: abu kebiruan sangat muda
- Surface utama: off-white / warm white
- Accent dark surface: teal gelap
- CTA dan active highlight: warm orange
- Border dan divider: tipis, lembut, tidak terlalu kontras
- Semua warna dipakai sebagai **solid fills**, bukan gradient

### Bentuk dan depth

- Radius besar pada kartu, panel, dan tombol
- Shadow lembut dengan blur untuk efek floating
- Kombinasi surface terang dan panel gelap untuk emphasis
- Ornamentasi dijaga minimal; hierarchy dibangun lewat kontras solid, border, spacing, dan shadow, bukan gradasi

### Typography

- Heading tegas dan lebih ekspresif dibanding body text
- Body text tetap ringan dan mudah dibaca di layar mobile
- Angka uang tetap mendapatkan penekanan visual kuat

## Arsitektur UI

### Mobile shell

- `MobileShell` menjadi frame utama yang terasa seperti app screen
- Bottom navigation dibuat sebagai floating bar putih dengan radius besar
- Tombol `Add` di tengah menjadi focal point, berbentuk lingkaran besar dengan warna orange solid
- Tab lain lebih tenang, dengan active state yang jelas namun tetap lembut

### Home

- Menjadi halaman paling hero-driven
- Bagian atas memuat greeting dan ringkasan saldo utama pada kartu besar
- Quick action ditampilkan sebagai tombol atau mini-card yang lebih dekoratif
- Ringkasan income/expense/net balance ditampilkan sebagai kartu turunan
- Recent transactions tetap ada, namun divisualkan sebagai panel card yang lebih lembut dan modern

### History

- Tetap fokus pada daftar transaksi dan filter periode
- Navigator bulan dibungkus panel yang lebih polished
- List transaksi tetap efisien, tetapi setiap item tampil sebagai card dengan hierarchy yang lebih jelas
- Edit/delete state tetap dipertahankan tanpa perubahan alur fungsional

### Insights

- Bank account section dan metrics dirombak menjadi kumpulan summary cards yang lebih visual
- Bank cards tetap menonjolkan saldo dan account number, tetapi dengan komposisi yang lebih bersih
- Top categories tetap data-first namun memakai card style yang konsisten dengan halaman lain

### Add

- Menjadi halaman dengan emphasis visual paling kuat setelah Home
- Toggle income/expense, input amount, category picker, dan note tetap dipertahankan
- Header dan submit area diberi treatment visual agar terasa selaras dengan tombol tengah pada bottom nav
- Form tetap cepat digunakan untuk menjaga target input transaksi

### Settings

- Dirombak menjadi kumpulan panel settings yang clean dan premium
- Family prompt, install app card, dan logout card tetap dipertahankan secara fungsional
- Menu settings menggunakan kartu besar dengan icon/arrow treatment yang lebih selaras dengan bahasa visual baru

### Login, Register, Family Setup, Family Join

- Menggunakan bahasa visual yang sama dengan halaman utama agar onboarding terasa satu sistem
- Hero card, CTA orange solid, panel teal solid, dan surface rounded dipakai untuk membuat pengalaman awal lebih hidup
- Form tetap sederhana dan cepat dipahami

## Pola Komponen

Komponen visual yang dipakai berulang:

- `hero card` untuk greeting, saldo, dan onboarding highlight
- `soft metric card` untuk income, expense, total transaksi, dan kategori
- `floating nav` untuk navigasi utama
- `panel card` untuk list, settings section, dan family section
- `accent button` untuk CTA utama dengan warm orange
- `teal section` untuk blok penekanan tertentu

## Data dan Perilaku

- Tidak ada perubahan pada query keys, API contract, atau route structure
- Data finansial tetap menjadi konten utama di seluruh halaman
- Halaman padat tetap dioptimalkan untuk keterbacaan mobile
- Empty state, loading state, dan error state tetap didukung dengan styling baru

## Verifikasi

Minimal verifikasi setelah implementasi frontend redesign:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`

## Catatan Implementasi

- Tidak menambah dependency baru
- Tidak membuat atau mengubah test file karena belum diminta user dan repo melarang itu tanpa permintaan eksplisit
- Perubahan diutamakan pada file layout, page component, dan stylesheet global yang sudah menjadi pusat styling aplikasi
- Saat merapikan visual, prioritaskan penghapusan `linear-gradient(...)` dan `radial-gradient(...)` pada area redesign utama, lalu ganti dengan warna solid yang masih menjaga hierarchy visual
- Revisi akhir: target visual diperketat menjadi **nol-gradient literal** di `fe/src/styles/global.css`, bukan sekadar menimpa gradient lama dengan override baru
