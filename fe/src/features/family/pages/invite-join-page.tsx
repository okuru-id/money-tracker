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
        setErrorMessage('Gagal bergabung ke family. Coba ulang beberapa saat lagi.')
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
          <p className="auth-screen__description">
            Masukkan token invite dari owner keluarga untuk langsung masuk ke dashboard bersama.
          </p>

          {errorMessage ? <p className="auth-screen__error">{errorMessage}</p> : null}

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-form__field">
              <span>Token invite</span>
              <input
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Tempel token invite di sini"
                autoCapitalize="none"
                autoCorrect="off"
                required
              />
            </label>

            <button className="auth-form__submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Memproses...' : 'Gabung keluarga'}
            </button>
          </form>

          <p className="auth-screen__switch">
            Belum punya token? <Link to="/family/setup">Buat keluarga sendiri</Link>
          </p>

          <button className="auth-screen__skip" type="button" onClick={handleSkip}>
            Lewati untuk sekarang
          </button>
        </div>
      </section>
    </div>
  )
}
