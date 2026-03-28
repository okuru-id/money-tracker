# History Edit Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memunculkan kembali tombol edit pada semua item history non-legacy untuk user yang sedang login, termasuk saat field owner dari API kosong.

**Architecture:** Perbaikan dibatasi pada frontend history page dengan menyesuaikan logika `canEdit` agar lebih toleran terhadap data ownership yang tidak lengkap. Komponen `TransactionItem` tetap menjadi presenter tombol edit, sementara keputusan izin edit tetap terpusat di `HistoryPage`.

**Tech Stack:** React, TypeScript, TanStack Query, Vite

---

### Task 1: Perbaiki logika izin edit history

**Files:**
- Modify: `fe/apps/web/src/features/history/pages/history-page.tsx`

- [ ] **Step 1: Tinjau logika `canEdit` saat ini**

Pastikan kondisi existing hanya mengizinkan edit ketika `transaction.createdByUserId === session.user.id` dan menolak semua item saat field creator kosong.

- [ ] **Step 2: Ubah fallback izin edit**

Implementasikan aturan berikut di `HistoryPage`:

```ts
const canEdit = !isLegacy && Boolean(session.user?.id) && (!transaction.createdByUserId || transaction.createdByUserId === session.user.id)
```

Acceptance behavior:
- transaksi legacy tetap read-only
- transaksi non-legacy editable bila `createdByUserId === session.user.id`
- transaksi non-legacy juga editable bila `createdByUserId` kosong sebagai fallback kompatibilitas
- transaksi non-legacy tetap tidak editable bila `createdByUserId` ada tetapi berbeda dari user login

- [ ] **Step 3: Verifikasi typecheck frontend**

Run: `pnpm --filter @money-tracker/web typecheck`

Expected: selesai tanpa error TypeScript.
