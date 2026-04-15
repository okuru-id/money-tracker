# PWA Prompt Desktop Sidebar Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Menempatkan prompt install PWA di bagian bawah sidebar pada desktop tanpa mengubah perilaku prompt bottom di mobile.

**Architecture:** `MobileShell` akan merender prompt secara kondisional untuk dua mode layout: mobile tetap memakai prompt floating bottom, sedangkan desktop akan me-render prompt di dalam sidebar kiri. CSS akan membedakan mode desktop dengan selector/sidebar-specific styling agar prompt menjadi bagian flow sidebar dan tidak lagi bergantung pada `position: fixed` di desktop.

**Tech Stack:** React 19, TypeScript 5.9, global CSS existing project

---

### Task 1: Pisahkan penempatan prompt mobile dan desktop

**Files:**
- Modify: `fe/src/layouts/mobile-shell.tsx`
- Review: `fe/src/components/pwa-install-prompt.tsx`

**Step 1: Tempatkan prompt mobile tetap di lokasi existing**

- pertahankan render prompt floating untuk mode mobile

**Step 2: Tambahkan render prompt desktop di dalam sidebar**

- render prompt kedua khusus desktop di area `nav`
- gunakan class wrapper desktop yang eksplisit agar styling mudah dipisah

### Task 2: Tambah styling prompt desktop di bawah sidebar

**Files:**
- Modify: `fe/src/styles/global.css`

**Step 1: Buat wrapper desktop sidebar prompt**

- pastikan wrapper terdorong ke bawah sidebar
- beri padding dan jarak yang rapi

**Step 2: Override prompt desktop agar tidak fixed**

- hilangkan `position: fixed`, `left: 50%`, dan transform viewport-based pada desktop sidebar prompt
- lebar prompt mengikuti sidebar

**Step 3: Pastikan prompt mobile tidak berubah**

- override hanya aktif di desktop sidebar mode
- auth prompt/top tidak ikut berubah

### Task 3: Verifikasi implementasi

**Files:**
- Review: `fe/src/layouts/mobile-shell.tsx`
- Review: `fe/src/styles/global.css`

**Step 1: Run lint**

Run: `pnpm lint`
Expected: sukses tanpa error ESLint

**Step 2: Run build**

Run: `pnpm build`
Expected: sukses tanpa error build Vite

**Step 3: Review diff**

Run: `git diff -- docs/plans/2026-04-15-pwa-prompt-desktop-sidebar-design.md docs/plans/2026-04-15-pwa-prompt-desktop-sidebar.md fe/src/layouts/mobile-shell.tsx fe/src/styles/global.css`
Expected: diff hanya menunjukkan relokasi prompt desktop dan styling pendukungnya

## Catatan Eksekusi

- Tidak menambah atau mengubah test file karena user tidak meminta test
- Tidak membuat commit karena user belum meminta commit untuk task ini
