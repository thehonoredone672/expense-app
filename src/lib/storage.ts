import type { Debt, Expense, Settings, Trip } from '../types'

const EXPENSES_KEY = 'centsible.expenses.v1'
const SETTINGS_KEY = 'centsible.settings.v1'
const TRIPS_KEY = 'centsible.trips.v1'
const DEBTS_KEY = 'centsible.debts.v1'

export const DEFAULT_SETTINGS: Settings = {
  currency: 'USD',
  theme: 'system',
  budget: null,
  notificationsEnabled: false,
}

export function loadExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(EXPENSES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveExpenses(expenses: Expense[]) {
  try {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses))
  } catch {
    // storage unavailable (private browsing, quota) — fail silently
  }
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // ignore
  }
}

export function loadTrips(): Trip[] {
  try {
    const raw = localStorage.getItem(TRIPS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveTrips(trips: Trip[]) {
  try {
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips))
  } catch {
    // ignore
  }
}

export function loadDebts(): Debt[] {
  try {
    const raw = localStorage.getItem(DEBTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveDebts(debts: Debt[]) {
  try {
    localStorage.setItem(DEBTS_KEY, JSON.stringify(debts))
  } catch {
    // ignore
  }
}
