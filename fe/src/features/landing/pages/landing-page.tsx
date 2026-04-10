import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const navItems = ['About', 'Solutions', 'Product', 'Company', 'Insight']

const trustedLogos = ['Framer', 'TuneIn', 'OpenAI']

const featureCards = [
  {
    title: 'Credit control',
    description: 'Atur cashflow rumah tangga dan bisnis kecil dalam satu sistem yang tetap mudah dibaca.',
  },
  {
    title: 'Management',
    description: 'Lihat income, expense, dan ritme pengeluaran tanpa perlu membongkar laporan yang rumit.',
  },
  {
    title: 'Application',
    description: 'Pakai mobile flow yang cepat untuk mencatat transaksi harian kapan pun dibutuhkan.',
  },
]

const precisionCards = [
  {
    eyebrow: 'Growth signal',
    title: 'Defend your cashflow accurately',
    stat: '87,000',
    note: 'new users joined this month',
  },
  {
    eyebrow: 'Asset safety',
    title: 'Secure your assets precisely',
    stat: '70%',
    note: 'monthly target completed',
  },
  {
    eyebrow: 'Savings pulse',
    title: 'Your savings precisely',
    stat: 'Rp 234,98jt',
    note: 'available balance across accounts',
  },
]

const transferPoints = ['Access 24/7 customer support', 'Track transactions in real time']

const efficiencyPoints = ['Loan and credit visibility', 'Multi-account and family finance tracking']

const stats = [
  { value: '234M', label: 'Supporting currencies' },
  { value: '768K', label: 'Active users' },
  { value: '5.0', label: 'Average rating' },
  { value: '$8.8B', label: 'Managed revenue' },
]

const footerLinks = {
  quick: ['Home', 'About', 'Services'],
  products: ['AI Assistant', 'Mobile App', 'Credit Card'],
  company: ['Privacy Policy', 'Support', 'Terms'],
}

export function LandingPage() {
  useEffect(() => {
    document.body.classList.add('landing-route')

    return () => {
      document.body.classList.remove('landing-route')
    }
  }, [])

  return (
    <main className="landing-page landing-page--moneyhub-flat">
      <section className="landing-shell landing-shell--hero">
        <header className="landing-navbar">
          <Link className="landing-navbar__brand" to="/">
            <span className="landing-navbar__brand-mark">M</span>
            <span>Money Tracker</span>
          </Link>

          <nav className="landing-navbar__menu" aria-label="Landing navigation">
            {navItems.map((item) => (
              <span key={item} className="landing-navbar__menu-link">
                {item}
              </span>
            ))}
          </nav>

          <div className="landing-navbar__actions">
            <Link className="landing-navbar__login" to="/login">
              Login
            </Link>
            <Link className="landing-navbar__signup" to="/register">
              Sign up
            </Link>
          </div>
        </header>

        <section className="landing-moneyhub-hero">
          <div className="landing-moneyhub-hero__copy">
            <p className="landing-moneyhub-hero__eyebrow">Modern family finance</p>
            <h1 className="landing-moneyhub-hero__title">Best solution for your money flow and daily business decisions.</h1>
            <p className="landing-moneyhub-hero__description">
              Dipakai untuk mencatat transaksi lebih cepat, menjaga saldo tetap jelas, dan membuat keputusan keuangan rumah tangga lebih tenang.
            </p>

            <div className="landing-moneyhub-hero__cta-row">
              <Link className="landing-moneyhub-hero__cta landing-moneyhub-hero__cta--primary" to="/register">
                Open account
              </Link>
              <Link className="landing-moneyhub-hero__cta landing-moneyhub-hero__cta--secondary" to="/login">
                Login dashboard
              </Link>
            </div>
          </div>

          <div className="landing-moneyhub-hero__visual" aria-hidden="true">
            <div className="landing-dashboard-card landing-dashboard-card--main">
              <div className="landing-dashboard-card__topline">
                <span className="landing-dashboard-card__badge">Business overview</span>
                <span className="landing-dashboard-card__status">Secure sync</span>
              </div>

              <div className="landing-dashboard-card__balance">
                <p>Total balance</p>
                <strong>Rp 128.450.000</strong>
                <span>Income Rp 84.200.000 · Expense Rp 21.340.000</span>
              </div>

              <div className="landing-dashboard-card__graph">
                <span className="landing-dashboard-card__graph-line" />
              </div>

              <div className="landing-dashboard-card__footer-grid">
                <article>
                  <p>Cash reserve</p>
                  <strong>Rp 24.9jt</strong>
                </article>
                <article>
                  <p>New users</p>
                  <strong>80K</strong>
                </article>
              </div>
            </div>

            <article className="landing-floating-stat landing-floating-stat--rating">
              <p>Rating</p>
              <strong>4.9</strong>
              <span>2.6k+ feedback</span>
            </article>

            <article className="landing-floating-stat landing-floating-stat--users">
              <p>New users</p>
              <strong>80K</strong>
              <span>this quarter</span>
            </article>

            <article className="landing-floating-chart">
              <p>Realtime graph</p>
              <div className="landing-floating-chart__bars">
                <span />
                <span />
                <span />
                <span />
              </div>
            </article>
          </div>
        </section>

        <div className="landing-trusted-strip" aria-label="Trusted by">
          <span className="landing-trusted-strip__label">Trusted by teams using</span>
          <div className="landing-trusted-strip__logos">
            {trustedLogos.map((logo) => (
              <span key={logo} className="landing-trusted-strip__logo">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-shell landing-shell--light landing-feature-grid" aria-label="Core features">
        {featureCards.map((feature) => (
          <article key={feature.title} className="landing-feature-card">
            <p className="landing-feature-card__eyebrow">Feature</p>
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </article>
        ))}
      </section>

      <section className="landing-shell landing-shell--split landing-precision" aria-label="Investment precision">
        <div className="landing-section-copy">
          <p className="landing-section-copy__eyebrow">Precision finance</p>
          <h2>Protect your investments with exacting precision.</h2>
          <p>
            Dashboard dibuat supaya angka utama tetap terbaca, tren cepat tertangkap, dan ruang keluarga tetap punya konteks finansial yang rapi.
          </p>
        </div>

        <div className="landing-precision-grid">
          <article className="landing-precision-card landing-precision-card--dark">
            <p className="landing-precision-card__eyebrow">{precisionCards[0].eyebrow}</p>
            <h3>{precisionCards[0].title}</h3>
            <strong>{precisionCards[0].stat}</strong>
            <span>{precisionCards[0].note}</span>
          </article>

          <article className="landing-precision-card landing-precision-card--light">
            <p className="landing-precision-card__eyebrow">{precisionCards[1].eyebrow}</p>
            <h3>{precisionCards[1].title}</h3>
            <div className="landing-precision-card__progress">
              <span>70%</span>
            </div>
            <span>{precisionCards[1].note}</span>
          </article>

          <article className="landing-precision-card landing-precision-card--floating">
            <p className="landing-precision-card__eyebrow">{precisionCards[2].eyebrow}</p>
            <h3>{precisionCards[2].title}</h3>
            <strong>{precisionCards[2].stat}</strong>
            <span>{precisionCards[2].note}</span>
          </article>
        </div>
      </section>

      <section className="landing-shell landing-shell--dark landing-transfer" aria-label="Money transfer">
        <div className="landing-section-copy landing-section-copy--light">
          <p className="landing-section-copy__eyebrow">Operations</p>
          <h2>Let&apos;s start sending your money with less friction.</h2>
          <div className="landing-checklist">
            {transferPoints.map((item) => (
              <p key={item} className="landing-checklist__item">
                {item}
              </p>
            ))}
          </div>
        </div>

        <div className="landing-transfer__visual" aria-hidden="true">
          <article className="landing-transfer-card">
            <p className="landing-transfer-card__eyebrow">Transfer panel</p>
            <strong>Rp 9.450.000</strong>
            <span>Transfer berhasil ke 12 tujuan hari ini</span>
          </article>
          <div className="landing-transfer-map">
            <span className="landing-transfer-map__dot landing-transfer-map__dot--one" />
            <span className="landing-transfer-map__dot landing-transfer-map__dot--two" />
            <span className="landing-transfer-map__dot landing-transfer-map__dot--three" />
          </div>
        </div>
      </section>

      <section className="landing-shell landing-shell--light landing-efficiency" aria-label="Banking efficiency">
        <div className="landing-efficiency__visual" aria-hidden="true">
          <div className="landing-efficiency-user-card">
            <div className="landing-efficiency-user-card__avatar">MJ</div>
            <div>
              <p>Primary account</p>
              <strong>Rp 1.234.000</strong>
            </div>
          </div>
          <article className="landing-efficiency-visa-card">
            <p>Money Tracker Visa</p>
            <strong>•••• 2348</strong>
          </article>
        </div>

        <div className="landing-section-copy">
          <p className="landing-section-copy__eyebrow">Efficiency</p>
          <h2>Save your time and money with a cleaner financial workflow.</h2>
          <div className="landing-checklist landing-checklist--light">
            {efficiencyPoints.map((item) => (
              <p key={item} className="landing-checklist__item">
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-shell landing-shell--light landing-testimonial" aria-label="Customer testimonial">
        <div className="landing-section-copy">
          <p className="landing-section-copy__eyebrow">Testimonial</p>
          <h2>What our customer said about the product.</h2>
        </div>

        <article className="landing-testimonial-card">
          <div className="landing-testimonial-card__person">
            <div className="landing-testimonial-card__avatar">DJ</div>
            <div>
              <strong>David Johnson</strong>
              <p>Founder, retail operations</p>
            </div>
          </div>
          <blockquote>
            &ldquo;Saya suka karena dashboard-nya terasa tenang, tidak ribut, dan angka penting langsung terlihat saat saya buka aplikasi.&rdquo;
          </blockquote>
          <div className="landing-testimonial-card__footer">
            <span>★★★★★</span>
            <span className="landing-testimonial-card__nav-label">Customer story</span>
          </div>
        </article>
      </section>

      <section className="landing-shell landing-shell--stats landing-stats" aria-label="Product stats">
        {stats.map((item) => (
          <article key={item.label} className="landing-stat-card">
            <strong>{item.value}</strong>
            <p>{item.label}</p>
          </article>
        ))}
      </section>

      <section className="landing-shell landing-shell--cta landing-download-cta">
        <div className="landing-section-copy landing-section-copy--light">
          <p className="landing-section-copy__eyebrow">Get started</p>
          <h2>Boost your business and family finance with one cleaner system.</h2>
          <p>Mulai dengan app yang cepat dipakai, mudah dipahami, dan tetap terlihat premium di setiap layar.</p>
          <div className="landing-download-cta__actions">
            <Link className="landing-download-cta__button landing-download-cta__button--primary" to="/register">
              Create account
            </Link>
            <Link className="landing-download-cta__button landing-download-cta__button--secondary" to="/login">
              Login now
            </Link>
          </div>
        </div>

        <div className="landing-download-cta__visual" aria-hidden="true">
          <article className="landing-download-phone">
            <p>Money Tracker App</p>
            <strong>Secure mobile banking flow</strong>
            <span>Daily balance, transfers, and family sync</span>
          </article>
        </div>
      </section>

      <footer className="landing-shell landing-shell--footer landing-footer">
        <div className="landing-footer__brand">
          <Link className="landing-navbar__brand" to="/">
            <span className="landing-navbar__brand-mark">M</span>
            <span>Money Tracker</span>
          </Link>
          <p>Platform keuangan digital untuk mencatat transaksi, memantau saldo, dan mengelola arus kas keluarga dengan lebih rapi.</p>
        </div>

        <form
          className="landing-footer__newsletter"
          onSubmit={(event) => {
            event.preventDefault()
          }}
        >
          <label htmlFor="landing-newsletter">Newsletter</label>
          <div className="landing-footer__newsletter-row">
            <input id="landing-newsletter" type="email" placeholder="Enter your email" />
            <button type="submit">Subscribe</button>
          </div>
        </form>

        <div className="landing-footer__links">
          <div>
            <p>Quick Links</p>
            {footerLinks.quick.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div>
            <p>Products</p>
            {footerLinks.products.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div>
            <p>Company</p>
            {footerLinks.company.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <div className="landing-footer__socials" aria-label="Social links">
          <span>Facebook</span>
          <span>Twitter</span>
          <span>Instagram</span>
        </div>
      </footer>
    </main>
  )
}
