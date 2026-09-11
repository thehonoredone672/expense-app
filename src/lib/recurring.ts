import type { CategoryId, Expense } from '../types'

export interface PendingRecurring {
  key: string
  category: CategoryId
  note: string
  amount: number
}

function seriesKey(e: Expense): string {
  return `${e.category}::${e.note.trim().toLowerCase()}`
}

/** Recurring expenses whose latest occurrence falls before the given month. */
export function getPendingRecurring(expenses: Expense[], year: number, month: number): PendingRecurring[] {
  const latestBySeries = new Map<string, Expense>()
  for (const e of expenses) {
    if (!e.recurring || e.tripId) continue
    const key = seriesKey(e)
    const current = latestBySeries.get(key)
    if (!current || e.date > current.date) latestBySeries.set(key, e)
  }

  const pending: PendingRecurring[] = []
  for (const [key, e] of latestBySeries) {
    const d = new Date(`${e.date}T00:00:00`)
    const isBeforeTargetMonth = d.getFullYear() < year || (d.getFullYear() === year && d.getMonth() < month)
    if (isBeforeTargetMonth) {
      pending.push({ key, category: e.category, note: e.note, amount: e.amount })
    }
  }
  return pending
}
