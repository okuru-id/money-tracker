# Home View All Android Touch Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Note:** Jika sub-skill tersebut tidak tersedia di workspace saat ini, jalankan task secara inline dengan tool yang ada sambil tetap mengikuti urutan langkah di plan ini.

**Goal:** Menghilangkan feedback sentuh Android yang tampil kotak pada tombol `View all` di halaman home tanpa mengubah bentuk pill dan style tombol yang ada.

**Architecture:** Perubahan dibatasi pada styling `.home-recent__link` di `fe/src/styles/global.css` karena sumber masalah ada di feedback sentuh browser/WebView pada button, bukan pada struktur React. Komponen `HomePage` tetap dipertahankan agar perubahan kecil dan rendah risiko. Rule dasar `-webkit-tap-highlight-color` ditambahkan langsung pada tombol, sedangkan override state tambahan dibatasi ke media query coarse pointer agar desktop dan non-touch focus tidak berubah.

**Tech Stack:** React 19, TypeScript 5.9, CSS, Vite 8, pnpm

---

## File Map

- Modify: `fe/src/styles/global.css`
  Tanggung jawab: menyimpan style `.home-recent__link` yang mengatur tampilan tombol `View all`.
- Reference: `fe/src/features/home/pages/home-page.tsx`
  Tanggung jawab: mendefinisikan tombol `button.home-recent__link` yang memakai style tersebut. Tidak direncanakan diubah.
- Reference: `docs/superpowers/specs/2026-04-16-home-view-all-android-touch-feedback-design.md`
  Tanggung jawab: spec acuan scope implementasi.

### Task 1: Tambahkan CSS touch-specific pada tombol View all

**Files:**
- Modify: `fe/src/styles/global.css`
- Reference: `fe/src/features/home/pages/home-page.tsx`

- [ ] **Step 1: Temukan blok style `.home-recent__link` yang aktif**

Periksa selector berikut di `fe/src/styles/global.css`:

```css
.home-recent__link {
}
```

- [ ] **Step 2: Tambahkan properti minimal dan fallback state yang jelas**

Tambahkan properti berikut pada `.home-recent__link`:

```css
-webkit-tap-highlight-color: transparent;
```

Tambahkan fallback rule berikut di dalam media query `@media (hover: none) and (pointer: coarse)`:

```css
.home-recent__link:focus,
.home-recent__link:focus-visible,
.home-recent__link:active {
   outline: none;
   box-shadow: none;
}
```

- [ ] **Step 3: Pastikan scope tetap lokal**

Jangan buat selector global untuk semua `button` atau `a`. Perubahan hanya berlaku untuk `.home-recent__link`.

### Task 2: Verifikasi frontend

**Files:**
- Verify: `fe/src/styles/global.css`

- [ ] **Step 1: Jalankan typecheck frontend**

Run: `corepack pnpm typecheck`

Expected: sukses tanpa error TypeScript.

- [ ] **Step 2: Catat verifikasi manual Android**

Verifikasi manual:

```text
Tekan tombol View all di Android dan pastikan feedback sentuh tidak lagi tampil kotak.
Pastikan override state hanya aktif di coarse pointer.
```

- [ ] **Step 3: Catat verifikasi visual lintas device**

Verifikasi manual:

```text
Pastikan bentuk pill dan warna tombol tetap sama di iOS dan Android.
Pastikan desktop/focus non-touch tidak berubah.
```

## Catatan Implementasi

- Jangan ubah `home-page.tsx` kecuali style ternyata tidak mengenai tombol yang benar.
- Jangan menambah test file atau test case baru.
- Tidak perlu commit atau deploy kecuali user meminta.
