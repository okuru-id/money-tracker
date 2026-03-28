import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ApiError, register } from '../api'

export function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
          message: 'Akun berhasil dibuat. Silakan login untuk lanjut.',
        },
      })
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
    <section className="auth-screen" aria-labelledby="register-title">
      <div className="auth-screen__panel">
        <p className="page-card__eyebrow">Money Tracker</p>
        <h1 id="register-title">Buat akun baru</h1>
        <p className="auth-screen__description">Mulai pencatatan keuangan keluarga dalam beberapa langkah singkat.</p>

        {errorMessage ? <p className="auth-screen__error">{errorMessage}</p> : null}

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
            <input
              autoComplete="new-password"
              type="password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <button className="auth-form__submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Membuat akun...' : 'Daftar'}
          </button>
        </form>

        <p className="auth-screen__switch">
          Sudah punya akun? <Link to="/login">Masuk di sini</Link>
        </p>
      </div>
    </section>
  )
}
