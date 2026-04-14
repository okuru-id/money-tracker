# Root Landing Page Design

**Tanggal:** 2026-04-10

## Tujuan

Menambahkan landing page publik di route `/` tanpa memindahkan route utama aplikasi. Guest yang membuka `/` akan melihat landing page publik, sementara user yang sudah login tetap langsung masuk ke app home di `/`.

## Masalah yang Diselesaikan

Saat ini aplikasi tidak memiliki landing page publik aktif. Root `/` langsung dipakai oleh app setelah login, dan `App.tsx` yang masih berisi template Vite tidak terhubung ke pengalaman pengguna sebenarnya. Akibatnya, tidak ada entry marketing/public yang rapi untuk guest tanpa mengubah URL utama aplikasi.

## Scope

- Menambah landing page publik baru untuk guest di `/`
- Mempertahankan `/` sebagai app home untuk user yang sudah login
- Tidak mengubah route internal utama seperti `/add`, `/history`, `/insights`, `/settings`
- Tidak menambah API call baru untuk landing page

## Arah Solusi

### Routing

Route `/` akan menjadi entry cerdas berdasarkan status session:

- guest: render `LandingPage`
- authenticated + has family: render `MobileShell` dengan `HomePage` sebagai index seperti sekarang
- authenticated + belum punya family: tetap mengikuti alur gate family yang sudah ada

Pendekatan ini menjaga URL tetap bersih dan tidak memaksa user login berpindah ke path lain seperti `/app`.

### Arsitektur

- Tambah feature baru: `fe/src/features/landing/pages/landing-page.tsx`
- Tambah gate/root wrapper khusus untuk route `/` agar routing guest vs authenticated tetap eksplisit di level router
- Styling landing page tetap memakai `fe/src/styles/global.css` supaya bahasa visual menyatu dengan redesign yang sudah ada

## Struktur Landing Page

### Hero section

- headline besar yang menjelaskan value utama Money Tracker
- subheadline singkat dengan konteks family finance dan quick tracking
- CTA utama ke `register`
- CTA sekunder ke `login`
- preview card visual yang konsisten dengan bahasa desain baru

### Value highlights

Tiga kartu ringkas:

- catat transaksi cepat
- pantau insight dan saldo
- kelola family dalam satu dashboard

### Preview section

- simulasi visual ringan dari home, history, dan insights
- tidak memakai data backend, hanya statis untuk menunjukkan bentuk pengalaman produk

### Workflow section

- tiga langkah singkat: daftar, buat/join family, mulai tracking

### Footer CTA

- penguat CTA terakhir ke `register` atau `login`

## Arah Visual

- Tetap satu bahasa dengan redesign app: teal gelap, warm orange, off-white, rounded cards, shadow lembut
- Nuansa lebih publik/marketing, tetapi tidak terasa seperti landing page generik SaaS
- Mobile-first, lalu desktop diberi layout lebih lebar dan lebih editorial

## Data dan Perilaku

- Landing page tidak fetch data
- CTA hanya navigasi ke route existing
- Tidak ada perubahan pada auth API, session store, atau flow onboarding

## Verifikasi

- Guest membuka `/` melihat landing page
- User login dengan family membuka `/` melihat app home
- Flow onboarding yang sudah ada tetap berfungsi
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`

## Catatan Implementasi

- Jangan gunakan `App.tsx` sebagai landing page aktif; aplikasi saat ini sudah berbasis router
- Ubah router dengan hati-hati agar tidak merusak gate `FamilyRequiredGate` dan `NoFamilyOnlyGate`
- Tidak perlu dependency baru

## Revisi Visual Landing Page

### Latar Belakang Revisi

Landing page awal sudah berfungsi untuk guest di `/`, tetapi secara visual masih terasa terlalu generik dan belum memiliki daya tarik setara referensi. Hero copy terlalu aman, preview card terlalu abstrak, dan fold pertama belum memberi focal point yang kuat saat dibuka di desktop.

### Arah Visual Final

Landing page direvisi ke arah **modern fintech bold** dengan fokus utama pada **hero yang lebih dramatis**.

Revisi akhir berikutnya: landing tetap mempertahankan komposisi hero yang berani, tetapi seluruh treatment visualnya dipindahkan ke gaya **flat premium tanpa gradient** agar konsisten dengan seluruh app.

Prinsip visual yang disepakati:

- headline lebih besar, lebih singkat, dan lebih percaya diri
- CTA utama lebih dominan dan langsung terlihat
- mockup/preview produk menjadi pusat visual utama di fold pertama
- kontras visual ditingkatkan tanpa keluar dari palette teal gelap, warm orange, dan off-white
- semua surface utama, CTA, dan panel gelap memakai warna solid, bukan gradient
- desktop terasa premium dan lapang, bukan sekadar versi mobile yang dibesarkan

### Struktur Section Final

#### 1. Hero dramatis

- eyebrow kecil untuk branding/product context
- headline besar 2-3 baris yang langsung menjual value utama
- subcopy singkat, tidak bertele-tele
- CTA utama ke `register`
- CTA sekunder ke `login`
- cluster mockup dashboard/app yang dominan di sisi visual utama

#### 2. Value strip singkat

- tiga poin nilai utama dalam format ringkas
- berfungsi sebagai penguat pesan hero, bukan section panjang

#### 3. Product showcase

- preview aplikasi yang lebih realistis dan terasa seperti produk yang benar-benar dipakai
- tidak lagi mengandalkan kartu abstrak kecil sebagai elemen utama

#### 4. Benefit cards

- tiga kartu benefit dengan copy lebih tajam
- fokus pada speed, visibility, dan family collaboration

#### 5. Closing CTA

- penutup sederhana namun kuat
- tetap menekankan jalur `register` sebagai aksi utama

### Pedoman UX dan Responsiveness

- scroll harus tetap natural di desktop dan mobile
- fold pertama harus tetap kuat tanpa membuat layout terasa sesak
- hierarchy visual harus jelas: hero -> value strip -> product showcase -> benefits -> CTA akhir
- jumlah elemen visual dikurangi bila tidak memperkuat pesan utama

### Dampak Implementasi

- perubahan utama akan terpusat di `fe/src/features/landing/pages/landing-page.tsx`
- styling landing di `fe/src/styles/global.css` perlu ditata ulang agar hero dan showcase lebih kuat di desktop
- routing guest/authenticated di `/` tidak berubah; revisi ini murni peningkatan presentasi visual landing page
- gradient pada background landing, hero, CTA, dan showcase perlu diganti ke solid fills yang lebih bersih

## Revisi Visual Landing Page v2

### Latar Belakang Revisi

Setelah arah `flat premium tanpa gradient` disepakati untuk seluruh frontend, user meminta landing page mengikuti referensi landing fintech modern ala MoneyHub. Prompt referensi memiliki karakter dark SaaS, dashboard-like, trust-building, dan sangat marketing-driven. Karena keputusan terbaru tetap melarang gradient, landing perlu dirombak ulang agar menangkap kesan MoneyHub tanpa memakai gradient sama sekali.

### Arah Visual Final v2

Landing page masuk ke arah **dark fintech flat**.

Prinsip visual:

- hero memakai background gelap solid dengan subtle grid/pattern non-gradient
- CTA utama memakai hijau terang solid
- kartu dashboard memakai dark panel dan light panel solid dengan rounded radius besar
- hierarchy dibangun lewat kontras, layering, border, spacing, dan shadow, bukan gradient
- nuansa keseluruhan terasa seperti landing SaaS fintech premium, tetapi tetap relevan untuk product Money Tracker

### Adaptasi Referensi ke Money Tracker

Referensi MoneyHub tidak akan disalin mentah. Yang diadaptasi adalah rasa visual dan struktur marketing-nya:

- navbar marketing yang lebih lengkap
- hero dua kolom dengan dashboard cluster yang dominan
- deretan logo trust
- section benefits dan metrics yang lebih enterprise
- CTA akhir yang terasa seperti promosi aplikasi modern

Konten tetap harus menjual Money Tracker, bukan mengganti brand atau positioning produk menjadi bank digital.

### Struktur Landing Page Final v2

#### 1. Navbar marketing

- logo produk di kiri
- menu navigasi marketing di tengah
- CTA `Login` dan `Sign up` di kanan

#### 2. Hero dark fintech

- headline besar bergaya enterprise fintech
- subcopy singkat dan meyakinkan
- CTA utama dan sekunder
- visual kanan berupa cluster dashboard, stat card, dan mini chart card
- trust logos di bawah hero copy

#### 3. Features grid

- tiga kartu fitur utama dengan bahasa singkat
- fokus pada pencatatan, visibility, dan kontrol arus kas

#### 4. Precision / investment-style section

- section berisi kombinasi dark card dan light card
- menampilkan summary statistik, growth signal, dan savings/balance UI
- tujuan utamanya memberi kesan financial control yang presisi

#### 5. Money transfer / operations section

- copy section + checklist value
- visual transaction/transfer panel di sisi lain

#### 6. Banking efficiency / workflow section

- satu visual lifestyle/product block
- satu area copy tentang efisiensi, tracking, dan akun multi-konteks keluarga

#### 7. Testimonial section

- satu testimonial card utama dengan layout premium
- navigasi arrow sebagai elemen visual saja jika perlu

#### 8. Stats strip

- empat metric utama untuk memberi kesan skala dan kepercayaan

#### 9. CTA akhir

- promo download/register dengan smartphone mockup dan copy ringkas

#### 10. Footer

- brand summary
- newsletter input
- grouped links
- social icons

### Pedoman UX dan Responsiveness v2

- mobile-first tetap dijaga, tetapi desktop harus terasa seperti landing marketing modern, bukan app screen
- hero dan dashboard cluster harus collapse dengan rapi di mobile
- CTA penting tetap mudah dijangkau di layar kecil
- tidak ada gradient sama sekali di landing page maupun stylesheet global

### Dampak Implementasi v2

- `fe/src/features/landing/pages/landing-page.tsx` perlu direstrukturisasi cukup besar
- `fe/src/styles/global.css` perlu blok landing baru yang lebih mirip sistem section marketing daripada shell app biasa
- route logic tetap tidak berubah

## Polish Pass

Setelah implementasi struktur utama selesai, dilakukan polish pass dengan arah **balanced refinement**.

Fokus polish:

- hero dibuat sedikit lebih lega dan tidak terlalu padat
- ritme vertikal antar section/card dirapikan agar landing terasa lebih premium
- CTA akhir diperkuat sebagai momen penutup
- footer dirapikan agar struktur newsletter, links, dan socials terasa lebih bersih

Polish ini tidak mengubah arsitektur landing atau route behavior; hanya memperhalus hierarchy, spacing, density, dan emphasis visual.

## Rebranding

Brand frontend diubah dari `Money Tracker` menjadi `dompetku.id` untuk seluruh surface yang terlihat user.

Scope rebrand:

- landing page
- login/register
- shell title/app title
- settings copy yang menyebut nama produk
- title HTML dan manifest PWA

Rebrand ini bersifat UI/product naming. Nama repo, struktur folder, dan detail teknis internal tidak perlu diubah bila tidak terlihat user.
