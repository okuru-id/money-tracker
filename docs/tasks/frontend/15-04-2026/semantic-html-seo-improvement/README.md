# SEO Audit Overview

## Tujuan

Mengoptimalkan SEO halaman publik `/', '/login', '/register'` pada frontend `dompetku.id` tanpa menambah dependency baru dan tanpa mengubah arsitektur SPA yang ada.

## Scope

- metadata default di `fe/index.html`
- SEO helper route-level untuk halaman publik
- JSON-LD untuk landing page
- `robots.txt` dan `sitemap.xml`
- perbaikan image loading, canonical URL, robots policy, dan heading hierarchy

## Hasil Utama

- title dan meta description kini spesifik untuk halaman publik
- landing page memiliki canonical, Open Graph, Twitter Card, dan structured data
- login dan register diberi `noindex,follow`
- `robots.txt` dan `sitemap.xml` ditambahkan untuk crawler
- hero image landing diprioritaskan untuk LCP, background image dibuat lazy

## File yang Diubah

- `fe/index.html`
- `fe/src/lib/seo.ts`
- `fe/src/features/landing/pages/landing-page.tsx`
- `fe/src/features/auth/pages/login-page.tsx`
- `fe/src/features/auth/pages/register-page.tsx`
- `fe/public/robots.txt`
- `fe/public/sitemap.xml`

## Verifikasi

- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
