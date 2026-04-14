import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ApiError, logout } from '../../auth/api'
import { setSessionUnauthenticated, useSessionState } from '../../auth/session-store'
import { promptPwaInstall, usePwaInstallPromptState } from '../../../lib/pwa-install'

export function SettingsPage() {
  const navigate = useNavigate()
  const session = useSessionState()
  const { isAvailable: isPwaInstallAvailable, isInstalled: isPwaInstalled, isIOS } = usePwaInstallPromptState()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isInstallingPwa, setIsInstallingPwa] = useState(false)

  const showFamilySetupPrompt = !session.hasFamily && session.familySkipped

  async function handleLogout() {
    setIsLoggingOut(true)
    setErrorMessage(null)

    try {
      await logout()
      setSessionUnauthenticated()
      navigate('/login', { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Failed to log out. Please try again later.')
      }
    } finally {
      setIsLoggingOut(false)
    }
  }

  async function handleInstallPwa() {
    if (isInstallingPwa || !isPwaInstallAvailable) {
      return
    }

    setIsInstallingPwa(true)

    try {
      await promptPwaInstall()
    } finally {
      setIsInstallingPwa(false)
    }
  }

  return (
    <section className="settings-page" aria-labelledby="settings-title">
      <header className="settings-page__header">
        <div>
          <p className="page-card__eyebrow">Settings</p>
          <h1 id="settings-title">Atur akses, family, dan app dari satu panel yang lebih rapi.</h1>
          <p>Semua kontrol penting tetap sama, hanya ditata ulang supaya terasa lebih ringan dan konsisten dengan tampilan baru.</p>
        </div>
        {session.user ? (
          <div className="settings-page__profile-chip">
            <strong>{session.user.name}</strong>
            <span>{session.user.email}</span>
          </div>
        ) : null}
      </header>

      {showFamilySetupPrompt && (
        <div className="settings-page__family-prompt">
          <div className="settings-page__family-prompt-content">
            <p className="settings-page__family-prompt-title">Family Setup</p>
            <p className="settings-page__family-prompt-description">
              Create or join a family to start tracking transactions and view financial summaries.
            </p>
          </div>
          <div className="settings-page__family-prompt-actions">
            <Link to="/family/setup" className="settings-page__family-prompt-button">
              Create Family
            </Link>
            <Link to="/family/join" className="settings-page__family-prompt-link">
              Join with Token
            </Link>
          </div>
        </div>
      )}

      <div className="settings-page__menu" role="list" aria-label="Settings menu">
        {session.isAdmin && (
          <Link className="settings-menu-item" to="/admin" role="listitem">
            <div>
              <p className="settings-menu-item__title">Admin Dashboard</p>
              <p className="settings-menu-item__description">Manage all transactions, families, and members.</p>
            </div>
            <span className="settings-menu-item__arrow" aria-hidden="true">
              ›
            </span>
          </Link>
        )}

        {session.hasFamily && (
          <Link className="settings-menu-item" to="/settings/family" role="listitem">
            <div>
              <p className="settings-menu-item__title">Family Management</p>
              <p className="settings-menu-item__description">Access family features that were previously in the Family tab.</p>
            </div>
            <span className="settings-menu-item__arrow" aria-hidden="true">
              ›
            </span>
          </Link>
        )}

        <div className="settings-menu-item settings-menu-item--muted" role="listitem" aria-disabled="true">
          <div>
            <p className="settings-menu-item__title">Account</p>
            <p className="settings-menu-item__description">Profile, security, and personal account settings.</p>
          </div>
          <span className="settings-soon-badge">Soon</span>
        </div>

        <div className="settings-menu-item settings-menu-item--muted" role="listitem" aria-disabled="true">
          <div>
            <p className="settings-menu-item__title">App Preferences</p>
            <p className="settings-menu-item__description">Language, number format, and display preferences.</p>
          </div>
          <span className="settings-soon-badge">Soon</span>
        </div>
      </div>

      <div className="settings-page__install-card">
        <div className="settings-page__install-copy">
          <div className="settings-page__install-heading-row">
            <p className="settings-page__install-title">Install App</p>
            {isPwaInstalled ? <span className="settings-installed-badge">Installed</span> : null}
          </div>
          <p className="settings-page__install-description">
            Save dompetku.id to your home screen for faster access and a native app experience.
          </p>
          {!isPwaInstalled && !isPwaInstallAvailable && !isIOS ? (
            <p className="settings-page__install-hint">
              If the install button is not available, open your browser menu and select <strong>Install app</strong> or{' '}
              <strong>Add to Home Screen</strong>.
            </p>
          ) : null}
          {!isPwaInstalled && isIOS ? (
            <p className="settings-page__install-hint">
              Tap the <strong>Share</strong> button in Safari, then tap <strong>Add to Home Screen</strong>.
            </p>
          ) : null}
        </div>

        {!isPwaInstalled ? (
          isIOS ? null : (
            <button
              className="settings-page__install-button"
              type="button"
              onClick={() => {
                void handleInstallPwa()
              }}
              disabled={!isPwaInstallAvailable || isInstallingPwa}
              aria-busy={isInstallingPwa}
            >
              {isInstallingPwa ? 'Installing...' : isPwaInstallAvailable ? 'Install now' : 'Waiting for browser prompt'}
            </button>
          )
        ) : null}
      </div>

      <div className="settings-page__logout-card">
        <p className="settings-page__logout-title">Account Session</p>
        <p className="settings-page__logout-description">Log out from this account to stop access on this device.</p>

        {errorMessage ? <p className="settings-page__error">{errorMessage}</p> : null}

        <button
          className="settings-page__logout-button"
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-busy={isLoggingOut}
        >
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </section>
  )
}
