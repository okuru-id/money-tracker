import { useState } from 'react'

import {
  dismissPwaInstallPrompt,
  type PwaInstallPromptOutcome,
  promptPwaInstall,
  usePwaInstallPromptState,
} from '../lib/pwa-install'

export function PwaInstallPrompt() {
  const { isAvailable, isDismissedForSession } = usePwaInstallPromptState()
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

  return (
    <section className="pwa-install-prompt" aria-live="polite" aria-busy={isSubmitting}>
      <div className="pwa-install-prompt__copy">
        <p className="pwa-install-prompt__title">Pasang aplikasi Money Tracker</p>
        <p className="pwa-install-prompt__description">
          Simpan di layar utama supaya buka lebih cepat dan terasa seperti aplikasi native.
        </p>
      </div>

      <div className="pwa-install-prompt__actions">
        <button
          type="button"
          className="pwa-install-prompt__button pwa-install-prompt__button--secondary"
          onClick={handleDismiss}
          disabled={isSubmitting}
        >
          Nanti
        </button>
        <button
          type="button"
          className="pwa-install-prompt__button pwa-install-prompt__button--primary"
          onClick={() => {
            void handleInstall()
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Memproses...' : 'Install'}
        </button>
      </div>
    </section>
  )
}
