import { useState } from 'react'

import {
  dismissPwaInstallPrompt,
  type PwaInstallPromptOutcome,
  promptPwaInstall,
  usePwaInstallPromptState,
} from '../lib/pwa-install'

export function PwaInstallPrompt() {
  const { isAvailable, isDismissedForSession, isIOS } = usePwaInstallPromptState()
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  if (isIOS) {
    return (
      <section className="pwa-install-prompt" aria-live="polite">
        <div className="pwa-install-prompt__copy">
          <p className="pwa-install-prompt__title">Install Money Tracker App</p>
          <p className="pwa-install-prompt__description">
            Tap the <strong>Share</strong> button, then tap <strong>Add to Home Screen</strong>.
          </p>
        </div>

        <div className="pwa-install-prompt__actions">
          <button
            type="button"
            className="pwa-install-prompt__button pwa-install-prompt__button--secondary"
            onClick={handleDismiss}
          >
            Later
          </button>
          <div className="pwa-install-prompt__ios-hint" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="pwa-install-prompt" aria-live="polite" aria-busy={isSubmitting}>
      <div className="pwa-install-prompt__copy">
        <p className="pwa-install-prompt__title">Install Money Tracker App</p>
        <p className="pwa-install-prompt__description">
          Add to home screen for faster access and a native app experience.
        </p>
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
