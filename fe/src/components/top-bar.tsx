import { useNavigate } from 'react-router-dom'
import { IconPower, IconX } from '@tabler/icons-react'
import { useState, type ReactNode } from 'react'

import { useSessionState, setSessionUnauthenticated } from '../features/auth/session-store'
import { logout, ApiError } from '../features/auth/api'
import { showToast } from '../lib/toast'

type TopBarProps = {
  title?: ReactNode
}

export function TopBar({ title }: TopBarProps) {
  const navigate = useNavigate()
  const session = useSessionState()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  if (session.status !== 'authenticated' || !session.user) {
    return null
  }

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      await logout()
      setSessionUnauthenticated()
      navigate('/login', { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        showToast({ title: 'Logout failed', description: error.message, type: 'error' })
      } else {
        showToast({ title: 'Logout failed', description: 'Please try again.', type: 'error' })
      }
    } finally {
      setIsLoggingOut(false)
      setShowLogoutConfirm(false)
    }
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar__left">
          {title && <div className="topbar__title">{title}</div>}
        </div>
        <div className="topbar__right">
          <span className="topbar__email">{session.user.email}</span>
          {session.isAdmin && <span className="topbar__badge">Admin</span>}
          <button
            className="topbar__logout"
            onClick={() => setShowLogoutConfirm(true)}
            aria-label="Logout"
          >
            <IconPower size={18} />
          </button>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal__header">
              <h3>Logout</h3>
              <button
                className="modal__close"
                onClick={() => setShowLogoutConfirm(false)}
                aria-label="Close"
              >
                <IconX size={18} />
              </button>
            </div>
            <div className="modal__body">
              <p>Apakah Anda yakin ingin keluar?</p>
            </div>
            <div className="modal__footer">
              <button
                className="modal__button modal__button--secondary"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Batal
              </button>
              <button
                className="modal__button modal__button--danger"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Keluar...' : 'Keluar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}