import { useSyncExternalStore } from 'react'

const SESSION_DISMISS_KEY = 'money-tracker.pwa-install.dismissed'

export type PwaInstallPromptOutcome = 'accepted' | 'dismissed' | 'unavailable'

export type DeferredPwaInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

export type PwaInstallPromptState = {
  isAvailable: boolean
  isInstalled: boolean
  isDismissedForSession: boolean
  isIOS: boolean
}

let state: PwaInstallPromptState = {
  isAvailable: false,
  isInstalled: false,
  isDismissedForSession: false,
  isIOS: false,
}

let deferredPrompt: DeferredPwaInstallPromptEvent | null = null
let cleanupBrowserListeners: (() => void) | null = null
let initializeCount = 0

const listeners = new Set<() => void>()

function emitChange(): void {
  listeners.forEach((listener) => listener())
}

function setState(nextState: PwaInstallPromptState): void {
  state = nextState
  emitChange()
}

function patchState(partialState: Partial<PwaInstallPromptState>): void {
  setState({
    ...state,
    ...partialState,
  })
}

function readDismissedForSession(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    return window.sessionStorage.getItem(SESSION_DISMISS_KEY) === 'true'
  } catch {
    return false
  }
}

function writeDismissedForSession(isDismissed: boolean): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    if (isDismissed) {
      window.sessionStorage.setItem(SESSION_DISMISS_KEY, 'true')
      return
    }

    window.sessionStorage.removeItem(SESSION_DISMISS_KEY)
  } catch {
    return
  }
}

function detectStandaloneMode(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean
  }

  return (
    (typeof window.matchMedia === 'function' &&
      window.matchMedia('(display-mode: standalone)').matches) ||
    navigatorWithStandalone.standalone === true
  )
}

function detectIOS(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const ua = window.navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document)
}

function isDeferredPwaInstallPromptEvent(
  event: Event,
): event is DeferredPwaInstallPromptEvent {
  return (
    'prompt' in event &&
    typeof event.prompt === 'function' &&
    'userChoice' in event &&
    event.userChoice instanceof Promise
  )
}

function syncStateFromEnvironment(): void {
  const isInstalled = detectStandaloneMode()
  const isDismissedForSession = readDismissedForSession()
  const isIOS = detectIOS()

  patchState({
    isInstalled,
    isDismissedForSession,
    isIOS,
    isAvailable:
      (Boolean(deferredPrompt) || isIOS) && !isInstalled && !isDismissedForSession,
  })
}

function handleBeforeInstallPrompt(event: Event): void {
  if (!isDeferredPwaInstallPromptEvent(event)) {
    return
  }

  const deferredEvent = event

  deferredEvent.preventDefault()
  deferredPrompt = deferredEvent

  patchState({
    isAvailable: !state.isInstalled && !state.isDismissedForSession,
  })
}

function handleAppInstalled(): void {
  deferredPrompt = null
  writeDismissedForSession(false)

  setState({
    isAvailable: false,
    isInstalled: true,
    isDismissedForSession: false,
    isIOS: state.isIOS,
  })
}

export function initializePwaInstallPrompt(): () => void {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  initializeCount += 1

  if (!cleanupBrowserListeners) {
    syncStateFromEnvironment()

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    cleanupBrowserListeners = () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      cleanupBrowserListeners = null
    }
  } else {
    syncStateFromEnvironment()
  }

  return () => {
    initializeCount = Math.max(0, initializeCount - 1)

    if (initializeCount === 0 && cleanupBrowserListeners) {
      cleanupBrowserListeners()
    }
  }
}

export function dismissPwaInstallPrompt(): void {
  writeDismissedForSession(true)

  patchState({
    isAvailable: false,
    isDismissedForSession: true,
  })
}

export async function promptPwaInstall(): Promise<PwaInstallPromptOutcome> {
  if (!deferredPrompt || state.isInstalled) {
    return 'unavailable'
  }

  const activePrompt = deferredPrompt
  deferredPrompt = null

  patchState({
    isAvailable: false,
  })

  try {
    await activePrompt.prompt()
    const choice = await activePrompt.userChoice

    if (choice.outcome === 'accepted') {
      writeDismissedForSession(false)
      patchState({
        isDismissedForSession: false,
      })

      return 'accepted'
    }

    dismissPwaInstallPrompt()
    return 'dismissed'
  } catch {
    dismissPwaInstallPrompt()
    return 'dismissed'
  }
}

export function subscribePwaInstallPrompt(listener: () => void): () => void {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export function getPwaInstallPromptSnapshot(): PwaInstallPromptState {
  return state
}

export function usePwaInstallPromptState(): PwaInstallPromptState {
  return useSyncExternalStore(
    subscribePwaInstallPrompt,
    getPwaInstallPromptSnapshot,
    getPwaInstallPromptSnapshot,
  )
}
