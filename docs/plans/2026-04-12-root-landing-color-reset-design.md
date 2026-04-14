# Root Landing Color Reset Design

**Tanggal:** 2026-04-12

## Tujuan

Mereset sistem warna landing page `/` ke hirarki yang jauh lebih ketat agar tampilan tidak lagi terasa berantakan antar section, card, dan panel.

## Masalah yang Diselesaikan

Beberapa iterasi polish sebelumnya menambah terlalu banyak tone dark dan light. Secara lokal beberapa panel terlihat menarik, tetapi secara keseluruhan halaman kehilangan disiplin visual. Masalah utamanya bukan pada satu section tertentu, melainkan pada terlalu banyak warna aktif yang saling berdekatan dan saling menimpa.

Akibatnya:

- section light terlihat tidak satu keluarga
- section dark terlihat seperti kumpulan navy yang tidak punya hirarki jelas
- efficiency dan testimonial terasa aneh karena berada di tengah sistem yang tidak ketat
- keseluruhan landing kehilangan rasa premium yang bersih

## Scope

- Mengurangi jumlah tone aktif pada landing page
- Menyatukan section middle ke satu family light yang konsisten
- Menyatukan dark sections penutup ke satu family dark yang konsisten
- Membatasi accent/dark variant hanya untuk card khusus yang benar-benar perlu
- Tidak mengubah struktur markup landing page

## Sistem Warna Baru

Landing reset ke sistem **3-level hierarchy**:

### 1. Dark base

Dipakai untuk:

- hero
- stats
- CTA closing
- footer

Semua area ini harus terasa satu stack penutup/pembuka yang konsisten.

### 2. Light base

Dipakai untuk:

- feature
- precision shell
- efficiency
- testimonial

Semua middle sections harus terlihat satu keluarga visual yang sama.

### 3. Accent surfaces

Dipakai terbatas untuk:

- dashboard card hero
- transfer card
- visa card
- floating precision card

Accent surfaces tidak boleh menjadi sistem warna baru. Mereka hanya aksen untuk depth, bukan identitas section terpisah.

## Aturan Desain

- jangan tambah warna literal baru per section
- card light harus memakai satu language surface yang sama
- card dark harus memakai satu language surface yang sama
- perbedaan antar section dibangun lewat layout, content, dan depth ringan, bukan melalui banyak warna baru
- testimonial dan efficiency harus ikut family light, bukan tampak seperti eksperimen visual sendiri

## Dampak Implementasi

- Perubahan terpusat di `fe/src/styles/global.css`
- Fokus utama adalah menghapus override yang berlebihan dan menormalkan kembali section/card ke sistem yang lebih sederhana
- `landing-page.tsx` tidak perlu diubah lagi untuk masalah warna ini

## Verifikasi

- seluruh middle sections terasa satu keluarga visual
- stack dark bagian atas dan bawah terasa konsisten
- accent cards tetap memberi depth tanpa memecah sistem warna
- efficiency dan testimonial tidak lagi terasa menyimpang
- `pnpm build`

## Catatan

- Dokumen ini menggantikan arah polish sebelumnya yang terlalu granular
- Tidak dibuat commit karena user belum meminta commit
