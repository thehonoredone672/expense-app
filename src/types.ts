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
}
