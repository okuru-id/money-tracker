import { ApiError } from '../auth/api'

export type TransactionType = 'income' | 'expense'

export type TransactionPeriod = 'today' | 'week' | 'month'

export type TransactionItem = {
  id: string
  amount: number
  type: string
  categoryId: string | null
  categoryName: string
  notes: string
  transactionDate: string | null
  createdAt: string | null
  createdByUserId: string | null
}

export type CategoryItem = {
  id: string
  name: string
  type: string
}

export type FamilyMonthlySummary = {
  totalIncome: number
  totalExpense: number
  netBalance: number
}

type ApiErrorPayload = {
  error?: {
    code?: string
    message?: string
  }
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

function normalizeTransactionType(raw: string): string {
  const lower = raw.toLowerCase()
  if (lower === 'debit') return 'expense'
  if (lower === 'credit') return 'income'
  return lower
}

function normalizeTransaction(item: unknown): TransactionItem {
  const row = (item ?? {}) as Record<string, unknown>

  // Handle both snake_case (from backend) and camelCase
  const createdByUserId =
    typeof row.created_by === 'string'
      ? row.created_by
      : typeof row.createdById === 'string'
        ? row.createdById
        : typeof row.userId === 'string'
          ? row.userId
          : typeof row.createdBy === 'string'
            ? row.createdBy
            : null

  return {
    id: typeof row.id === 'string' ? row.id : '',
    amount: toNumber(row.amount),
    type: normalizeTransactionType(typeof row.type === 'string' ? row.type : ''),
    categoryId: typeof row.category_id === 'string' ? row.category_id : typeof row.categoryId === 'string' ? row.categoryId : null,
    categoryName: typeof row.category_name === 'string' ? row.category_name : typeof row.categoryName === 'string' ? row.categoryName : '',
    notes: typeof row.note === 'string' ? row.note : typeof row.notes === 'string' ? row.notes : '',
    transactionDate: typeof row.transaction_date === 'string' ? row.transaction_date : typeof row.transactionDate === 'string' ? row.transactionDate : null,
    createdAt: typeof row.created_at === 'string' ? row.created_at : typeof row.createdAt === 'string' ? row.createdAt : null,
    createdByUserId,
  }
}

function normalizeCategory(item: unknown): CategoryItem {
  const row = (item ?? {}) as Record<string, unknown>

  return {
    id: typeof row.id === 'string' ? row.id : '',
    name: typeof row.name === 'string' ? row.name : '',
    type: typeof row.type === 'string' ? row.type.toLowerCase() : '',
  }
}

export async function getTransactions(params?: {
  period?: TransactionPeriod
  page?: number
  limit?: number
  ownerId?: string
}): Promise<TransactionItem[]> {
  const search = new URLSearchParams()

  if (params?.ownerId) {
    search.set('ownerId', params.ownerId)
  }

  if (params?.period) {
    search.set('period', params.period)
  }

  if (typeof params?.page === 'number') {
    search.set('page', String(params.page))
  }

  if (typeof params?.limit === 'number') {
    search.set('limit', String(params.limit))
  }

  const path = search.size > 0 ? `/transactions?${search.toString()}` : '/transactions'
  const payload = await request<unknown>(path)

  return getCollection(payload, ['transactions', 'items', 'data'])
    .map((item) => normalizeTransaction(item))
    .filter((item) => item.id.length > 0)
}

export async function getCategories(): Promise<CategoryItem[]> {
  const payload = await request<unknown>('/categories')

  return getCollection(payload, ['categories', 'items', 'data'])
    .map((item) => normalizeCategory(item))
    .filter((item) => item.id.length > 0 && item.name.length > 0)
}

export async function createTransaction(payload: {
  amount: number
  type: TransactionType
  categoryId: string
  notes?: string
  transactionDate?: string
}): Promise<void> {
  await request('/transactions', {
    method: 'POST',
    body: JSON.stringify({
      amount: payload.amount,
      type: payload.type,
      categoryId: payload.categoryId,
      notes: payload.notes,
      transactionDate: payload.transactionDate,
    }),
  })
}

export async function updateTransaction(
  id: string,
  payload: {
    amount: number
    categoryId: string | null
    notes?: string
  },
): Promise<void> {
  await request(`/transactions/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      amount: payload.amount,
      categoryId: payload.categoryId,
      notes: payload.notes,
    }),
  })
}

export async function getFamilyMonthlySummary(familyId: string): Promise<FamilyMonthlySummary> {
  const payload = await request<unknown>(`/families/${encodeURIComponent(familyId)}/summary?period=month`)
  const summary = (payload ?? {}) as Record<string, unknown>

  return {
    totalIncome: toNumber(summary.totalIncome),
    totalExpense: toNumber(summary.totalExpense),
    netBalance: toNumber(summary.netBalance),
  }
}

export function isNetworkFailure(error: unknown): boolean {
  if (error instanceof ApiError) {
    return false
  }

  return error instanceof TypeError
}
