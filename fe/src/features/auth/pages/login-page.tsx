import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { IconEye, IconEyeOff } from '@tabler/icons-react'

import { usePageSeo } from '../../../lib/seo'
import { ApiError, login } from '../api'
import { consumeIntendedPath, setSessionAuthenticated } from '../session-store'

type LoginLocationState = {
  from?: string
  prefillEmail?: string
  message?: string
}

function isFamilyOnboardingPath(path: string): boolean {
  return path.startsWith('/family/setup') || path.startsWith('/family/join') || path.startsWith('/invite/')
}

function pickPostLoginPath(hasFamily: boolean, locationFrom?: string): string {
  const rememberedPath = consumeIntendedPath()
  const candidate = locationFrom ?? rememberedPath ?? '/'

  if (!hasFamily) {
    return isFamilyOnboardingPath(candidate) ? candidate : '/family/setup'
  }

  if (candidate === '/login' || candidate === '/register') {
    return '/'
  }

  return candidate
}

export function LoginPage() {
  usePageSeo({
    title: 'Login dompetku.id | Masuk ke dashboard keuangan keluarga',
    description:
      'Masuk ke dompetku.id untuk melanjutkan pencatatan keuangan keluarga, memantau saldo, dan mengelola transaksi dari satu dashboard.',
    path: '/login',
    robots: 'noindex,follow',
  })

  const navigate = useNavigate()
  const location = useLocation()
  const locationState = (location.state as LoginLocationState | undefined) ?? {}
  const [email, setEmail] = useState(locationState.prefillEmail ?? '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const result = await login({ email, password })
      setSessionAuthenticated(result.user, result.context)

      const destination = pickPostLoginPath(result.context.hasFamily, locationState.from)
      navigate(destination, { replace: true })
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
    <section className="auth-screen auth-screen--split" aria-labelledby="login-title">
      <div className="auth-screen__brand">
        <div className="auth-screen__brand-inner">
          <div className="auth-screen__brand-logo">
            <span className="auth-screen__brand-mark">D</span>
            <span className="auth-screen__brand-name">dompetku.id</span>
          </div>

          <div className="auth-screen__brand-copy">
            <h2 className="auth-screen__brand-title">Keuangan keluarga, dalam satu genggaman.</h2>
            <p className="auth-screen__brand-desc">Pantau saldo, catat transaksi, dan kelola budget keluarga — semuanya dari satu dashboard yang simpel.</p>
          </div>

          <div className="auth-screen__brand-features">
            <div className="auth-screen__brand-feature">
              <svg className="auth-screen__brand-check" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="10" fill="rgba(255,255,255,0.15)" />
                <path d="M6 10.5l2.5 2.5 5.5-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Input transaksi kurang dari 15 detik</span>
            </div>
            <div className="auth-screen__brand-feature">
              <svg className="auth-screen__brand-check" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="10" fill="rgba(255,255,255,0.15)" />
                <path d="M6 10.5l2.5 2.5 5.5-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Dashboard keluarga real-time</span>
            </div>
            <div className="auth-screen__brand-feature">
              <svg className="auth-screen__brand-check" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="10" fill="rgba(255,255,255,0.15)" />
                <path d="M6 10.5l2.5 2.5 5.5-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Gratis selamanya, tanpa iklan</span>
            </div>
          </div>

          <div className="auth-screen__brand-quote">
            <p>&ldquo;Akhirnya ada app keuangan yang nggak ribet. Sekeluarga sekarang pakai dompetku.&rdquo;</p>
            <span>— Pengguna dompetku.id</span>
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
            <h1 id="login-title">Masuk ke akun Anda</h1>
            <p className="auth-screen__description">Masukkan email dan password untuk melanjutkan ke dashboard.</p>
          </div>

          {locationState.message ? <p className="auth-screen__notice">{locationState.message}</p> : null}
          {errorMessage ? <p className="auth-screen__error">{errorMessage}</p> : null}

          <div className="auth-screen__form-card">
            <form className="auth-form" onSubmit={handleSubmit}>
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
                    autoComplete="current-password"
                    type={showPassword ? 'text' : 'password'}
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
                {isSubmitting ? 'Processing...' : 'Log in'}
              </button>
            </form>

            <p className="auth-screen__switch">
              Belum punya akun? <Link to="/register">Daftar sekarang</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
