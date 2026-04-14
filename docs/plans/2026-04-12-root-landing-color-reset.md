# Root Landing Color Reset Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mereset warna landing page `/` ke sistem yang lebih ketat dan konsisten agar seluruh section terasa rapi, premium, dan tidak berantakan.

**Architecture:** Implementasi dilakukan dengan menyederhanakan `fe/src/styles/global.css`, bukan menambah override baru. Semua middle sections dipaksa masuk ke satu family light, semua dark anchors dipaksa masuk ke satu family dark, lalu hanya beberapa card khusus yang tetap memakai accent surface untuk depth.

**Tech Stack:** React 19, TypeScript 5.9, React Router 7, CSS global existing project

---

### Task 1: Sederhanakan token warna landing

**Files:**
- Modify: `fe/src/styles/global.css:4718-4821`

**Step 1: Pertahankan hanya token yang benar-benar dipakai**

- dark base
- light base
- light card
- accent surface
- accent primary
- text dark/light + muted

**Step 2: Hapus arah tone yang terlalu granular**

- kurangi tone dark literal yang tidak perlu
- kurangi tone light literal yang membuat section terlihat tidak satu keluarga

### Task 2: Satukan section-level background

**Files:**
- Modify: `fe/src/styles/global.css:4780-5007`

**Step 1: Satukan dark sections**

- `landing-shell--hero`, `landing-shell--stats`, `landing-shell--cta`, `landing-shell--footer` harus satu family dark yang sama

**Step 2: Satukan middle light sections**

- `landing-shell--light` dan `landing-shell--split` harus terasa satu family light yang sama
- hindari variasi section-level yang terlalu banyak

### Task 3: Satukan language card

**Files:**
- Modify: `fe/src/styles/global.css:5055-5475`

**Step 1: Samakan semua light card**

- `feature-card`, `testimonial-card`, `efficiency-user-card`, `precision-card--light` kembali ke language card light yang konsisten

**Step 2: Samakan semua dark accent card**

- `dashboard-card`, `transfer-card`, `visa-card`, `download-phone`, `stat-card`, `precision-card--dark`, `precision-card--floating` dibatasi ke sedikit variant yang konsisten

**Step 3: Rapikan teks dan border**

- pastikan light card memakai text light family
- pastikan dark card memakai text dark family
- hilangkan selector yang saling tabrakan

### Task 4: Verifikasi akhir

**Files:**
- Modify: file landing CSS terkait bila ada penyesuaian kecil setelah review visual

**Step 1: Run build**

Run: `pnpm build`
Expected: sukses tanpa error

**Step 2: Review diff**

Run: `git diff -- fe/src/styles/global.css fe/src/features/landing/pages/landing-page.tsx`
Expected: diff menunjukkan penyederhanaan sistem warna, bukan penambahan banyak override baru

## Catatan Eksekusi

- Jangan buat test file
- Jangan ubah markup landing kecuali benar-benar perlu
- Fokus pada simplifikasi sistem warna, bukan polish mikro per section
