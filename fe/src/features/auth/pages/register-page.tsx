import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconEye, IconEyeOff } from '@tabler/icons-react'

import { ApiError, register } from '../api'

export function RegisterPage() {
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
    <section className="auth-screen" aria-labelledby="register-title">
      <div className="auth-screen__panel">
        <div className="auth-screen__hero">
          <div className="auth-screen__hero-copy">
            <p className="page-card__eyebrow">dompetku.id</p>
            <h1 id="register-title">Buat akun baru untuk mulai tracking lebih rapi.</h1>
            <p className="auth-screen__description">Masuk ke app dengan tampilan baru, summary yang lebih jelas, dan flow keuangan keluarga yang lebih cepat dibuka.</p>
          </div>
          <div className="auth-screen__spotlight" aria-hidden="true">
            <p className="auth-screen__spotlight-label">Quick start</p>
            <strong className="auth-screen__spotlight-value">Daftar, buat family, lalu mulai catat transaksi</strong>
          </div>
        </div>

        {errorMessage ? <p className="auth-screen__error">{errorMessage}</p> : null}

        <div className="auth-screen__form-card">
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-form__field">
              <span>Name</span>
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
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                </button>
              </div>
            </label>

            <button className="auth-form__submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <p className="auth-screen__switch">
            Already have an account? <Link to="/login">Log in here</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
