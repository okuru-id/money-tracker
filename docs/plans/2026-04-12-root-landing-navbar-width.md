# Root Landing Navbar Width Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Membuat navbar landing hero sedikit lebih lebar agar lebih proporsional dengan layout desktop saat ini.

**Architecture:** Perubahan hanya dilakukan pada satu rule CSS `landing-navbar` di stylesheet global. Tidak ada perubahan struktur JSX dan tidak ada perubahan perilaku responsive lain di luar lebar maksimum navbar.

**Tech Stack:** React 19, TypeScript 5.9, CSS global existing project

---

### Task 1: Perbesar lebar navbar sedikit

**Files:**
- Modify: `fe/src/styles/global.css:4833-4845`

**Step 1: Ubah max width navbar**

- naikkan `width: min(100%, 74rem)` menjadi kisaran `79rem`

### Task 2: Verifikasi

**Files:**
- Modify: none unless adjustment kecil dibutuhkan

**Step 1: Run build frontend**

Run: `pnpm build`
Expected: sukses tanpa error
