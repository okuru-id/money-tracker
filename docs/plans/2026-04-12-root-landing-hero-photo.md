# Root Landing Hero Photo Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mengubah hero kanan menjadi komposisi visual bergaya screenshot dengan foto nyata dan stat cards yang lebih tegas.

**Architecture:** Perubahan dibatasi pada hero JSX dan CSS. Visual kanan disusun ulang menjadi topline dua kartu, panel foto besar, dan satu mini card overlay, dengan asset statis dari `fe/public/hero-person.png`.

**Tech Stack:** React 19, TypeScript 5.9, CSS global existing project, Vite public asset

---

### Task 1: Ubah struktur hero visual

**Files:**
- Modify: `fe/src/features/landing/pages/landing-page.tsx`

**Step 1: Tambah panel foto utama**

- ubah isi `landing-moneyhub-hero__visual` agar memiliki dua kartu atas dan satu panel besar berisi foto

### Task 2: Ubah styling hero visual

**Files:**
- Modify: `fe/src/styles/global.css`

**Step 1: Lebarkan navbar sedikit**

- ubah max width `landing-navbar` ke kisaran `79rem`

**Step 2: Bentuk komposisi hero screenshot-like**

- rapikan stat cards atas
- buat panel foto terang dan dominan
- tambah mini overlay card kecil

### Task 3: Verifikasi

**Step 1: Run build frontend**

Run: `pnpm build`
Expected: sukses tanpa error
