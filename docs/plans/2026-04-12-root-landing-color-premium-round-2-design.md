# Root Landing Premium Color Round 2 Design

**Tanggal:** 2026-04-12

## Tujuan

Melakukan polish ronde kedua pada warna dan depth per section landing page `/` agar hasil premium tonal yang sudah dibuat terasa lebih editorial, lebih mahal, dan lebih disengaja pada level section, bukan hanya pada level palette.

## Masalah yang Diselesaikan

Polish pertama sudah merapikan hirarki warna global: dark tones lebih konsisten, light surfaces lebih halus, dan accent hijau lebih tenang. Namun secara visual, beberapa section masih terasa memakai treatment yang terlalu mirip satu sama lain.

Masalah yang tersisa bukan lagi ketidakkonsistenan warna dasar, tetapi kurangnya karakter section-level:

- feature grid masih terasa terlalu flat
- transfer dan precision belum punya pemisahan depth yang cukup kuat
- efficiency dan testimonial belum punya identitas tonal yang benar-benar terasa premium
- penutup stats + download CTA masih bisa dibuat lebih mahal lewat layering yang lebih sengaja

## Scope

- Menajamkan treatment warna dan surface pada section-section landing
- Tetap mempertahankan struktur markup landing page
- Tidak mengubah copy, CTA, routing, atau layout utama
- Fokus tetap CSS-only sejauh memungkinkan

## Arah Visual

Ronde kedua memakai arah **premium depth polish**.

Prinsipnya:

- hero dan endcap tetap menjadi anchor visual utama
- light sections dibedakan melalui nuansa paper/surface yang lebih editorial
- dark sections dibedakan lewat raised surfaces dan layering, bukan sekadar warna navy yang berbeda tipis
- tiap section harus punya rasa sendiri, tetapi tetap berada dalam satu sistem tonal yang sama

## Penerapan Per Section

### Feature grid

- Kartu fitur dibuat lebih seperti premium paper card
- Surface kartu dibuat sedikit berbeda dari shell light di bawahnya
- Hasil yang dicari: terasa bersih, tenang, dan refined, bukan sekadar card putih default

### Precision split

- Kontras antara kartu dark, light, dan floating ditingkatkan lewat depth yang lebih jelas
- Floating card harus terasa seperti accent surface, bukan hanya dark card yang kebetulan beda warna

### Transfer

- Transfer card dan map panel diberi hubungan visual yang lebih rapi
- Map panel perlu terasa seperti dark glass / operational panel yang lebih elegan

### Efficiency

- User card dibuat terasa seperti editorial finance summary card
- Visa card diberi treatment yang lebih premium daripada sekadar dark rectangle

### Testimonial

- Ini menjadi section light yang paling refined
- Surface, avatar badge, dan nav label dibuat lebih tenang dan polished

### Stats + download CTA

- Dark cards penutup dibuat punya depth yang lebih mahal
- Harus terasa seperti final premium stack, bukan pengulangan dark card yang sama dari atas halaman

## Dampak Implementasi

- Perubahan tetap terpusat di `fe/src/styles/global.css`
- Kemungkinan hanya perlu adjustment kecil pada CSS card dan panel internal
- Tidak perlu mengubah JSX kecuali jika ditemukan kebutuhan class tambahan yang sangat kecil

## Verifikasi

- Tiap section terasa punya karakter sendiri tanpa keluar dari palette premium tonal
- Light sections tidak terlihat datar atau terlalu mirip satu sama lain
- Dark sections penutup terasa lebih mahal daripada dark sections di tengah halaman
- `pnpm build`

## Catatan

- Dokumen ini melanjutkan design sebelumnya di `2026-04-12-root-landing-color-premium-design.md`
- Tidak dibuat commit untuk dokumen ini karena user belum meminta commit
