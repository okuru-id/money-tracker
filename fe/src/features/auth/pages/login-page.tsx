import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { IconEye, IconEyeOff } from '@tabler/icons-react'

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
        setErrorMessage('Terjadi kendala jaringan. Coba lagi sebentar.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-screen" aria-labelledby="login-title">
      <div className="auth-screen__panel">
        <p className="page-card__eyebrow">Money Tracker</p>
        <h1 id="login-title">Masuk ke akun kamu</h1>
        <p className="auth-screen__description">Pantau saldo keluarga dan catat transaksi harian tanpa pindah aplikasi.</p>

        {locationState.message ? <p className="auth-screen__notice">{locationState.message}</p> : null}
        {errorMessage ? <p className="auth-screen__error">{errorMessage}</p> : null}

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
                tabIndex={-1}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
              </button>
            </div>
          </label>

          <button className="auth-form__submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="auth-screen__switch">
          Belum punya akun? <Link to="/register">Daftar sekarang</Link>
        </p>
      </div>
    </section>
  )
}
