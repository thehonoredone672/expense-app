import type { Debt, Expense, Settings, Trip } from '../types'

// These keys only ever held data from before accounts existed. They're now
// read-only — used to detect and offer a one-time import into a new account —
// since all ongoing persistence goes through the API (see src/lib/api.ts).
const EXPENSES_KEY = 'centsible.expenses.v1'
const SETTINGS_KEY = 'centsible.settings.v1'
const TRIPS_KEY = 'centsible.trips.v1'
const DEBTS_KEY = 'centsible.debts.v1'
const IMPORT_HANDLED_KEY = 'centsible.legacyImportHandled.v1'

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

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
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

/** Whether this browser has pre-account data worth offering to import, and hasn't already been asked. */
export function hasUnhandledLegacyData(): boolean {
  try {
    if (localStorage.getItem(IMPORT_HANDLED_KEY)) return false
  } catch {
    return false
  }
  return loadExpenses().length > 0 || loadTrips().length > 0 || loadDebts().length > 0
}

export function markLegacyImportHandled() {
  try {
    localStorage.setItem(IMPORT_HANDLED_KEY, '1')
  } catch {
    // ignore
  }
}
