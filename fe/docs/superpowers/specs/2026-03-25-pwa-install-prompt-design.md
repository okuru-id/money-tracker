# Design Spec: PWA Install Prompt

## Metadata
- Date: 2026-03-25
- Product: Money Tracking Mobile PWA (frontend)
- Scope: Install notification for PWA
- Chosen approach: Approach A (persistent lightweight install prompt)

## Problem Statement
App sudah mendukung PWA, tetapi user belum mendapatkan CTA yang jelas untuk meng-install aplikasi ke home screen. Dibutuhkan prompt ringan yang muncul saat browser mengizinkan install, tanpa mengganggu alur utama input transaksi.

## Goals
- Menampilkan prompt install otomatis saat app installable.
- Memberi CTA jelas: `Install` dan `Nanti`.
- Tidak mengganggu toast transaksi atau bottom navigation.
- Menyembunyikan prompt setelah install berhasil atau saat user dismiss untuk sesi aktif.

## In Scope
- Deteksi event `beforeinstallprompt`.
- Prompt kecil persistent di bagian bawah layar, di atas bottom nav.
- Action `Install` untuk memanggil prompt native browser.
- Action `Nanti` untuk menyembunyikan prompt pada sesi aktif.
- Cleanup state saat event `appinstalled` terjadi.

## Out of Scope
- Fallback khusus iOS/manual install instructions.
- Modal besar atau onboarding multi-step untuk PWA install.
- Analytics event baru khusus install prompt.

## Chosen UX
- Bentuk: panel kecil/bottom banner.
- Posisi: fixed di bawah, tetapi berada di atas bottom nav.
- Konten:
  - Judul singkat, mis. `Install app ini`
  - Deskripsi singkat manfaat install
  - Tombol utama `Install`
  - Tombol sekunder `Nanti`

## Interaction Design
1. Browser memicu `beforeinstallprompt`.
2. App menyimpan deferred prompt event ke store/module PWA install.
3. Jika user belum dismiss pada sesi aktif, prompt ditampilkan.
4. Klik `Install` memanggil prompt native browser.
5. Jika install sukses (`appinstalled`), prompt hilang dan state dibersihkan.
6. Klik `Nanti` menyembunyikan prompt sampai sesi browser berikutnya.

## Technical Design
### Modules
- `src/lib/pwa-install.ts`
  - menyimpan deferred install prompt event
  - expose state install availability
  - expose action `promptInstall()`
  - expose action dismiss per sesi
- `src/components/pwa-install-prompt.tsx`
  - render banner install saat state availability aktif
- Integrasi global di shell/provider utama agar prompt bisa muncul di semua halaman utama.

### State Rules
- Dismiss state disimpan di `sessionStorage`; artinya prompt tetap tersembunyi saat reload di tab yang sama, tetapi boleh muncul lagi pada tab/browser session baru.
- Jika browser tidak mendukung `beforeinstallprompt`, prompt tidak muncul.
- Jika app sudah terpasang, prompt tidak muncul lagi; gunakan sinyal minimum seperti `appinstalled` dan/atau `display-mode: standalone` bila relevan pada client.

## Error Handling
- Jika pemanggilan prompt gagal atau event tidak valid, prompt hilang dengan aman tanpa error UI.
- Jika user menolak prompt native browser, banner tetap disembunyikan untuk sesi berjalan agar tidak terasa spam.

## Integration Point
- Anchor utama prompt ditempatkan di shell/layout global frontend agar bisa muncul konsisten di seluruh area utama aplikasi tanpa bergantung pada halaman tertentu.

## Acceptance Criteria
1. Saat app installable, prompt muncul otomatis.
2. Klik `Install` memicu prompt install browser.
3. Klik `Nanti` menyembunyikan prompt untuk sesi aktif.
4. Setelah install sukses, prompt hilang otomatis.
5. Prompt tidak menutupi bottom nav dan tetap nyaman di mobile.
6. Prompt tidak bentrok dengan toast transaksi existing.

## Risks and Mitigations
- Risk: Prompt bertabrakan dengan toast transaksi.
  - Mitigation: gunakan komponen prompt terpisah, bukan memanfaatkan toast transaksi global.
- Risk: Browser tidak mendukung event install.
  - Mitigation: fail silently tanpa menampilkan UI yang misleading.

## Manual Verification Checklist
- Buka app dari browser yang mendukung install prompt.
- Pastikan banner install muncul di atas bottom nav.
- Klik `Nanti` dan pastikan prompt hilang sampai sesi aktif berakhir.
- Reload hard jika perlu, lalu cek perilaku dismissal masih sesuai sesi.
- Klik `Install` dan pastikan native install prompt muncul.
- Setelah install sukses, pastikan prompt tidak muncul lagi.
