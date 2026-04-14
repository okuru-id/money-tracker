import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { getPublicAbsoluteUrl, usePageSeo } from '../../../lib/seo'

const navItems = [
   { label: 'Tentang', href: '#tentang' },
   { label: 'Fitur', href: '#fitur' },
   { label: 'Pricing', href: '#pricing' },
   { label: 'FAQ', href: '#faq' },
]

const landingStructuredData = [
   {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'dompetku.id',
      url: getPublicAbsoluteUrl('/'),
      inLanguage: 'id-ID',
      description:
         'Aplikasi catat keuangan keluarga untuk memantau pemasukan, pengeluaran, scan struk, dan transaksi bersama dalam satu dashboard.',
   },
   {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'dompetku.id',
      url: getPublicAbsoluteUrl('/'),
      logo: getPublicAbsoluteUrl('/icons/android-chrome-512x512.png'),
      description:
         'Platform pencatatan keuangan keluarga dengan AI, scan struk, dan dashboard transaksi bersama.',
   },
]

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
   usePageSeo({
      title: 'dompetku.id | Aplikasi Catat Keuangan Keluarga dengan AI dan Scan Struk',
      description:
         'Catat pemasukan dan pengeluaran keluarga lebih cepat dengan dompetku.id. Gunakan scan struk, AI, dan dashboard bersama untuk memantau keuangan dari satu tempat.',
      path: '/',
      imagePath: '/hero-person.png',
      imageAlt:
         'Ilustrasi pengguna memantau pertumbuhan keuangan keluarga bersama dompetku.id',
      jsonLd: landingStructuredData,
   })

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
         <section id="tentang" className="landing-shell landing-shell--hero">
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
                      <a
                         key={item.label}
                         className="landing-navbar__menu-link"
                         href={item.href}
                      >
                         {item.label}
                      </a>
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
                          <img
                             className="landing-hero-bg-chart"
                             src="/bar-chart.png"
                             alt=""
                             loading="lazy"
                             decoding="async"
                          />
                         <span className="landing-hero-bg-circle landing-hero-bg-circle--1" />
                         <span className="landing-hero-bg-circle landing-hero-bg-circle--2" />
                      </div>

                     <div className="landing-moneyhub-hero__photo-area">
                         <img
                            className="landing-moneyhub-hero__photo"
                            src="/hero-person.png"
                            alt="Ilustrasi pengguna memantau pertumbuhan keuangan keluarga bersama dompetku.id"
                            loading="eager"
                            decoding="async"
                            fetchPriority="high"
                         />
                      </div>
                  </div>
               </div>
            </section>
         </section>

         {/* ── 1. Fitur Unggulan ── */}
         <section
            id="fitur"
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

         {/* ── 2. Cara Kerja ── */}
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

         {/* ── 3. Pricing ── */}
         <section
            id="pricing"
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

         {/* ── 4. FAQ ── */}
         <LandingFaq />

         {/* ── 5. Final CTA ── */}
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
         id="faq"
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
