import { dismissToast, useToast } from './toast'

export function ToastViewport() {
  const toast = useToast()

  if (!toast) {
    return null
  }

  const typeClass = toast.type === 'error' ? 'toast--error' : 'toast--success'

  return (
    <section className={`toast ${typeClass}`} role="status" aria-live="polite">
      <div>
        <p className="toast__title">{toast.title}</p>
        {toast.description ? <p className="toast__description">{toast.description}</p> : null}
      </div>
      <div className="toast__actions">
        {toast.action ? (
          <button
            type="button"
            className="toast__button toast__button--action"
            onClick={() => {
              toast.action?.onClick()
              dismissToast()
            }}
          >
            {toast.action.label}
          </button>
        ) : null}
        <button type="button" className="toast__button" onClick={dismissToast}>
          Tutup
        </button>
      </div>
    </section>
  )
}
