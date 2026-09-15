import type { AdminUserRow, AuthUser, Debt, Expense, Settings, Trip } from '../types'

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:3001'

let authToken: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

export class ApiError extends Error {}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.")
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}) as { error?: string })
    throw new ApiError(body.error || `Request failed (${res.status})`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

interface AuthResponse {
  token: string
  user: AuthUser
}

export interface ImportPayload {
  expenses: Expense[]
  trips: Trip[]
  debts: Debt[]
}

export interface ImportResult {
  expenses: number
  trips: number
  debts: number
}

export const api = {
  signup: (email: string, password: string) =>
    request<AuthResponse>('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password }) }),
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request<{ user: AuthUser }>('/auth/me'),

  listExpenses: () => request<Expense[]>('/expenses'),
  createExpense: (data: Omit<Expense, 'id' | 'createdAt'>) =>
    request<Expense>('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  updateExpense: (id: string, patch: Partial<Omit<Expense, 'id' | 'createdAt'>>) =>
    request<Expense>(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(patch) }),
  deleteExpense: (id: string) => request<void>(`/expenses/${id}`, { method: 'DELETE' }),
  clearExpenses: () => request<void>('/expenses', { method: 'DELETE' }),

  listTrips: () => request<Trip[]>('/trips'),
  createTrip: (data: Omit<Trip, 'id' | 'createdAt'>) =>
    request<Trip>('/trips', { method: 'POST', body: JSON.stringify(data) }),
  updateTrip: (id: string, patch: Partial<Omit<Trip, 'id' | 'createdAt'>>) =>
    request<Trip>(`/trips/${id}`, { method: 'PUT', body: JSON.stringify(patch) }),
  deleteTrip: (id: string) => request<void>(`/trips/${id}`, { method: 'DELETE' }),

  listDebts: () => request<Debt[]>('/debts'),
  createDebt: (data: Omit<Debt, 'id' | 'createdAt'>) =>
    request<Debt>('/debts', { method: 'POST', body: JSON.stringify(data) }),
  updateDebt: (id: string, patch: Partial<Omit<Debt, 'id' | 'createdAt'>>) =>
    request<Debt>(`/debts/${id}`, { method: 'PUT', body: JSON.stringify(patch) }),
  deleteDebt: (id: string) => request<void>(`/debts/${id}`, { method: 'DELETE' }),
  clearDebts: () => request<void>('/debts', { method: 'DELETE' }),

  getSettings: () => request<Settings>('/settings'),
  updateSettings: (patch: Partial<Settings>) =>
    request<Settings>('/settings', { method: 'PUT', body: JSON.stringify(patch) }),

  importData: (payload: ImportPayload) =>
    request<ImportResult>('/import', { method: 'POST', body: JSON.stringify(payload) }),

  adminListUsers: () => request<AdminUserRow[]>('/admin/users'),
}
