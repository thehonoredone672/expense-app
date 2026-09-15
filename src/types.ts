export type CategoryId =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'bills'
  | 'entertainment'
  | 'health'
  | 'groceries'
  | 'other'

export interface Expense {
  id: string
  amount: number
  category: CategoryId
  note: string
  date: string // yyyy-mm-dd
  createdAt: number
  tripId?: string | null
  recurring?: boolean
}

export type TripIconId = 'plane' | 'palmtree' | 'mountain' | 'tent' | 'gift' | 'sparkles' | 'briefcase' | 'mappin'

export interface Trip {
  id: string
  name: string
  budget: number
  icon: TripIconId
  createdAt: number
}

export type ThemePreference = 'system' | 'light' | 'dark'

export interface Settings {
  currency: string
  theme: ThemePreference
  budget: number | null
  notificationsEnabled: boolean
}

/** 'they_owe' = someone owes the user money; 'i_owe' = the user owes someone money. */
export type DebtDirection = 'they_owe' | 'i_owe'

export interface Debt {
  id: string
  person: string
  amount: number
  direction: DebtDirection
  note: string
  dueDate: string | null // yyyy-mm-dd
  settled: boolean
  createdAt: number
}

export type UserRole = 'user' | 'admin'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  createdAt: number
}

export interface AdminUserRow {
  id: string
  email: string
  role: UserRole
  createdAt: number
  lastLoginAt: number | null
  expenseCount: number
  tripCount: number
  debtCount: number
}
