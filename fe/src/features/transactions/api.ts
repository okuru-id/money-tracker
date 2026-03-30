import { ApiError } from '../auth/api'

export type TransactionType = 'debit' | 'credit'

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
  accountNumber: string
  bankName: string
  bankAccountName: string
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
  return raw.toLowerCase()
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
    accountNumber: typeof row.account_number === 'string' ? row.account_number : typeof row.accountNumber === 'string' ? row.accountNumber : '',
    bankName: typeof row.bank_name === 'string' ? row.bank_name : typeof row.bankName === 'string' ? row.bankName : '',
    bankAccountName: typeof row.bank_account_name === 'string' ? row.bank_account_name : typeof row.bankAccountName === 'string' ? row.bankAccountName : '',
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
  startDate?: string
  endDate?: string
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

  if (params?.startDate) {
    search.set('startDate', params.startDate)
  }

  if (params?.endDate) {
    search.set('endDate', params.endDate)
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
  accountNumber?: string
}): Promise<void> {
  await request('/transactions', {
    method: 'POST',
    body: JSON.stringify({
      amount: payload.amount,
      type: payload.type,
      category_id: payload.categoryId,
      note: payload.notes,
      transaction_date: payload.transactionDate,
      account_number: payload.accountNumber,
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
      category_id: payload.categoryId,
      note: payload.notes,
    }),
  })
}

export async function deleteTransaction(id: string): Promise<void> {
  await request(`/transactions/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export async function getPersonalSummary(): Promise<FamilyMonthlySummary> {
  const payload = await request<unknown>('/transactions/summary')
  const summary = (payload ?? {}) as Record<string, unknown>

  return {
    totalIncome: toNumber(summary.total_income),
    totalExpense: toNumber(summary.total_expense),
    netBalance: toNumber(summary.net_balance),
  }
}

export type CategoryTotal = {
  category: string
  amount: number
}

export type InsightsData = {
  totalIncome: number
  totalExpense: number
  netBalance: number
  totalTx: number
  expenseTx: number
  incomeTx: number
  expenseRatio: number
  topExpense: CategoryTotal[]
  topIncome: CategoryTotal[]
}

export async function getInsights(): Promise<InsightsData> {
  const payload = await request<unknown>('/transactions/insights')
  const data = (payload ?? {}) as Record<string, unknown>

  const topExpense = Array.isArray(data.top_expense)
    ? data.top_expense.map((item: unknown) => {
        const row = (item ?? {}) as Record<string, unknown>
        return {
          category: typeof row.category === 'string' ? row.category : 'Tanpa kategori',
          amount: toNumber(row.amount),
        }
      })
    : []

  const topIncome = Array.isArray(data.top_income)
    ? data.top_income.map((item: unknown) => {
        const row = (item ?? {}) as Record<string, unknown>
        return {
          category: typeof row.category === 'string' ? row.category : 'Tanpa kategori',
          amount: toNumber(row.amount),
        }
      })
    : []

  return {
    totalIncome: toNumber(data.total_income),
    totalExpense: toNumber(data.total_expense),
    netBalance: toNumber(data.net_balance),
    totalTx: typeof data.total_tx === 'number' ? data.total_tx : 0,
    expenseTx: typeof data.expense_tx === 'number' ? data.expense_tx : 0,
    incomeTx: typeof data.income_tx === 'number' ? data.income_tx : 0,
    expenseRatio: toNumber(data.expense_ratio),
    topExpense,
    topIncome,
  }
}

export async function getFamilyMonthlySummary(familyId: string): Promise<FamilyMonthlySummary> {
  const payload = await request<unknown>(`/families/${encodeURIComponent(familyId)}/summary?period=month`)
  const summary = (payload ?? {}) as Record<string, unknown>

  return {
    totalIncome: toNumber(summary.total_income),
    totalExpense: toNumber(summary.total_expense),
    netBalance: toNumber(summary.net_balance),
  }
}

// Bank Account types and API
export type BankAccount = {
  id: string
  name: string
  accountNumber: string
  balance: number
  calculatedBalance: number // Balance from transactions (credit - debit)
  icon?: string
  color?: string
}

export async function getBankAccounts(): Promise<BankAccount[]> {
  const payload = await request<unknown>('/bank-accounts')
  const data = (payload ?? {}) as Record<string, unknown>
  const accounts = Array.isArray(data.bank_accounts) ? data.bank_accounts : []

  return accounts.map((item: unknown) => {
    const row = (item ?? {}) as Record<string, unknown>
    return {
      id: typeof row.id === 'string' ? row.id : '',
      name: typeof row.name === 'string' ? row.name : '',
      accountNumber: typeof row.account_number === 'string' ? row.account_number : '',
      balance: toNumber(row.balance),
      calculatedBalance: toNumber(row.calculated_balance),
      icon: typeof row.icon === 'string' ? row.icon : undefined,
      color: typeof row.color === 'string' ? row.color : undefined,
    }
  })
}

export async function createBankAccount(data: {
  name: string
  accountNumber: string
  balance?: number
  icon?: string
  color?: string
}): Promise<BankAccount> {
  const payload = await request<unknown>('/bank-accounts', {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      account_number: data.accountNumber,
      balance: data.balance ?? 0,
      icon: data.icon,
      color: data.color,
    }),
  })
  const row = (payload ?? {}) as Record<string, unknown>
  return {
    id: typeof row.id === 'string' ? row.id : '',
    name: typeof row.name === 'string' ? row.name : '',
    accountNumber: typeof row.account_number === 'string' ? row.account_number : '',
    balance: toNumber(row.balance),
    calculatedBalance: toNumber(row.calculated_balance),
    icon: typeof row.icon === 'string' ? row.icon : undefined,
    color: typeof row.color === 'string' ? row.color : undefined,
  }
}

export async function updateBankAccount(
  id: string,
  data: {
    name?: string
    accountNumber?: string
    balance?: number
    icon?: string
    color?: string
  },
): Promise<BankAccount> {
  const payload = await request<unknown>(`/bank-accounts/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      name: data.name,
      account_number: data.accountNumber,
      balance: data.balance,
      icon: data.icon,
      color: data.color,
    }),
  })
  const row = (payload ?? {}) as Record<string, unknown>
  return {
    id: typeof row.id === 'string' ? row.id : '',
    name: typeof row.name === 'string' ? row.name : '',
    accountNumber: typeof row.account_number === 'string' ? row.account_number : '',
    balance: toNumber(row.balance),
    calculatedBalance: toNumber(row.calculated_balance),
    icon: typeof row.icon === 'string' ? row.icon : undefined,
    color: typeof row.color === 'string' ? row.color : undefined,
  }
}

export async function deleteBankAccount(id: string): Promise<void> {
  await request(`/bank-accounts/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function getBankAccountsTotal(): Promise<number> {
  const payload = await request<unknown>('/bank-accounts/total')
  const data = (payload ?? {}) as Record<string, unknown>
  return toNumber(data.total_balance)
}

export function isNetworkFailure(error: unknown): boolean {
  if (error instanceof ApiError) {
    return false
  }

  return error instanceof TypeError
}
