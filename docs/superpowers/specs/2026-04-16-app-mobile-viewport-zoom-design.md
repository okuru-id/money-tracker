# App Mobile Viewport Zoom Design

## Latar Belakang

Saat ini frontend memakai meta viewport default di `fe/index.html` dengan nilai `width=device-width, initial-scale=1.0`, sehingga browser mobile masih mengizinkan zoom. Kebutuhan user adalah menonaktifkan zoom hanya pada halaman aplikasi setelah login, tanpa mengubah perilaku landing/public page.

## Tujuan

- Menonaktifkan zoom di mobile hanya pada halaman aplikasi setelah login.
- Mempertahankan perilaku viewport normal pada landing, login, dan halaman public lain.
- Membuat perubahan yang kecil, reversible, dan terpusat.

## Pendekatan yang Dipilih

Mempertahankan meta viewport default di `fe/index.html`, lalu mengubah nilainya secara dinamis dari controller kecil yang hidup di root route wrapper di dalam tree router.

## Opsi yang Dipertimbangkan

### 1. Dynamic viewport per area route

Pendekatan ini dipilih karena paling sesuai kebutuhan: app pages bisa non-zoom, sementara public pages tetap normal.

### 2. Viewport non-zoom global di `index.html`

Pendekatan ini tidak dipilih karena terlalu luas dan akan memengaruhi landing/public page juga.

### 3. Cegah zoom dengan JavaScript gesture handling

Pendekatan ini ditolak karena lebih rapuh dan tidak sebersih pengaturan viewport.

## Perubahan Teknis

- `fe/index.html` tetap memakai meta viewport default.
- Tambahkan root route wrapper di router agar viewport controller bisa hidup sekali untuk seluruh tree route.
- Tambahkan logic kecil di controller tersebut untuk mencari `meta[name="viewport"]` dan mengganti `content` berdasarkan status session.
- Nilai viewport:
  - public/default: `width=device-width, initial-scale=1.0`
  - app after login: `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`
- Saat route berpindah dari app ke public, viewport harus dikembalikan ke nilai default.
- Scope non-zoom mencakup semua route setelah login, termasuk dashboard utama, onboarding family, settings, dan admin.

## Dampak dan Risiko

- Mobile app pages: zoom dinonaktifkan.
- Public pages: tetap bisa zoom seperti biasa.
- Risiko utama adalah penempatan controller di lokasi yang tidak melihat seluruh router tree. Untuk itu, controller harus diletakkan pada root route wrapper agar seluruh branch route ikut tercakup.

## Verifikasi

- Jalankan `pnpm typecheck` setelah perubahan frontend.
- Verifikasi manual di mobile:
  - semua halaman setelah login tidak bisa di-zoom, termasuk onboarding family dan admin
  - landing/login/public page tetap bisa di-zoom
  - pindah route antara public dan app mengubah perilaku viewport dengan benar
