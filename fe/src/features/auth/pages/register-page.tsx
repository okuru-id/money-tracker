import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconEye, IconEyeOff } from '@tabler/icons-react'

import { usePageSeo } from '../../../lib/seo'
import { ApiError, register } from '../api'

export function RegisterPage() {
  usePageSeo({
    title: 'Daftar dompetku.id | Buat akun catat keuangan keluarga',
    description:
      'Buat akun dompetku.id untuk mulai mencatat pemasukan, pengeluaran, dan keuangan keluarga dalam satu aplikasi yang simpel.',
    path: '/register',
    robots: 'noindex,follow',
  })

  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await register({ name, email, password })

      navigate('/login', {
        replace: true,
        state: {
          prefillEmail: email,
          message: 'Account created successfully. Please log in to continue.',
        },
      })
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Network error. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-screen auth-screen--split" aria-labelledby="register-title">
      <div className="auth-screen__brand">
        <div className="auth-screen__brand-inner">
          <div className="auth-screen__brand-logo">
            <span className="auth-screen__brand-mark">D</span>
            <span className="auth-screen__brand-name">dompetku.id</span>
          </div>

          <div className="auth-screen__brand-copy">
            <h2 className="auth-screen__brand-title">Mulai perjalanan keuangan keluarga Anda.</h2>
            <p className="auth-screen__brand-desc">Buat akun gratis dan langsung mulai mencatat — tanpa kartu kredit, tanpa batasan waktu.</p>
          </div>

          <div className="auth-screen__brand-features">
            <div className="auth-screen__brand-feature">
              <svg className="auth-screen__brand-check" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="10" fill="rgba(255,255,255,0.15)" />
                <path d="M6 10.5l2.5 2.5 5.5-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Setup cuma 30 detik</span>
            </div>
            <div className="auth-screen__brand-feature">
              <svg className="auth-screen__brand-check" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="10" fill="rgba(255,255,255,0.15)" />
                <path d="M6 10.5l2.5 2.5 5.5-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Langsung bisa invite anggota keluarga</span>
            </div>
            <div className="auth-screen__brand-feature">
              <svg className="auth-screen__brand-check" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="10" fill="rgba(255,255,255,0.15)" />
                <path d="M6 10.5l2.5 2.5 5.5-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Data aman & terenkripsi</span>
            </div>
          </div>

          <div className="auth-screen__brand-quote">
            <p>&ldquo;Daftar cuma sebentar, langsung bisa pakai. Simpel banget!&rdquo;</p>
            <span>— Pengguna baru dompetku.id</span>
          </div>
        </div>
      </div>

      <div className="auth-screen__main">
        <div className="auth-screen__main-inner">
          <div className="auth-screen__mobile-brand">
            <span className="auth-screen__brand-mark">D</span>
            <span className="auth-screen__brand-name">dompetku.id</span>
          </div>

          <div className="auth-screen__main-header">
            <h1 id="register-title">Buat akun baru</h1>
            <p className="auth-screen__description">Isi data di bawah untuk mulai mencatat keuangan keluarga Anda.</p>
          </div>

          {errorMessage ? <p className="auth-screen__error">{errorMessage}</p> : null}

          <div className="auth-screen__form-card">
            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-form__field">
                <span>Nama</span>
                <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
              </label>

              <label className="auth-form__field">
                <span>Email</span>
                <input
                  autoComplete="email"
                  inputMode="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>

              <label className="auth-form__field">
                <span>Password</span>
                <div className="auth-form__password">
                  <input
                    autoComplete="new-password"
                    type={showPassword ? 'text' : 'password'}
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-form__password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                  </button>
                </div>
              </label>

              <button className="auth-form__submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Membuat akun...' : 'Daftar'}
              </button>
            </form>

            <p className="auth-screen__switch">
              Sudah punya akun? <Link to="/login">Masuk di sini</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
