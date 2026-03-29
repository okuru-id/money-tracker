export type KpiEventName =
  | 'open_add'
  | 'submit_success'
  | 'submit_fail'
  | 'time_to_submit_ms'
  | 'type_switch_before_submit'

type KpiEventPayload = {
  amount?: number
  categoryId?: string
  durationMs?: number
  errorCode?: string
  errorMessage?: string
  retryMode?: boolean
  switchedToType?: 'debit' | 'credit'
}

type AnalyticsEvent = {
  event: KpiEventName
  timestamp: string
} & KpiEventPayload

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
    gtag?: (...args: unknown[]) => void
  }
}

export function trackKpiEvent(eventName: KpiEventName, payload: KpiEventPayload = {}): void {
  const event: AnalyticsEvent = {
    event: eventName,
    timestamp: new Date().toISOString(),
    ...payload,
  }

  if (typeof window === 'undefined') {
    return
  }

  window.dataLayer?.push(event)
  window.gtag?.('event', eventName, payload)

  if (import.meta.env.DEV) {
    console.info('[analytics]', event)
  }
}
