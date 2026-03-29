import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ApiError } from '../../auth/api'
import { consumeIntendedPath, setFamilySkipped, updateFamilyContext } from '../../auth/session-store'
import { createFamily } from '../api'
import { TopBar } from '../../../components/top-bar'

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
    <div className="family-setup-screen">
      <TopBar title="Family Setup" />
      <section className="auth-screen" aria-labelledby="family-setup-title">
        <div className="auth-screen__panel">
          <p className="auth-screen__description">
            Family is used as a shared context for transactions and monthly summaries.
          </p>

          {errorMessage ? <p className="auth-screen__error">{errorMessage}</p> : null}

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
      </section>
    </div>
  )
}
