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
        setErrorMessage('Network error. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-screen" aria-labelledby="login-title">
      <div className="auth-screen__panel">
        <div className="auth-screen__hero">
          <div className="auth-screen__hero-copy">
            <p className="page-card__eyebrow">dompetku.id</p>
            <h1 id="login-title">Masuk ke dashboard keuangan yang terasa lebih ringan.</h1>
            <p className="auth-screen__description">Pantau saldo keluarga, catat transaksi harian, dan masuk ke flow pencatatan dalam beberapa tap saja.</p>
          </div>
          <div className="auth-screen__spotlight" aria-hidden="true">
            <p className="auth-screen__spotlight-label">Today flow</p>
            <strong className="auth-screen__spotlight-value">Saldo, transaksi, dan insight dalam satu layar</strong>
          </div>
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
                  tabIndex={-1}
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
            Don't have an account? <Link to="/register">Sign up now</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
