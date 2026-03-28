import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ApiError, logout } from '../../auth/api'
import { setSessionUnauthenticated, useSessionState } from '../../auth/session-store'
import { promptPwaInstall, usePwaInstallPromptState } from '../../../lib/pwa-install'

export function SettingsPage() {
  const navigate = useNavigate()
  const session = useSessionState()
  const { isAvailable: isPwaInstallAvailable, isInstalled: isPwaInstalled } = usePwaInstallPromptState()
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
        setErrorMessage('Gagal logout. Coba lagi beberapa saat lagi.')
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
      {showFamilySetupPrompt && (
        <div className="settings-page__family-prompt">
          <div className="settings-page__family-prompt-content">
            <p className="settings-page__family-prompt-title">Setup Keluarga</p>
            <p className="settings-page__family-prompt-description">
              Buat atau gabung keluarga untuk mulai mencatat transaksi dan melihat ringkasan keuangan.
            </p>
          </div>
          <div className="settings-page__family-prompt-actions">
            <Link to="/family/setup" className="settings-page__family-prompt-button">
              Buat Keluarga
            </Link>
            <Link to="/family/join" className="settings-page__family-prompt-link">
              Gabung dengan Token
            </Link>
          </div>
        </div>
      )}

      <div className="settings-page__menu" role="list" aria-label="Menu pengaturan">
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
              <p className="settings-menu-item__description">Akses fitur keluarga yang sebelumnya ada di tab Family.</p>
            </div>
            <span className="settings-menu-item__arrow" aria-hidden="true">
              ›
            </span>
          </Link>
        )}

        <div className="settings-menu-item settings-menu-item--muted" role="listitem" aria-disabled="true">
          <div>
            <p className="settings-menu-item__title">Account</p>
            <p className="settings-menu-item__description">Profil, keamanan, dan pengaturan akun personal.</p>
          </div>
          <span className="settings-soon-badge">Soon</span>
        </div>

        <div className="settings-menu-item settings-menu-item--muted" role="listitem" aria-disabled="true">
          <div>
            <p className="settings-menu-item__title">App Preferences</p>
            <p className="settings-menu-item__description">Bahasa, format angka, dan preferensi tampilan aplikasi.</p>
          </div>
          <span className="settings-soon-badge">Soon</span>
        </div>
      </div>

      <div className="settings-page__install-card">
        <div className="settings-page__install-copy">
          <div className="settings-page__install-heading-row">
            <p className="settings-page__install-title">Install aplikasi</p>
            {isPwaInstalled ? <span className="settings-installed-badge">Installed</span> : null}
          </div>
          <p className="settings-page__install-description">
            Simpan Money Tracker ke home screen supaya akses lebih cepat dan terasa seperti aplikasi native.
          </p>
          {!isPwaInstalled && !isPwaInstallAvailable ? (
            <p className="settings-page__install-hint">
              Jika tombol install belum tersedia, buka menu browser lalu pilih <strong>Install app</strong> atau{' '}
              <strong>Add to Home Screen</strong>.
            </p>
          ) : null}
        </div>

        {!isPwaInstalled ? (
          <button
            className="settings-page__install-button"
            type="button"
            onClick={() => {
              void handleInstallPwa()
            }}
            disabled={!isPwaInstallAvailable || isInstallingPwa}
            aria-busy={isInstallingPwa}
          >
            {isInstallingPwa ? 'Memproses install...' : isPwaInstallAvailable ? 'Install sekarang' : 'Tunggu prompt browser'}
          </button>
        ) : null}
      </div>

      <div className="settings-page__logout-card">
        <p className="settings-page__logout-title">Sesi akun</p>
        <p className="settings-page__logout-description">Keluar dari akun ini untuk menghentikan akses pada perangkat sekarang.</p>

        {errorMessage ? <p className="settings-page__error">{errorMessage}</p> : null}

        <button
          className="settings-page__logout-button"
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-busy={isLoggingOut}
        >
          {isLoggingOut ? 'Memproses logout...' : 'Logout'}
        </button>
      </div>
    </section>
  )
}
