# Mobile Touch Pressed State Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Note:** Jika sub-skill tersebut tidak tersedia di workspace saat ini, jalankan task secara inline dengan tool yang ada sambil tetap mengikuti urutan langkah di plan ini.

**Goal:** Menyamakan pressed state custom pada komponen interaktif utama di aplikasi untuk mobile touch tanpa mengubah desktop, landing, atau state permanen yang sudah ada.

**Architecture:** Implementasi dipusatkan di `fe/src/styles/global.css` dengan memanfaatkan selector komponen yang sudah ada, bukan rule global untuk semua `button` atau `a`, dan tanpa menambah class/utility baru ke JSX pada tahap ini. Target tahap pertama dibatasi ke halaman aplikasi utama, tetapi selector shared tetap boleh dipakai bila itu memang selector existing yang mengendalikan komponen dalam scope. Implementasi wajib mengaudit final selector yang mewakili seluruh kategori spec sebelum perubahan final agar tidak ada target yang terlewat.

**Tech Stack:** React 19, TypeScript 5.9, CSS, Vite 8, pnpm

---

## File Map

- Modify: `fe/src/styles/global.css`
  Tanggung jawab: mendefinisikan pressed state mobile touch untuk selector komponen interaktif dalam scope tahap pertama.
- Reference: `fe/src/layouts/mobile-shell.tsx`
  Tanggung jawab: bottom nav dan shell aplikasi yang sudah memakai selector `mobile-shell__*`.
- Reference: `fe/src/features/home/pages/home-page.tsx`
  Tanggung jawab: contoh penggunaan selector `home-recent__link` dan quick actions di halaman home.
- Reference: `fe/src/features/settings/pages/settings-page.tsx`
  Tanggung jawab: action button dan pill action di settings.
- Reference: `fe/src/features/family/pages/*.tsx`
  Tanggung jawab: aksi utama family dan link-action yang tampil seperti button.
- Reference: `fe/src/features/history/components/transaction-item.tsx`
  Tanggung jawab: membantu mengaudit target modal action non-admin yang benar-benar dipakai di halaman aplikasi.
- Reference: selector submit button dan action button non-admin yang sudah ada di `fe/src/styles/global.css`
  Tanggung jawab: memastikan scope tahap pertama mencakup komponen app lain yang aman dan jelas.
- Reference: `docs/superpowers/specs/2026-04-16-mobile-touch-pressed-state-design.md`
  Tanggung jawab: spec acuan scope dan perilaku visual.

### Task 1: Petakan selector komponen interaktif tahap pertama

**Files:**
- Modify: `fe/src/styles/global.css`
- Reference: `fe/src/layouts/mobile-shell.tsx`
- Reference: `fe/src/features/home/pages/home-page.tsx`

- [ ] **Step 1: Identifikasi selector dalam scope**

Gunakan selector komponen yang sudah ada untuk kelompok berikut:

```text
Bottom nav
Quick actions home
View all / pill actions
Submit button utama
Button modal non-admin yang sudah punya selector spesifik
Action button settings/family
```

Catatan hasil inspeksi awal codebase saat plan ini ditulis:

```text
Selector clickable row/card yang ditemukan saat ini tampak berada di area admin.
Selector modal generik seperti .modal__button / .modal-close juga dipakai admin, tetapi tetap bisa dipakai jika audit final menunjukkan selector shared itu memang perlu untuk memenuhi scope spec.
```

- [ ] **Step 1a: Audit ulang kandidat modal button dan clickable row/card non-admin**

Sebelum implementasi final, cek ulang apakah ada selector non-admin tambahan yang aman untuk dua kategori berikut:

```text
Button modal pada halaman aplikasi utama
Clickable row/card utama pada halaman aplikasi utama
```

Hasil audit harus berupa inventaris final selector yang benar-benar akan diubah untuk setiap kategori scope spec, dicatat sebagai checklist/daftar ringkas di catatan kerja implementasi sebelum edit final dilakukan. Jika kategori tertentu hanya terwakili oleh selector shared, selector shared tersebut tetap masuk plan selama dampaknya masih sejalan dengan spec tahap pertama.

Minimal telusuri selector yang sudah ada di `global.css` untuk kelompok berikut sebelum mengedit:

```text
.mobile-shell__tab-link
.home-quick-actions__button
.home-recent__link
.transaction-form__submit
.settings-page__install-button
.settings-page__logout-button
.family-card__action
.family-card__link-action
.settings-page__family-prompt-button
.history-detail-modal__close-btn
```

- [ ] **Step 2: Kelompokkan selector dengan perilaku touch yang sama**

Gabungkan hanya selector yang memang bisa memakai pressed state seragam tanpa merusak visual permanen. Hindari selector landing, desktop-only, form field, link teks biasa, dan auth/public screen di luar halaman aplikasi utama.

- [ ] **Step 3: Pastikan rule tetap terbatas ke app scope**

Semua selector yang dimasukkan harus berasal dari komponen aplikasi yang sudah ada. Jangan buat selector global seperti `button`, `a`, `[role="button"]`, atau `*`.

Selector umum seperti `.data-card.clickable`, `.clickable-row`, `.modal__button`, atau `.modal-close` tidak otomatis dikeluarkan dari tahap pertama hanya karena shared. Gunakan hasil audit final untuk memutuskan apakah selector tersebut memang diperlukan agar kategori scope spec terwakili.

### Task 2: Tambahkan pressed state mobile touch yang seragam

**Files:**
- Modify: `fe/src/styles/global.css`

- [ ] **Step 1: Tambahkan rule dasar hanya untuk mobile touch**

Gunakan media query:

```css
@media (hover: none) and (pointer: coarse) {
}
```

- [ ] **Step 2: Matikan highlight bawaan browser hanya pada selector dalam scope**

Tambahkan `-webkit-tap-highlight-color: transparent` hanya pada selector komponen yang sudah dipetakan di Task 1.

- [ ] **Step 3: Tambahkan pressed state custom seragam**

Untuk selector dalam scope, tambahkan perilaku sementara saat ditekan, misalnya:

```css
transition:
   background-color 0.16s ease,
   transform 0.16s ease,
   box-shadow 0.16s ease;
```

Dan pada state `:active`:

```css
background-color: rgb(18 92 92 / 0.08);
transform: scale(0.98);
```

Jika komponen tertentu sudah punya warna utama lain, gunakan warna existing yang paling dekat dengan basis visual komponen tersebut, tetapi tetap pada opacity tipis yang setara. Gunakan perubahan yang additive dan aman terhadap visual permanen yang sudah ada, misalnya `background-color`, bukan reset menyeluruh seperti `background`. Pressed state harus mengikuti radius komponen yang sudah ada dan tidak mengganti state aktif permanen.

Aturan warna fallback untuk tahap pertama bila komponen belum punya pressed tint yang jelas:

```text
Default pressed tint: rgb(18 92 92 / 0.08)
Untuk komponen aksen oranye yang sudah memakai #f0a746 sebagai warna utama: rgb(240 167 70 / 0.14)
```

Jika komponen sudah punya pressed tint existing yang aman dan konsisten, pertahankan tint tersebut. Nilai di atas adalah fallback, bukan kewajiban mutlak untuk semua selector.

- [ ] **Step 4: Perlakukan komponen spesial secara hati-hati**

Pastikan selector seperti bottom nav featured tab (`+`) atau tombol yang sudah punya visual aktif permanen tetap terlihat konsisten. Bila perlu, tambahkan rule khusus yang kecil dan terlokalisasi, bukan override global.

- [ ] **Step 5: Pastikan seluruh kategori spec sudah terpetakan**

Sebelum selesai mengedit, cocokkan inventaris final selector dengan kategori spec berikut:

```text
Bottom nav
Quick actions
View all / pill actions
Submit button utama
Button modal aksi utama
Action button settings/family
Clickable row/card utama
```

Setiap kategori harus punya hasil eksplisit: selector yang diubah, atau catatan audit bahwa di codebase saat ini kategori tersebut belum punya target aplikasi utama yang nyata.

### Task 3: Verifikasi frontend

**Files:**
- Verify: `fe/src/styles/global.css`

- [ ] **Step 1: Jalankan typecheck frontend**

Run: `pnpm typecheck`

Expected: sukses tanpa error TypeScript.

- [ ] **Step 2: Catat verifikasi manual mobile touch**

Verifikasi manual:

```text
Android dan iOS - Bottom nav: background tipis mengikuti radius dan ada sedikit scale saat ditekan.
Android dan iOS - Home quick actions: background tipis mengikuti radius dan ada sedikit scale saat ditekan.
Android dan iOS - Home View all: background tipis mengikuti radius dan ada sedikit scale saat ditekan.
Android dan iOS - Transaction submit button: feedback sentuh seragam muncul tanpa merusak visual permanen.
Android dan iOS - Settings/family action button: feedback sentuh seragam muncul tanpa merusak visual permanen.
Android dan iOS - History detail close button atau modal button non-admin lain yang lolos audit: feedback sentuh seragam muncul tanpa merusak visual permanen.
```

- [ ] **Step 3: Catat verifikasi non-regresi**

Verifikasi manual:

```text
State active/focus permanen tetap sama.
Desktop tidak berubah.
Landing/marketing tidak berubah.
Hasil audit ulang row/card clickable non-admin tercatat jelas: jika ada target aman maka ikut diverifikasi, jika tidak ada maka tercatat no-op terverifikasi.
```

## Catatan Implementasi

- Jangan menambah utility class baru ke banyak file JSX jika selector yang ada sudah cukup.
- Jangan menambah test file atau test case baru.
- Jangan memakai selector global untuk semua `button` atau `a`.
- Jangan memasukkan selector modal/card/clickable row yang juga dipakai admin bila tidak punya scope non-admin yang jelas di CSS existing.
- Tidak perlu commit atau deploy kecuali user meminta.
