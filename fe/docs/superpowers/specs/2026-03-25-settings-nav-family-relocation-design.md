# Design Spec: Bottom Nav Settings + Family Relocation

## Metadata
- Date: 2026-03-25
- Product: Money Tracking Mobile PWA (frontend)
- Scope: Navigation and information architecture update
- Status: Draft approved in conversation, ready for spec review loop

## Problem Statement
Tab `Family` di bottom navigation terasa kurang proporsional dengan kebutuhan utama user yang fokus pada input transaksi. User meminta area administrasi dipusatkan ke `Settings`, lalu fitur family dipindah sebagai submenu.

## Goals
- Bottom nav tetap 5 tombol dengan `Add` di tengah.
- `Family` tidak lagi muncul sebagai tab utama.
- Fitur family tetap tersedia penuh melalui `Settings`.
- Menambahkan titik akses `Logout` yang saat ini belum ada di UI.

## Decisions (Locked)
1. Chosen approach: **Approach A (Settings Hub + submenu cards)**.
2. Bottom nav final: **Home · History · Add · Insights · Settings**.
3. `Family` dipindahkan ke submenu `Settings > Family Management`.

## In Scope
- Ubah route dan bottom nav dari `family` menjadi `settings`.
- Tambah halaman `Settings` sebagai hub.
- Tambah route `settings/family` untuk menampilkan fitur family existing.
- Reuse komponen family saat ini (member list, contribution summary, invite generation/status).
- Tambah action `Logout` di Settings.

## Out of Scope
- Perubahan kontrak API backend.
- Refactor besar arsitektur fitur family.
- Penambahan analytics event baru di luar event yang sudah ada.
- Perubahan desain visual major di luar kebutuhan nav/settings.

## Information Architecture
### Bottom Navigation
- `/` -> Home
- `/history` -> History
- `/add` -> Add (center/featured)
- `/insights` -> Insights
- `/settings` -> Settings

### Settings Structure
- `Settings` (hub)
  - `Family Management` -> `/settings/family`
  - `Account` (placeholder non-interaktif: menampilkan label "Soon", tidak navigasi)
  - `App Preferences` (placeholder non-interaktif: menampilkan label "Soon", tidak navigasi)
  - `Logout` action

## Routing & Navigation Design
- Replace tab route `family` with `settings` in mobile shell.
- Add route: `/settings` for settings hub.
- Add route: `/settings/family` for family management page.
- Legacy path handling: akses ke `/family` di-redirect ke `/settings/family` untuk kompatibilitas deep-link lama.
- Back behavior: dari `/settings/family` kembali ke `/settings`.
- Existing auth/family guards tetap digunakan untuk route private.

## Component Design
### New / Updated Components
- `features/settings/pages/settings-page.tsx` (new)
- `features/family/pages/family-management-page.tsx` (new route wrapper)
- Reuse family components existing:
  - member list
  - contribution summary
  - invite status + generate invite action

### Reuse Strategy
- Logika API tetap di `features/family/api.ts`.
- UI family existing dipindah ke komponen reusable bila perlu, tanpa mengubah perilaku bisnis.

## UX Behavior
- `Add` tetap di tengah dan visualnya paling menonjol.
- `Settings` tampil sebagai menu administrasi, bukan tab data finansial inti.
- `Family Management` diberi deskripsi bahwa ini pengganti akses tab Family lama.
- `Logout` tampil jelas di Settings dan mudah dijangkau.

## Error Handling
- Family API errors tetap ditampilkan inline seperti pola existing.
- Jika family context tidak valid/tersedia, tampilkan empty-state dengan CTA kembali ke setup/join.
- Logout menampilkan loading state singkat dan redirect ke `/login` saat sukses.

## Security & Authorization
- Tidak ada perubahan model auth.
- Logout tetap menggunakan endpoint existing `POST /auth/logout` dengan cookie session.
- Route private tetap di bawah guard existing.

## Acceptance Criteria
1. Bottom nav menampilkan 5 tab: Home, History, Add, Insights, Settings.
2. Add berada di tengah dan tetap featured.
3. Tab Family tidak ada lagi di bottom nav.
4. User dapat masuk ke Family Management dari Settings.
5. Fitur family existing (member list, summary, invite) tetap berfungsi dari route baru.
6. Logout dapat dilakukan dari Settings dan mengarahkan user ke login.
7. Akses ke path legacy `/family` otomatis redirect ke `/settings/family`.
8. User unauthenticated tetap mengikuti auth gate existing dan tidak bisa mengakses route settings private.

## Risks and Mitigations
- Risk: User bingung karena tab Family hilang.
  - Mitigation: Label `Family Management` jelas + copy penjelas di Settings.
- Risk: Regresi route guard setelah pemindahan route.
  - Mitigation: Uji manual flow auth + routing sebelum release.

## Manual Verification Checklist
- Login sebagai user dengan family -> cek bottom nav final.
- Klik Settings -> masuk ke Family Management -> data family tampil.
- Generate invite dari halaman Family Management.
- Navigasi back dari `/settings/family` kembali ke `/settings`.
- Logout dari Settings -> redirect ke `/login`.

## Implementation Notes
- Perubahan ini fokus pada frontend (`fe`).
- Tidak butuh perubahan backend API.
