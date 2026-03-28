import { useSyncExternalStore } from 'react'

import { type AuthUser, type SessionContext, ApiError, restoreSessionContext } from './api'

type SessionStatus = 'unknown' | 'authenticated' | 'unauthenticated'

type SessionState = {
  status: SessionStatus
  user: AuthUser | null
  hasFamily: boolean
  familyId: string | null
  familySkipped: boolean
  isAdmin: boolean
}

const USER_STORAGE_KEY = 'money-tracker.auth.user'
const INTENDED_PATH_KEY = 'money-tracker.auth.intended-path'
const FAMILY_SKIPPED_KEY = 'money-tracker.auth.family-skipped'

let state: SessionState = {
  status: 'unknown',
  user: readStoredUser(),
  hasFamily: false,
  familyId: null,
  familySkipped: readFamilySkipped(),
  isAdmin: false,
}

let inFlightHydration: Promise<void> | null = null

const listeners = new Set<() => void>()

function emitChange(): void {
  listeners.forEach((listener) => listener())
}

function setState(nextState: SessionState): void {
  state = nextState
  emitChange()
}

function readStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(USER_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    window.localStorage.removeItem(USER_STORAGE_KEY)
    return null
  }
}

function persistUser(user: AuthUser | null): void {
  if (typeof window === 'undefined') {
    return
  }

  if (!user) {
    window.localStorage.removeItem(USER_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

function readFamilySkipped(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return window.localStorage.getItem(FAMILY_SKIPPED_KEY) === 'true'
}

function persistFamilySkipped(skipped: boolean): void {
  if (typeof window === 'undefined') {
    return
  }

  if (skipped) {
    window.localStorage.setItem(FAMILY_SKIPPED_KEY, 'true')
  } else {
    window.localStorage.removeItem(FAMILY_SKIPPED_KEY)
  }
}

export function setSessionAuthenticated(user: AuthUser | null, context: SessionContext): void {
  persistUser(user)

  setState({
    status: 'authenticated',
    user,
    hasFamily: context.hasFamily,
    familyId: context.familyId,
    familySkipped: readFamilySkipped(),
    isAdmin: user?.role === 'admin',
  })
}

export function updateFamilyContext(context: SessionContext): void {
  if (state.status !== 'authenticated') {
    return
  }

  persistFamilySkipped(false)

  setState({
    ...state,
    hasFamily: context.hasFamily,
    familyId: context.familyId,
    familySkipped: false,
  })
}

export function setFamilySkipped(): void {
  persistFamilySkipped(true)

  setState({
    ...state,
    familySkipped: true,
  })
}

export function clearFamilySkipped(): void {
  persistFamilySkipped(false)

  setState({
    ...state,
    familySkipped: false,
  })
}

export function setSessionUnauthenticated(): void {
  persistUser(null)

  setState({
    status: 'unauthenticated',
    user: null,
    hasFamily: false,
    familyId: null,
    familySkipped: false,
    isAdmin: false,
  })
}

export async function hydrateSession(): Promise<void> {
  if (state.status !== 'unknown') {
    return
  }

  if (!state.user) {
    setSessionUnauthenticated()
    return
  }

  if (inFlightHydration) {
    return inFlightHydration
  }

  inFlightHydration = (async () => {
    try {
      const context = await restoreSessionContext()
      setSessionAuthenticated(state.user, context)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setSessionUnauthenticated()
        return
      }

      setSessionUnauthenticated()
    } finally {
      inFlightHydration = null
    }
  })()

  return inFlightHydration
}

export function rememberIntendedPath(path: string): void {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.setItem(INTENDED_PATH_KEY, path)
}

export function consumeIntendedPath(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  const storedPath = window.sessionStorage.getItem(INTENDED_PATH_KEY)
  if (!storedPath) {
    return null
  }

  window.sessionStorage.removeItem(INTENDED_PATH_KEY)
  return storedPath
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): SessionState {
  return state
}

export function useSessionState(): SessionState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
