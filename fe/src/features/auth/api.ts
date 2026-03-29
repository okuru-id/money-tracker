export type AuthUser = {
  id: string
  email: string
  name?: string
  role?: string
}

export type SessionContext = {
  hasFamily: boolean
  familyId: string | null
  role?: string
}

type ApiErrorPayload = {
  error?: {
    code?: string
    message?: string
  }
}

export class ApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

type LoginResponse = {
  user: {
    id: string
    email: string
    name?: string
    role?: string
  }
}

type MeResponse = {
  user: {
    id: string
    family_id: string | null
    role?: string
  }
}

type RegisterPayload = {
  name: string
  email: string
  password: string
}

type LoginPayload = {
  email: string
  password: string
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''

function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/api/') ? path : `/api${path.startsWith('/') ? path : `/${path}`}`
  return `${API_BASE_URL}${normalizedPath}`
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    let payload: ApiErrorPayload | null = null

    try {
      payload = (await response.json()) as ApiErrorPayload
    } catch {
      payload = null
    }

    throw new ApiError(
      payload?.error?.message ?? `Request failed with status ${response.status}`,
      response.status,
      payload?.error?.code,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

function isNoFamilyMessage(message: string | undefined): boolean {
  if (!message) {
    return false
  }

  return message.toLowerCase().includes('no family associated')
}

async function getMe(): Promise<MeResponse> {
  return request<MeResponse>('/auth/me')
}

async function detectFamilyContext(): Promise<SessionContext & { role?: string }> {
  try {
    const response = await getMe()
    const hasFamily = Boolean(response.user.family_id)
    return { hasFamily, familyId: response.user.family_id, role: response.user.role }
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw error
    }
    // Fallback to old method if /auth/me fails
    try {
      await request('/transactions?limit=1')
      return { hasFamily: true, familyId: null }
    } catch (fallbackError) {
      if (fallbackError instanceof ApiError && fallbackError.status === 400 && isNoFamilyMessage(fallbackError.message)) {
        return { hasFamily: false, familyId: null }
      }
      return { hasFamily: true, familyId: null }
    }
  }
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  const response = await request<LoginResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return {
    id: response.user.id,
    email: response.user.email,
    name: response.user.name,
    role: response.user.role,
  }
}

export async function login(payload: LoginPayload): Promise<{ user: AuthUser; context: SessionContext }> {
  const response = await request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  const context = await detectFamilyContext()

  return {
    user: {
      id: response.user.id,
      email: response.user.email,
      name: response.user.name,
      role: response.user.role,
    },
    context,
  }
}

export async function restoreSessionContext(): Promise<SessionContext> {
  return detectFamilyContext()
}

export async function logout(): Promise<void> {
  await request('/auth/logout', { method: 'POST' })
}
