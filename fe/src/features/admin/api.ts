import { ApiError } from '../auth/api'

export interface TransactionItem {
  id: string
  family_id: string
  wallet_owner_id: string
  wallet_owner_name: string
  account_number: string
  bank_name: string
  bank_account_name: string
  type: string
  amount: string
  category_id: string | null
  category_name: string
  note: string | null
  transaction_date: string
  created_by: string
  created_by_name: string
  created_at: string
  updated_at: string | null
}

export interface TransactionListResponse {
  data: TransactionItem[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface FamilyItem {
  id: string
  name: string
  created_by: string
  created_by_name: string
  created_at: string
}

export interface FamilyListResponse {
  data: FamilyItem[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface UserItem {
  id: string
  email: string
  role: string
  created_at: string
}

export interface UserListResponse {
  data: UserItem[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface AddMemberRequest {
  family_id: string
  user_id: string
  role: "owner" | "member"
}

export interface CreateUserRequest {
  email: string
  password: string
  role?: "user" | "admin"
}

export interface UpdateUserRequest {
  role: "user" | "admin"
}

export interface CreateFamilyRequest {
  name: string
  created_by: string
}

export interface UpdateFamilyRequest {
  name: string
}

export interface FamilyMember {
  id: string
  user_id: string
  email: string
  name: string
  role: string
  joined_at: string
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

export async function listAllTransactions(params?: {
  familyId?: string
  userId?: string
  page?: number
  limit?: number
}): Promise<TransactionListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.familyId) searchParams.set("familyId", params.familyId)
  if (params?.userId) searchParams.set("userId", params.userId)
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.limit) searchParams.set("limit", String(params.limit))

  return request<TransactionListResponse>(
    `/admin/transactions?${searchParams.toString()}`
  )
}

export async function listAllFamilies(params?: {
  page?: number
  limit?: number
}): Promise<FamilyListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.limit) searchParams.set("limit", String(params.limit))

  return request<FamilyListResponse>(
    `/admin/families?${searchParams.toString()}`
  )
}

export async function listAllUsers(params?: {
  page?: number
  limit?: number
}): Promise<UserListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.limit) searchParams.set("limit", String(params.limit))

  return request<UserListResponse>(
    `/admin/users?${searchParams.toString()}`
  )
}

export async function addMemberToFamily(data: AddMemberRequest): Promise<void> {
  await request("/admin/families/members", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function removeMemberFromFamily(
  familyId: string,
  userId: string
): Promise<void> {
  await request(
    `/admin/families/members?familyId=${familyId}&userId=${userId}`,
    { method: "DELETE" }
  )
}

export async function createUser(data: CreateUserRequest): Promise<UserItem> {
  return request<UserItem>("/admin/users", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateUser(
  userId: string,
  data: UpdateUserRequest
): Promise<void> {
  await request(`/admin/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteUser(userId: string): Promise<void> {
  await request(`/admin/users/${userId}`, {
    method: "DELETE",
  })
}

export async function createFamily(data: CreateFamilyRequest): Promise<FamilyItem> {
  return request<FamilyItem>("/admin/families", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateFamily(
  familyId: string,
  data: UpdateFamilyRequest
): Promise<void> {
  await request(`/admin/families/${familyId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteFamily(familyId: string): Promise<void> {
  await request(`/admin/families/${familyId}`, {
    method: "DELETE",
  })
}

export async function getFamilyMembers(familyId: string): Promise<FamilyMember[]> {
  return request<FamilyMember[]>(`/admin/families/${familyId}/members`)
}

export async function getUsersWithoutFamily(): Promise<UserItem[]> {
  return request<UserItem[]>("/admin/families/users-without-family")
}

export interface UpdateTransactionRequest {
  amount?: number
  category_id?: string | null
  note?: string
  transaction_date?: string
}

export async function updateTransactionAdmin(
  transactionId: string,
  data: UpdateTransactionRequest
): Promise<void> {
  await request(`/admin/transactions/${transactionId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteTransactionAdmin(transactionId: string): Promise<void> {
  await request(`/admin/transactions/${transactionId}`, {
    method: "DELETE",
  })
}