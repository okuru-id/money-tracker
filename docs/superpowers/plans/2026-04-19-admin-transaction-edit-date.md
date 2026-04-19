# Admin Transaction Edit Date Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan kemampuan edit tanggal transaksi pada modal transaction admin yang dipakai oleh desktop dan mobile view.

**Architecture:** Perubahan dipusatkan di `fe/src/features/admin/pages/admin-page.tsx` karena modal edit transaksi admin, submit handler, dan entry point aksi edit desktop/mobile berada di file yang sama. Backend dan API wrapper tidak perlu diubah karena payload admin sudah mendukung `transaction_date`; implementasi hanya perlu menambahkan field tanggal, memastikan default value cocok untuk input browser, lalu mengirim field tersebut saat submit.

**Tech Stack:** React 19, TypeScript 5.9, TanStack Query, HTML form input date, Vite 8, pnpm

---

## File Map

- Modify: `fe/src/features/admin/pages/admin-page.tsx`
  Tanggung jawab: modal edit transaksi admin, parsing `FormData`, pengiriman payload mutation, dan UI yang dipakai bersama oleh desktop dan mobile action.
- Modify: `fe/src/features/admin/api.ts` (hanya jika diperlukan pada tahap implementasi)
  Tanggung jawab: sumber tipe `UpdateTransactionRequest` yang sudah mendukung `transaction_date`, untuk dipakai ulang di halaman admin bila implementasi memilih menghindari tipe inline lokal.
- Reference: `docs/superpowers/specs/2026-04-19-admin-transaction-edit-date-design.md`
  Tanggung jawab: acuan scope dan batas perubahan.

## Task 1: Tambahkan field tanggal ke modal edit transaksi admin

**Files:**
- Modify: `fe/src/features/admin/pages/admin-page.tsx`
- Reference: `fe/src/features/admin/api.ts`

- [ ] **Step 1: Audit bentuk data tanggal yang dipakai modal**

Baca bagian modal edit transaksi admin dan pastikan sumber default value berasal dari `editingTransaction.transaction_date`. Jika nilai yang diterima bisa berupa ISO datetime, normalisasi ke format `YYYY-MM-DD` sebelum diberikan ke input `type="date"`. Jika nilainya sudah berbentuk tanggal murni, pertahankan perubahan sekecil mungkin.

- [ ] **Step 2: Tambahkan field input tanggal di modal edit**

Tambahkan satu blok `form-field` baru pada modal edit transaksi admin:

```tsx
<div className="form-field">
  <label>Date</label>
  <input
    type="date"
    name="transaction_date"
    required
    defaultValue={resolvedTransactionDate}
  />
</div>
```

Tempatkan field ini di modal edit yang sama dengan field `amount` dan `note`, tanpa membuat modal atau form terpisah untuk desktop/mobile.

- [ ] **Step 3: Kirim `transaction_date` saat submit**

Perluas handler `onSubmit` modal edit transaksi agar membaca nilai tanggal dari `FormData` dan mengirimkannya ke mutation. Pada langkah yang sama, perbarui tipe payload mutation di `admin-page.tsx` agar `transaction_date` valid secara TypeScript. Pilih salah satu pendekatan paling kecil:

```tsx
type inline:
{ amount?: number; category_id?: string | null; note?: string; transaction_date?: string }
```

atau gunakan ulang `UpdateTransactionRequest` dari `fe/src/features/admin/api.ts` bila implementasinya tetap kecil dan konsisten.

Setelah tipe payload selaras, kirim nilai tanggal ke mutation:

```tsx
const transactionDate = formData.get('transaction_date') as string

updateTransactionMutation.mutate({
  txId: editingTransaction.id,
  data: {
    amount: isNaN(amount) ? undefined : amount,
    note: (formData.get('note') as string) || undefined,
    transaction_date: transactionDate || undefined,
  },
})
```

Pertahankan perilaku existing untuk `amount` dan `note`.

- [ ] **Step 4: Pastikan desktop dan mobile tetap memakai alur yang sama**

Konfirmasi bahwa action edit pada table desktop dan card mobile tetap hanya membuka modal edit yang sama:

```tsx
onEditTransaction={(tx) => {
  setEditingTransaction(tx)
  setShowEditTransactionModal(true)
}}
```

Tidak perlu menambah cabang UI baru selama kedua entry point tetap menuju modal yang sama.

## Task 2: Verifikasi perubahan frontend

**Files:**
- Verify: `fe/src/features/admin/pages/admin-page.tsx`

- [ ] **Step 1: Jalankan typecheck frontend**

Run: `pnpm typecheck`

Expected: sukses tanpa error TypeScript.

- [ ] **Step 2: Verifikasi manual alur desktop**

Verifikasi manual:

```text
Buka menu admin > transactions pada desktop.
Klik edit pada salah satu transaksi.
Pastikan modal menampilkan field Date.
Ubah tanggal lalu simpan.
Pastikan request mengirim transaction_date dan toast sukses tetap muncul.
```

- [ ] **Step 3: Verifikasi manual alur mobile**

Verifikasi manual:

```text
Buka menu admin > transactions pada mobile/card view.
Klik edit pada salah satu kartu transaksi.
Pastikan modal yang sama menampilkan field Date.
Ubah tanggal lalu simpan.
Pastikan perubahan tanggal ikut tersimpan.
```

- [ ] **Step 4: Verifikasi non-regresi**

Verifikasi manual:

```text
Edit amount tetap berfungsi.
Edit note tetap berfungsi.
Tidak ada perubahan backend.
Tidak ada UI edit ganda antara desktop dan mobile.
```

## Catatan Implementasi

- Jangan menambah test file atau test case baru karena user tidak meminta test.
- Jangan ubah `fe/src/features/admin/api.ts` kecuali saat implementasi ditemukan ketidaksesuaian nyata pada tipe payload.
- Jangan menambah dependency baru.
- Tidak perlu commit kecuali user meminta.
