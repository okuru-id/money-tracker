# Bottom Nav Android Tap Highlight Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menghilangkan tap highlight bawaan Android/WebView pada item bottom navigation tanpa mengubah active state route yang sudah ada.

**Architecture:** Perubahan dibatasi pada styling bottom nav di `fe/src/styles/global.css` karena sumber masalah ada di feedback sentuh bawaan browser, bukan pada komponen React atau routing. Struktur `MobileShell` tetap dipakai apa adanya agar perubahan kecil, terisolasi, dan rendah risiko.

**Tech Stack:** React 19, React Router 7, TypeScript 5.9, CSS, Vite 8, pnpm

---

## File Map

- Modify: `fe/src/styles/global.css`
  Tanggung jawab: menyimpan styling `.mobile-shell__tab-link` dan `.mobile-shell__tab-icon` yang mengatur perilaku visual bottom nav di mobile.
- Reference: `fe/src/layouts/mobile-shell.tsx`
  Tanggung jawab: mendefinisikan markup `NavLink` bottom nav yang memakai selector CSS di atas. Tidak direncanakan diubah.
- Reference: `docs/superpowers/specs/2026-04-16-bottom-nav-android-tap-highlight-design.md`
  Tanggung jawab: spec yang menjadi acuan scope implementasi.

### Task 1: Tambahkan CSS anti tap highlight pada bottom nav

**Files:**
- Modify: `fe/src/styles/global.css`
- Reference: `fe/src/layouts/mobile-shell.tsx`

- [ ] **Step 1: Cari blok style bottom nav yang aktif**

Periksa selector berikut di `fe/src/styles/global.css`:

```css
.mobile-shell__tab-link {
}

.mobile-shell__tab-icon {
}
```

Pastikan perubahan ditempatkan pada blok selector yang memang dipakai oleh bottom nav aktif, bukan pada style komponen lain.

- [ ] **Step 2: Tambahkan properti CSS minimal pada link tab**

Tambahkan properti berikut ke `.mobile-shell__tab-link`:

```css
-webkit-tap-highlight-color: transparent;
```

Jika browser Android masih menampilkan highlight di area ikon, tambahkan properti yang sama ke `.mobile-shell__tab-icon`.

- [ ] **Step 3: Jaga scope tetap lokal**

Jangan tambahkan selector global seperti `a`, `button`, atau `*`. Pastikan perubahan hanya berlaku untuk bottom nav.

### Task 2: Verifikasi build-level frontend

**Files:**
- Modify: tidak ada
- Verify: `fe/src/styles/global.css`

- [ ] **Step 1: Jalankan typecheck frontend**

Run: `pnpm typecheck`

Expected: proses selesai sukses tanpa error TypeScript.

- [ ] **Step 2: Catat verifikasi manual yang masih diperlukan**

Verifikasi manual di Android/WebView:

```text
Tap tiap item bottom nav dan pastikan tidak ada highlight bawaan browser saat disentuh.
Tab aktif tetap memakai style active yang sama setelah navigasi.
```

## Catatan Implementasi

- Jangan ubah `fe/src/layouts/mobile-shell.tsx` kecuali verifikasi menunjukkan CSS selector tidak mengenai elemen yang tepat.
- Jangan menambah test file atau test case baru karena repo policy tidak mengizinkannya tanpa permintaan eksplisit user.
- Tidak perlu commit otomatis; commit hanya jika user meminta.
