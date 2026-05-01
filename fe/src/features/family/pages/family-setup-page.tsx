import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ApiError } from '../../auth/api'
import { consumeIntendedPath, setFamilySkipped, updateFamilyContext } from '../../auth/session-store'
import { createFamily } from '../api'

function resolvePostFamilyPath(): string {
  const intendedPath = consumeIntendedPath()

  if (!intendedPath) {
    return '/'
  }

  if (intendedPath === '/login' || intendedPath === '/register') {
    return '/'
  }

  return intendedPath
}

export function FamilySetupPage() {
  const navigate = useNavigate()
  const [familyName, setFamilyName] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleSkip() {
    setFamilySkipped()
    navigate('/settings', { replace: true })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const family = await createFamily(familyName)
      updateFamilyContext({ hasFamily: true, familyId: family.id })
      navigate(resolvePostFamilyPath(), { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Failed to create family. Please try again later.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-screen auth-screen--split" aria-labelledby="family-setup-title">
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
              <span>Dashboard ringkasan bersama seluruh keluarga</span>
            </div>
            <div className="auth-screen__brand-feature">
              <svg className="auth-screen__brand-check" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="10" fill="rgba(255,255,255,0.15)" />
                <path d="M6 10.5l2.5 2.5 5.5-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Pantau saldo, pemasukan &amp; pengeluaran tiap member</span>
            </div>
            <div className="auth-screen__brand-feature">
              <svg className="auth-screen__brand-check" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="10" fill="rgba(255,255,255,0.15)" />
                <path d="M6 10.5l2.5 2.5 5.5-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Ringkasan bulanan otomatis per anggota</span>
            </div>
            <div className="auth-screen__brand-feature">
              <svg className="auth-screen__brand-check" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="10" fill="rgba(255,255,255,0.15)" />
                <path d="M6 10.5l2.5 2.5 5.5-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Invite anggota keluarga via token</span>
            </div>
          </div>

          <div className="auth-screen__brand-quote">
            <p>&ldquo;Sekeluarga sekarang bisa pantau pengeluaran dari satu tempat. Praktis banget.&rdquo;</p>
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
            <h1 id="family-setup-title">Buat ruang keluarga</h1>
            <p className="auth-screen__description">Buat Family untuk mulai mencatat dan berbagi transaksi dengan anggota keluarga Anda.</p>
          </div>

          {errorMessage ? <p className="auth-screen__error">{errorMessage}</p> : null}

          <div className="auth-screen__form-card">
            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-form__field">
                <span>Family name</span>
                <input
                  value={familyName}
                  onChange={(event) => setFamilyName(event.target.value)}
                  placeholder="Example: Ardi Family"
                  required
                />
              </label>

              <button className="auth-form__submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Create family'}
              </button>
            </form>

            <p className="auth-screen__switch">
              Have an invite token? <Link to="/family/join">Join here</Link>
            </p>

            <button className="auth-screen__skip" type="button" onClick={handleSkip}>
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
