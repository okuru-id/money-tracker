import { useState } from 'react'

import {
  dismissPwaInstallPrompt,
  type PwaInstallPromptOutcome,
  promptPwaInstall,
  usePwaInstallPromptState,
} from '../lib/pwa-install'

type PwaInstallPromptVariant = 'default' | 'desktop-sidebar'

type Props = {
  position: 'top' | 'bottom'
  variant?: PwaInstallPromptVariant
}

function InstallIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export function PwaInstallPrompt({ position, variant = 'default' }: Props) {
  const { isAvailable, isDismissedForSession, isIOS } = usePwaInstallPromptState()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const onTop = position === 'top'
  const isDesktopSidebar = variant === 'desktop-sidebar'

  if (!isAvailable || isDismissedForSession) {
    return null
  }

  async function handleInstall(): Promise<void> {
    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      const outcome: PwaInstallPromptOutcome = await promptPwaInstall()

      if (outcome === 'unavailable') {
        dismissPwaInstallPrompt()
      }
    } catch {
      dismissPwaInstallPrompt()
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleDismiss(): void {
    if (isSubmitting) {
      return
    }
    dismissPwaInstallPrompt()
  }

  const positionClass = onTop ? 'pwa-install-prompt--top' : 'pwa-install-prompt--bottom'
  const variantClass = isDesktopSidebar ? 'pwa-install-prompt--desktop-sidebar' : ''

  if (isDesktopSidebar) {
    return (
      <section
        className={`pwa-install-prompt ${positionClass} ${variantClass}`.trim()}
        aria-live="polite"
        aria-busy={isSubmitting}
      >
        <div className="pwa-install-prompt__desktop-header">
          <div className="pwa-install-prompt__desktop-heading">
            <div className="pwa-install-prompt__icon" aria-hidden="true">
              {isIOS ? <ShareIcon /> : <InstallIcon />}
            </div>
            <span className="pwa-install-prompt__desktop-badge">Install app</span>
          </div>
        </div>

        <div className="pwa-install-prompt__desktop-body">
          <div className="pwa-install-prompt__copy">
            <p className="pwa-install-prompt__title">
              {isIOS ? 'Add dompetku.id to your screen' : 'Install dompetku.id'}
            </p>
          </div>
        </div>

        <div className="pwa-install-prompt__actions">
          {isIOS ? null : (
            <button
              type="button"
              className="pwa-install-prompt__button pwa-install-prompt__button--primary"
              onClick={() => {
                void handleInstall()
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Install now'}
            </button>
          )}
          <button
            type="button"
            className="pwa-install-prompt__button pwa-install-prompt__button--secondary"
            onClick={handleDismiss}
            disabled={isSubmitting}
          >
            {isIOS ? 'Got it' : 'Maybe later'}
          </button>
        </div>
      </section>
    )
  }

  if (isIOS) {
    return (
      <section className={`pwa-install-prompt ${positionClass}`} aria-live="polite">
        <div className="pwa-install-prompt__icon" aria-hidden="true">
          <ShareIcon />
        </div>
        <div className="pwa-install-prompt__copy">
          <p className="pwa-install-prompt__title">Install App</p>
          <p className="pwa-install-prompt__description">
            Tap <strong>Share</strong> then <strong>Add to Home Screen</strong>.
          </p>
        </div>
        <button
          type="button"
          className="pwa-install-prompt__close"
          onClick={handleDismiss}
          aria-label="Dismiss"
        >
          <CloseIcon />
        </button>
      </section>
    )
  }

  return (
    <section className={`pwa-install-prompt ${positionClass}`} aria-live="polite" aria-busy={isSubmitting}>
      <div className="pwa-install-prompt__icon" aria-hidden="true">
        <InstallIcon />
      </div>
      <div className="pwa-install-prompt__copy">
        <p className="pwa-install-prompt__title">Install App</p>
        {onTop ? null : (
          <p className="pwa-install-prompt__description">
            Add to home screen for faster access.
          </p>
        )}
      </div>
      <div className="pwa-install-prompt__actions">
        <button
          type="button"
          className="pwa-install-prompt__button pwa-install-prompt__button--secondary"
          onClick={handleDismiss}
          disabled={isSubmitting}
        >
          Later
        </button>
        <button
          type="button"
          className="pwa-install-prompt__button pwa-install-prompt__button--primary"
          onClick={() => {
            void handleInstall()
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Install'}
        </button>
      </div>
    </section>
  )
}
