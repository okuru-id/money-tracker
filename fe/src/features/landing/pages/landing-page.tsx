import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const navItems = ["Tentang", "Fitur", "Pricing", "FAQ"];

const problems = [
   "Pengeluaran sering tidak tercatat",
   "Lupa mencatat transaksi kecil",
   "Harus input manual yang ribet",
   "Sulit memantau keuangan keluarga",
];

const solutions = [
   "Catat transaksi otomatis dari email & notifikasi",
   "Scan struk belanja langsung jadi data",
   "Input transaksi lewat chat",
   "Kelola keuangan bersama keluarga",
];

const features = [
   {
      title: "AI Auto Tracking",
      desc: "Catat pemasukan & pengeluaran otomatis tanpa input manual.",
      icon: (
         <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         >
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <path d="M9 9h6v6H9z" />
            <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
         </svg>
      ),
   },
   {
      title: "Scan Struk",
      desc: "Ambil foto struk, AI langsung membaca dan mencatat transaksi.",
      icon: (
         <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
         </svg>
      ),
   },
   {
      title: "Chat Input",
      desc: "Tambah transaksi cukup lewat chat seperti ngobrol biasa.",
      icon: (
         <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
         </svg>
      ),
   },
   {
      title: "Family Sharing",
      desc: "Pantau dan kelola keuangan bersama anggota keluarga.",
      icon: (
         <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
         </svg>
      ),
   },
   {
      title: "Integrasi n8n",
      desc: "Automation workflow untuk berbagai sumber data keuangan.",
      icon: (
         <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
         </svg>
      ),
   },
];

const howItWorks = [
   {
      title: "Hubungkan Sumber",
      desc: "Koneksikan email, chat, atau gunakan input manual sesuai kebiasaanmu.",
   },
   {
      title: "Tangkap Data",
      desc: "AI membaca transaksi dari email masuk atau foto struk belanja.",
   },
   {
      title: "Olah Otomatis",
      desc: "Data dikategorikan dan dirapikan secara otomatis oleh AI.",
   },
   {
      title: "Pantau & Kontrol",
      desc: "Lihat laporan dan atur keuangan dengan mudah dari satu dashboard.",
   },
];

const useCases = [
   {
      title: "Untuk Keluarga",
      desc: "Kelola pengeluaran rumah tangga dalam satu dashboard bersama.",
      icon: (
         <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
         </svg>
      ),
   },
   {
      title: "Untuk Freelancer",
      desc: "Pantau pemasukan dari berbagai sumber dengan rapi dan terstruktur.",
      icon: (
         <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         >
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
         </svg>
      ),
   },
   {
      title: "Untuk Karyawan",
      desc: "Kontrol pengeluaran bulanan dan terapkan budgeting lebih disiplin.",
      icon: (
         <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         >
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
         </svg>
      ),
   },
];

const aiPoints = [
   "Membaca transaksi dari email secara otomatis",
   "Mengenali data dari foto struk",
   "Memahami input dari chat",
   "Mengurangi kebutuhan input manual",
];

const dashboardFeatures = [
   {
      label: "Grafik pemasukan & pengeluaran",
      desc: "Lihat tren keuangan dalam grafik visual yang mudah dipahami.",
   },
   {
      label: "Kategori transaksi otomatis",
      desc: "AI mengelompokkan transaksi ke kategori yang tepat.",
   },
   {
      label: "Ringkasan saldo",
      desc: "Pantau total saldo dari semua akun dalam satu tampilan.",
   },
   {
      label: "Riwayat transaksi lengkap",
      desc: "Telusuri setiap transaksi dengan filter tanggal dan kategori.",
   },
];

const heroPills = [
   {
      text: "Ribuan transaksi dicatat",
      icon: (
         <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
         >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="16" />
         </svg>
      ),
   },
   {
      text: "AI & automation",
      icon: (
         <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
         >
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <path d="M9 9h6v6H9z" />
            <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
         </svg>
      ),
   },
   {
      text: "Data aman & terenkripsi",
      icon: (
         <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
         >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
         </svg>
      ),
   },
];

const freePlanFeatures = [
   "Catat transaksi manual",
   "Scan struk terbatas",
   "Dashboard basic",
];
const proPlanFeatures = [
   "Auto tracking email",
   "AI advanced parsing",
   "Family sharing penuh",
   "Automation tanpa batas",
];

const faqs = [
   {
      question: "Apakah data saya aman?",
      answer:
         "Ya, semua data dienkripsi dan disimpan dengan aman. Kami tidak pernah menjual atau membagikan data pribadi kepada pihak ketiga.",
   },
   {
      question: "Bagaimana cara kerja AI-nya?",
      answer:
         "AI kami membaca dan memahami data dari email, foto struk, dan chat untuk mengekstrak informasi transaksi secara otomatis tanpa perlu input manual.",
   },
   {
      question: "Apakah bisa digunakan bersama keluarga?",
      answer:
         "Bisa. Kamu bisa mengundang anggota keluarga untuk mencatat transaksi bersama dalam satu akun dan memantau keuangan keluarga dari satu dashboard.",
   },
   {
      question: "Apakah harus input manual?",
      answer:
         "Tidak. Sebagian besar transaksi bisa tercatat otomatis melalui email, scan struk, atau chat. Input manual tetap tersedia sebagai pilihan.",
   },
];

const footerLinks = {
   product: ["Fitur", "Pricing", "Integrasi"],
   company: ["Tentang Kami", "Blog", "Kontak"],
   legal: ["Privacy Policy", "Terms of Service"],
};

export function LandingPage() {
   useEffect(() => {
      document.documentElement.classList.add("landing-route");
      document.body.classList.add("landing-route");
      const rootElement = document.getElementById("root");
      rootElement?.classList.add("landing-route");

      return () => {
         document.documentElement.classList.remove("landing-route");
         document.body.classList.remove("landing-route");
         rootElement?.classList.remove("landing-route");
      };
   }, []);

   return (
      <main className="landing-page landing-page--moneyhub-flat">
         {/* ── Hero ── */}
         <section className="landing-shell landing-shell--hero">
            <header className="landing-navbar">
               <Link className="landing-navbar__brand" to="/">
                  <span className="landing-navbar__brand-mark">D</span>
                  <span>dompetku.id</span>
               </Link>

               <nav
                  className="landing-navbar__menu"
                  aria-label="Landing navigation"
               >
                  {navItems.map((item) => (
                     <span key={item} className="landing-navbar__menu-link">
                        {item}
                     </span>
                  ))}
               </nav>

               <div className="landing-navbar__actions">
                  <Link className="landing-navbar__login" to="/login">
                     Masuk
                  </Link>
                  <Link className="landing-navbar__signup" to="/register">
                     Daftar
                  </Link>
               </div>
            </header>

            <section className="landing-moneyhub-hero">
               <div className="landing-moneyhub-hero__copy">
                  <h1 className="landing-moneyhub-hero__title">
                     SOLUSI TERBAIK UNTUK KEUANGAN ANDA
                  </h1>
                  <p className="landing-moneyhub-hero__description">
                     Bergabung dengan jutaan orang yang mempercayai kami untuk
                     pencatatan keuangan yang cepat dan aman.
                  </p>

                  <div className="landing-moneyhub-hero__cta-row">
                     <Link
                        className="landing-moneyhub-hero__cta landing-moneyhub-hero__cta--primary"
                        to="/register"
                     >
                        Buka Akun
                     </Link>
                  </div>

                  <div className="landing-hero-pills">
                     {heroPills.map((pill) => (
                        <span key={pill.text} className="landing-hero-pill">
                           <span
                              className="landing-hero-pill__icon"
                              aria-hidden="true"
                           >
                              {pill.icon}
                           </span>
                           {pill.text}
                        </span>
                     ))}
                  </div>
               </div>
               <div
                  className="landing-moneyhub-hero__visual"
                  aria-hidden="true"
               >
                  <div className="landing-moneyhub-hero__square">
                     <div className="landing-moneyhub-hero__top-section">
                        <div className="landing-hero-stat landing-hero-stat--rating">
                           <div className="landing-hero-stat__score">
                              <strong>4.9</strong>
                              <span className="landing-hero-stat__star">★</span>
                           </div>
                           <p>2.6K+ Umpan Balik Positif</p>
                        </div>

                        <div className="landing-hero-stat landing-hero-stat--growth">
                           <p className="landing-hero-stat__label">
                              Pengguna Baru
                           </p>
                           <div className="landing-hero-stat__growth-row">
                              <strong>80K</strong>
                              <span className="landing-hero-stat__growth">
                                 <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                 >
                                    <path
                                       d="M5 15l7-7 7 7"
                                       stroke="currentColor"
                                       strokeWidth="2.5"
                                       strokeLinecap="round"
                                       strokeLinejoin="round"
                                    />
                                 </svg>
                                 +18%
                              </span>
                           </div>
                        </div>
                     </div>

                     <div className="landing-hero-bg-circles">
                        <span className="landing-hero-bg-circle landing-hero-bg-circle--1" />
                        <span className="landing-hero-bg-circle landing-hero-bg-circle--2" />
                     </div>

                     <div className="landing-moneyhub-hero__photo-area">
                        <img
                           className="landing-moneyhub-hero__photo"
                           src="/hero-person.png"
                           alt=""
                        />
                     </div>
                  </div>
               </div>
            </section>
         </section>

         {/* ── 1. Problem & Solution ── */}
         <section
            className="landing-shell landing-shell--light landing-ps"
            aria-label="Masalah dan solusi"
         >
            <div className="landing-section-copy landing-section-copy--centered">
               <p className="landing-section-copy__eyebrow">Masalah & Solusi</p>
               <h2>Kenapa Mengelola Keuangan Itu Sulit?</h2>
            </div>
            <div className="landing-ps__grid">
               <div className="landing-ps__col landing-ps__col--before">
                  <p className="landing-ps__col-label">Sebelum</p>
                  {problems.map((p) => (
                     <div
                        key={p}
                        className="landing-ps__item landing-ps__item--problem"
                     >
                        <span
                           className="landing-ps__mark landing-ps__mark--x"
                           aria-hidden="true"
                        >
                           <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                           >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                           </svg>
                        </span>
                        <span>{p}</span>
                     </div>
                  ))}
               </div>
               <div className="landing-ps__col landing-ps__col--after">
                  <p className="landing-ps__col-label">Dengan dompetku.id</p>
                  {solutions.map((s) => (
                     <div
                        key={s}
                        className="landing-ps__item landing-ps__item--solution"
                     >
                        <span
                           className="landing-ps__mark landing-ps__mark--check"
                           aria-hidden="true"
                        >
                           <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                           >
                              <polyline points="20 6 9 17 4 12" />
                           </svg>
                        </span>
                        <span>{s}</span>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* ── 2. Fitur Unggulan ── */}
         <section
            className="landing-shell landing-shell--light landing-features"
            aria-label="Fitur unggulan"
         >
            <div className="landing-section-copy landing-section-copy--centered">
               <p className="landing-section-copy__eyebrow">Fitur Unggulan</p>
               <h2>Semua yang Kamu Butuhkan</h2>
               <p>
                  Dari pencatatan manual hingga otomasi AI — semua ada dalam
                  satu aplikasi.
               </p>
            </div>
            <div className="landing-features__grid">
               {features.map((f) => (
                  <article key={f.title} className="landing-feat-card">
                     <div
                        className="landing-feat-card__icon"
                        aria-hidden="true"
                     >
                        {f.icon}
                     </div>
                     <h3 className="landing-feat-card__title">{f.title}</h3>
                     <p className="landing-feat-card__desc">{f.desc}</p>
                  </article>
               ))}
            </div>
         </section>

         {/* ── 3. Cara Kerja ── */}
         <section
            className="landing-shell landing-shell--light landing-hiw"
            aria-label="Cara kerja"
         >
            <div className="landing-section-copy landing-section-copy--centered">
               <p className="landing-section-copy__eyebrow">Cara Kerja</p>
               <h2>Dari Input Hingga Laporan dalam 4 Langkah</h2>
               <p>
                  Tidak perlu setup rumit. Dalam hitungan menit, keuanganmu
                  sudah mulai terpantau.
               </p>
            </div>
            <div className="landing-hiw__steps">
               {howItWorks.map((step, index) => (
                  <div key={step.title} className="landing-hiw__step">
                     <span className="landing-hiw__num">
                        {String(index + 1).padStart(2, "0")}
                     </span>
                     <h3 className="landing-hiw__title">{step.title}</h3>
                     <p className="landing-hiw__desc">{step.desc}</p>
                  </div>
               ))}
            </div>
         </section>

         {/* ── 4. Use Case ── */}
         <section
            className="landing-shell landing-shell--light landing-uc"
            aria-label="Untuk siapa"
         >
            <div className="landing-section-copy landing-section-copy--centered">
               <p className="landing-section-copy__eyebrow">Untuk Siapa?</p>
               <h2>Cocok untuk Berbagai Kebutuhan</h2>
               <p>
                  Baik untuk keluarga, freelancer, maupun karyawan — dompetku.id
                  siap membantu.
               </p>
            </div>
            <div className="landing-uc__grid">
               {useCases.map((uc) => (
                  <article key={uc.title} className="landing-uc-card">
                     <div className="landing-uc-card__icon" aria-hidden="true">
                        {uc.icon}
                     </div>
                     <h3 className="landing-uc-card__title">{uc.title}</h3>
                     <p className="landing-uc-card__desc">{uc.desc}</p>
                  </article>
               ))}
            </div>
         </section>

         {/* ── 5. Keunggulan AI ── */}
         <section
            className="landing-shell landing-shell--light landing-ai"
            aria-label="Keunggulan AI"
         >
            <div className="landing-ai__layout">
               <div className="landing-section-copy">
                  <p className="landing-section-copy__eyebrow">Keunggulan AI</p>
                  <h2>Keuangan yang Bekerja untuk Kamu</h2>
                  <p>
                     Teknologi AI yang kami gunakan dirancang khusus untuk
                     memahami dan memproses data keuangan sehari-hari.
                  </p>
               </div>
               <div className="landing-ai__side">
                  <ul className="landing-ai__points">
                     {aiPoints.map((point) => (
                        <li key={point} className="landing-ai__point">
                           <span
                              className="landing-ai__point-dot"
                              aria-hidden="true"
                           />
                           {point}
                        </li>
                     ))}
                  </ul>
                  <blockquote className="landing-ai__quote">
                     Fokus ke hidup, bukan ke catatan keuangan.
                  </blockquote>
               </div>
            </div>
         </section>

         {/* ── 6. Dashboard Preview ── */}
         <section
            className="landing-shell landing-shell--light landing-dash"
            aria-label="Tampilan dashboard"
         >
            <div className="landing-section-copy landing-section-copy--centered">
               <p className="landing-section-copy__eyebrow">
                  Tampilan Dashboard
               </p>
               <h2>Semua dalam Satu Pandangan</h2>
               <p>
                  Dashboard yang bersih dan ringkas — dirancang agar kamu cepat
                  paham kondisi keuangan hari ini.
               </p>
            </div>
            <div className="landing-dash__grid">
               {dashboardFeatures.map((f) => (
                  <article key={f.label} className="landing-dash-card">
                     <span
                        className="landing-dash-card__dot"
                        aria-hidden="true"
                     />
                     <h3 className="landing-dash-card__label">{f.label}</h3>
                     <p className="landing-dash-card__desc">{f.desc}</p>
                  </article>
               ))}
            </div>
         </section>

         {/* ── 7. Pricing ── */}
         <section
            className="landing-shell landing-shell--light landing-pricing"
            aria-label="Harga"
         >
            <div className="landing-section-copy landing-section-copy--centered">
               <p className="landing-section-copy__eyebrow">Pricing</p>
               <h2>Mulai Gratis, Upgrade Kapan Saja</h2>
               <p>
                  Tidak ada biaya tersembunyi. Mulai dengan plan gratis dan
                  upgrade saat kamu siap.
               </p>
            </div>
            <div className="landing-pricing__grid">
               <article className="landing-pricing-card">
                  <div className="landing-pricing-card__head">
                     <h3>Free</h3>
                     <strong className="landing-pricing-card__price">
                        Rp 0
                     </strong>
                     <span className="landing-pricing-card__period">
                        Gratis selamanya
                     </span>
                  </div>
                  <ul className="landing-pricing-card__list">
                     {freePlanFeatures.map((f) => (
                        <li key={f}>
                           <span
                              className="landing-pricing-card__check"
                              aria-hidden="true"
                           />
                           {f}
                        </li>
                     ))}
                  </ul>
                  <Link
                     className="landing-pricing-card__btn landing-pricing-card__btn--primary"
                     to="/register"
                  >
                     Mulai Gratis
                  </Link>
               </article>
               <article className="landing-pricing-card landing-pricing-card--pro">
                  <div className="landing-pricing-card__head">
                     <div className="landing-pricing-card__name-row">
                        <h3>Pro</h3>
                        <span className="landing-pricing-card__badge">
                           Coming Soon
                        </span>
                     </div>
                     <strong className="landing-pricing-card__price landing-pricing-card__price--muted">
                        —
                     </strong>
                     <span className="landing-pricing-card__period">
                        Segera hadir
                     </span>
                  </div>
                  <ul className="landing-pricing-card__list">
                     {proPlanFeatures.map((f) => (
                        <li key={f}>
                           <span
                              className="landing-pricing-card__check"
                              aria-hidden="true"
                           />
                           {f}
                        </li>
                     ))}
                  </ul>
                  <button
                     className="landing-pricing-card__btn landing-pricing-card__btn--disabled"
                     disabled
                  >
                     Segera Hadir
                  </button>
               </article>
            </div>
         </section>

         {/* ── 9. FAQ ── */}
         <LandingFaq />

         {/* ── 10. Final CTA ── */}
         <section
            className="landing-shell landing-shell--light landing-final-cta"
            aria-label="Ajakan bertindak"
         >
            <div className="landing-final-cta__card">
               <p className="landing-section-copy__eyebrow">Mulai hari ini</p>
               <h2>Mulai Kelola Keuangan Tanpa Ribet</h2>
               <p>
                  Kelola pemasukan, pengeluaran, dan aset dalam satu tempat.
                  Gratis selamanya.
               </p>
               <div className="landing-final-cta__actions">
                  <Link
                     className="landing-final-cta__btn landing-final-cta__btn--primary"
                     to="/register"
                  >
                     Coba Sekarang Gratis
                  </Link>
               </div>
            </div>
         </section>

         {/* ── Footer ── */}
         <footer className="landing-shell landing-shell--footer landing-footer">
            <div className="landing-footer__brand">
               <Link className="landing-navbar__brand" to="/">
                  <span className="landing-navbar__brand-mark">D</span>
                  <span>dompetku.id</span>
               </Link>
               <p>
                  Aplikasi pencatatan keuangan berbasis AI & automation untuk
                  individu dan keluarga.
               </p>
            </div>

            <form
               className="landing-footer__newsletter"
               onSubmit={(e) => {
                  e.preventDefault();
               }}
            >
               <label htmlFor="landing-newsletter">Info terbaru</label>
               <div className="landing-footer__newsletter-row">
                  <input
                     id="landing-newsletter"
                     type="email"
                     placeholder="Masukkan email Anda"
                  />
                  <button type="submit">Langganan</button>
               </div>
            </form>

            <div className="landing-footer__links">
               <div>
                  <p>Produk</p>
                  {footerLinks.product.map((item) => (
                     <span key={item}>{item}</span>
                  ))}
               </div>
               <div>
                  <p>Perusahaan</p>
                  {footerLinks.company.map((item) => (
                     <span key={item}>{item}</span>
                  ))}
               </div>
               <div>
                  <p>Legal</p>
                  {footerLinks.legal.map((item) => (
                     <span key={item}>{item}</span>
                  ))}
               </div>
            </div>

            <div className="landing-footer__socials" aria-label="Sosial media">
               <span>Twitter</span>
               <span>LinkedIn</span>
               <span>GitHub</span>
            </div>

            <p className="landing-footer__copy">
               &copy; {new Date().getFullYear()} dompetku.id — All rights
               reserved.
            </p>
         </footer>
      </main>
   );
}

function LandingFaq() {
   const [openIndex, setOpenIndex] = useState<number | null>(null);

   function toggle(index: number) {
      setOpenIndex((prev) => (prev === index ? null : index));
   }

   return (
      <section
         className="landing-shell landing-shell--light landing-faq"
         aria-label="Pertanyaan umum"
      >
         <div className="landing-section-copy landing-section-copy--centered">
            <p className="landing-section-copy__eyebrow">FAQ</p>
            <h2>Pertanyaan yang Sering Ditanyakan</h2>
            <p>
               Tidak menemukan jawaban yang kamu cari? Hubungi kami kapan saja.
            </p>
         </div>

         <div className="landing-faq-list">
            {faqs.map((faq, index) => {
               const isOpen = openIndex === index;
               return (
                  <div
                     key={faq.question}
                     className={`landing-faq-item${isOpen ? " landing-faq-item--open" : ""}`}
                  >
                     <button
                        className="landing-faq-item__trigger"
                        aria-expanded={isOpen}
                        onClick={() => toggle(index)}
                     >
                        <span>{faq.question}</span>
                        <svg
                           className="landing-faq-item__chevron"
                           width="18"
                           height="18"
                           viewBox="0 0 24 24"
                           fill="none"
                           stroke="currentColor"
                           strokeWidth="2.5"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           aria-hidden="true"
                        >
                           <path d="M6 9l6 6 6-6" />
                        </svg>
                     </button>
                     <div
                        className="landing-faq-item__body"
                        aria-hidden={!isOpen}
                     >
                        <div className="landing-faq-item__body-inner">
                           <p>{faq.answer}</p>
                        </div>
                     </div>
                  </div>
               );
            })}
         </div>
      </section>
   );
}
