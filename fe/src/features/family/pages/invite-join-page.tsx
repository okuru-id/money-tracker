import { useMemo, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { ApiError } from '../../auth/api'
import { consumeIntendedPath, setFamilySkipped, updateFamilyContext } from '../../auth/session-store'
import { joinFamilyWithInviteToken } from '../api'
import { TopBar } from '../../../components/top-bar'

function resolvePostJoinPath(): string {
  const intendedPath = consumeIntendedPath()

  if (!intendedPath) {
    return '/'
  }

  if (intendedPath === '/login' || intendedPath === '/register') {
    return '/'
  }

  if (intendedPath.startsWith('/invite/') || intendedPath.startsWith('/family/join')) {
    return '/'
  }

  return intendedPath
}

export function InviteJoinPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams<{ token?: string }>()
  const queryToken = useMemo(() => new URLSearchParams(location.search).get('token') ?? '', [location.search])
  const initialToken = params.token ?? queryToken

  const [token, setToken] = useState(initialToken)
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
      const response = await joinFamilyWithInviteToken(token.trim())
      updateFamilyContext({ hasFamily: true, familyId: response.familyId })
      navigate(resolvePostJoinPath(), { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Failed to join family. Please try again later.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="family-setup-screen">
      <TopBar title="Family Join" />
      <section className="auth-screen" aria-labelledby="join-family-title">
        <div className="auth-screen__panel">
          <div className="auth-screen__hero">
            <div className="auth-screen__hero-copy">
              <p className="page-card__eyebrow">Join family</p>
              <h1 id="join-family-title">Masuk ke dashboard keluarga dengan invite token.</h1>
              <p className="auth-screen__description">Tempel token dari owner untuk langsung bergabung ke ruang keuangan bersama dan melihat transaksi yang sama.</p>
            </div>
            <div className="auth-screen__spotlight" aria-hidden="true">
              <p className="auth-screen__spotlight-label">One step</p>
              <strong className="auth-screen__spotlight-value">Join cepat tanpa setup ulang akun</strong>
            </div>
          </div>

          {errorMessage ? <p className="auth-screen__error">{errorMessage}</p> : null}

          <div className="auth-screen__form-card">
            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-form__field">
                <span>Invite token</span>
                <input
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  placeholder="Paste invite token here"
                  autoCapitalize="none"
                  autoCorrect="off"
                  required
                />
              </label>

              <button className="auth-form__submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Join family'}
              </button>
            </form>

            <p className="auth-screen__switch">
              Don't have a token? <Link to="/family/setup">Create your own family</Link>
            </p>

            <button className="auth-screen__skip" type="button" onClick={handleSkip}>
              Skip for now
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
