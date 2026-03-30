import { ApiError } from '../auth/api'

type ApiErrorPayload = {
  error?: {
    code?: string
    message?: string
  }
}

type CreateFamilyResponse = {
  id: string
  name: string
}

type JoinFamilyResponse = {
  family?: {
    id: string
    name: string
  }
}

export type FamilyMember = {
  id: string
  userId: string | null
  name: string
  email: string
  role: string
  status: string
}

export type FamilyInviteStatus = {
  id: string
  token: string
  status: string
  expiresAt: string | null
  createdAt: string | null
  inviteUrl: string | null
}

export type FamilyContribution = {
  memberId: string
  memberName: string
  totalIncome: number
  totalExpense: number
  netBalance: number
}

export type FamilySummary = {
  totalIncome: number
  totalExpense: number
  netBalance: number
  perMemberContributions: FamilyContribution[]
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

function toNumber(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

function getCollection(payload: unknown, keys: string[]): unknown[] {
  if (Array.isArray(payload)) {
    return payload
  }

  if (!payload || typeof payload !== 'object') {
    return []
  }

  for (const key of keys) {
    const value = (payload as Record<string, unknown>)[key]
    if (Array.isArray(value)) {
      return value
    }
  }

  return []
}

function normalizeFamilyMember(item: unknown): FamilyMember {
  const row = (item ?? {}) as Record<string, unknown>
  const user = row.user as Record<string, unknown> | undefined

  return {
    id: typeof row.id === 'string' ? row.id : typeof user?.id === 'string' ? user.id : '',
    userId: typeof row.userId === 'string' ? row.userId : typeof user?.id === 'string' ? user.id : null,
    name:
      typeof row.name === 'string'
        ? row.name
        : typeof user?.name === 'string'
          ? user.name
          : typeof user?.email === 'string'
            ? user.email
            : 'Member',
    email: typeof row.email === 'string' ? row.email : typeof user?.email === 'string' ? user.email : '-',
    role: typeof row.role === 'string' ? row.role : 'member',
    status: typeof row.status === 'string' ? row.status : 'active',
  }
}

function normalizeInvite(item: unknown): FamilyInviteStatus {
  const row = (item ?? {}) as Record<string, unknown>

  return {
    id: typeof row.id === 'string' ? row.id : typeof row.token === 'string' ? row.token : '',
    token:
      typeof row.token === 'string'
        ? row.token
        : typeof row.code === 'string'
          ? row.code
          : typeof row.inviteToken === 'string'
            ? row.inviteToken
            : '',
    status: typeof row.status === 'string' ? row.status : 'active',
    expiresAt: typeof row.expiresAt === 'string' ? row.expiresAt : null,
    createdAt: typeof row.createdAt === 'string' ? row.createdAt : null,
    inviteUrl: typeof row.inviteUrl === 'string' ? row.inviteUrl : null,
  }
}

function normalizeContribution(item: unknown): FamilyContribution {
  const row = (item ?? {}) as Record<string, unknown>
  const member = row.member as Record<string, unknown> | undefined

  const memberId =
    typeof row.memberId === 'string'
      ? row.memberId
      : typeof row.userId === 'string'
        ? row.userId
        : typeof member?.id === 'string'
          ? member.id
          : ''

  const memberName =
    typeof row.memberName === 'string'
      ? row.memberName
      : typeof row.name === 'string'
        ? row.name
        : typeof member?.name === 'string'
          ? member.name
          : typeof member?.email === 'string'
            ? member.email
            : 'Member'

  const totalIncome = toNumber((row.totalIncome ?? row.income) as unknown)
  const totalExpense = toNumber((row.totalExpense ?? row.expense) as unknown)
  const netBalance =
    typeof row.netBalance === 'number' || typeof row.netBalance === 'string'
      ? toNumber(row.netBalance)
      : totalIncome - totalExpense

  return {
    memberId,
    memberName,
    totalIncome,
    totalExpense,
    netBalance,
  }
}

export async function createFamily(name: string): Promise<{ id: string; name: string }> {
  const response = await request<CreateFamilyResponse>('/families', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })

  return {
    id: response.id,
    name: response.name,
  }
}

export async function joinFamilyWithInviteToken(token: string): Promise<{ familyId: string | null }> {
  const response = await request<JoinFamilyResponse>(`/invites/${encodeURIComponent(token)}/join`, {
    method: 'POST',
  })

  return {
    familyId: response.family?.id ?? null,
  }
}

export async function getFamilyMembers(
  familyId: string,
): Promise<{ members: FamilyMember[]; invites: FamilyInviteStatus[] }> {
  const payload = await request<unknown>(`/families/${encodeURIComponent(familyId)}/members`)

  const members = getCollection(payload, ['members', 'items', 'data'])
    .map((item) => normalizeFamilyMember(item))
    .filter((member) => member.id.length > 0)

  const invites = getCollection(payload, ['invites', 'pendingInvites'])
    .map((item) => normalizeInvite(item))
    .filter((invite) => invite.token.length > 0)

  if (invites.length > 0) {
    return { members, invites }
  }

  if (payload && typeof payload === 'object') {
    const latestInvite = (payload as Record<string, unknown>).latestInvite
    if (latestInvite && typeof latestInvite === 'object') {
      const invite = normalizeInvite(latestInvite)
      if (invite.token.length > 0) {
        return { members, invites: [invite] }
      }
    }
  }

  return { members, invites: [] }
}

export async function getFamilySummary(
  familyId: string,
  period: 'today' | 'week' | 'month' = 'month',
): Promise<FamilySummary> {
  const payload = await request<unknown>(
    `/families/${encodeURIComponent(familyId)}/summary?period=${encodeURIComponent(period)}`,
  )
  const summary = (payload ?? {}) as Record<string, unknown>

  return {
    totalIncome: toNumber(summary.totalIncome),
    totalExpense: toNumber(summary.totalExpense),
    netBalance: toNumber(summary.netBalance),
    perMemberContributions: getCollection(summary, ['perMemberContributions', 'contributions', 'members'])
      .map((item) => normalizeContribution(item))
      .filter((row) => row.memberId.length > 0),
  }
}

export async function createFamilyInvite(familyId: string): Promise<FamilyInviteStatus> {
  const payload = await request<unknown>(`/families/${encodeURIComponent(familyId)}/invites`, {
    method: 'POST',
  })

  const invite = normalizeInvite(payload)

  if (invite.token.length > 0) {
    return invite
  }

  const list = getCollection(payload, ['invites', 'items', 'data'])
  const firstInvite = list[0]
  const normalized = normalizeInvite(firstInvite)

  if (normalized.token.length > 0) {
    return normalized
  }

  throw new ApiError('Invalid invite response.', 500, 'INVALID_INVITE_RESPONSE')
}

export async function removeFamilyMember(familyId: string, userId: string): Promise<void> {
  await request<void>(`/families/${encodeURIComponent(familyId)}/members/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  })
}
