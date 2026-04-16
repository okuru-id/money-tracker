import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { hydrateSession, rememberIntendedPath, useSessionState } from '../features/auth/session-store'
import { PwaInstallPrompt } from '../components/pwa-install-prompt'
import { LandingPage } from '../features/landing/pages/landing-page'

const DEFAULT_VIEWPORT = 'width=device-width, initial-scale=1.0'
const NON_ZOOM_VIEWPORT = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'

function ViewportController() {
  const location = useLocation()
  const session = useSessionState()

  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]')
    if (!viewport) {
      return
    }

    viewport.setAttribute(
      'content',
      session.status === 'authenticated' ? NON_ZOOM_VIEWPORT : DEFAULT_VIEWPORT,
    )

    return () => {
      viewport.setAttribute('content', DEFAULT_VIEWPORT)
    }
  }, [location.key, session.status])

  return null
}

export function AppRouterRoot() {
  return (
    <>
      <ViewportController />
      <Outlet />
    </>
  )
}

function isFamilyOnboardingPath(path: string): boolean {
  return path.startsWith('/family/setup') || path.startsWith('/family/join') || path.startsWith('/invite/')
}

export function SessionGate() {
  const session = useSessionState()
  const location = useLocation()

  useEffect(() => {
    void hydrateSession()
  }, [])

  if (session.status === 'unknown') {
    return (
      <section className="page-card" aria-live="polite">
        <p className="page-card__eyebrow">Checking Session</p>
        <h1>Preparing App</h1>
        <p>Verifying your session before opening the dashboard.</p>
      </section>
    )
  }

  if (session.status === 'unauthenticated') {
    if (location.pathname === '/') {
      return <LandingPage />
    }

    const intendedPath = `${location.pathname}${location.search}${location.hash}`
    rememberIntendedPath(intendedPath)

    return <Navigate to="/login" replace state={{ from: intendedPath }} />
  }

  return <Outlet />
}

export function PublicOnlyGate() {
  const session = useSessionState()

  useEffect(() => {
    void hydrateSession()
  }, [])

  if (session.status === 'unknown') {
    return (
      <section className="page-card" aria-live="polite">
        <p className="page-card__eyebrow">Checking Session</p>
        <h1>Preparing App</h1>
        <p>Verifying your session before opening the auth page.</p>
      </section>
    )
  }

  if (session.status === 'authenticated') {
    if (session.hasFamily) {
      return <Navigate to="/" replace />
    }
    if (session.familySkipped) {
      return <Navigate to="/settings" replace />
    }
    return <Navigate to="/family/setup" replace />
  }

  return (
    <>
      <Outlet />
      <PwaInstallPrompt position="top" />
    </>
  )
}

export function FamilyRequiredGate() {
  const session = useSessionState()
  const location = useLocation()

  if (session.status !== 'authenticated') {
    return null
  }

  if (!session.hasFamily) {
    if (session.familySkipped) {
      return <Navigate to="/settings" replace />
    }

    const intendedPath = `${location.pathname}${location.search}${location.hash}`
    rememberIntendedPath(intendedPath)

    return <Navigate to="/family/setup" replace />
  }

  return <Outlet />
}

export function FamilyOptionalGate() {
  const session = useSessionState()
  const location = useLocation()

  if (session.status !== 'authenticated') {
    return null
  }

  if (session.hasFamily || session.familySkipped) {
    return <Outlet />
  }

  const intendedPath = `${location.pathname}${location.search}${location.hash}`
  rememberIntendedPath(intendedPath)

  return <Navigate to="/family/setup" replace />
}

export function NoFamilyOnlyGate() {
  const session = useSessionState()
  const location = useLocation()

  if (session.status !== 'authenticated') {
    return null
  }

  if (session.hasFamily) {
    return <Navigate to="/family" replace />
  }

  const currentPath = `${location.pathname}${location.search}${location.hash}`
  if (!isFamilyOnboardingPath(currentPath)) {
    rememberIntendedPath(currentPath)
  }

  return <Outlet />
}

export function AdminGate() {
  const session = useSessionState()

  if (session.status !== 'authenticated') {
    return null
  }

  if (!session.isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
