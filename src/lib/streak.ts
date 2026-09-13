import type { Expense } from '../types'
import { todayISO } from './format'

/**
 * Consecutive days (ending today or yesterday) with at least one
 * non-trip expense logged. Today is optional — a streak survives
 * until the day is over, so it doesn't reset the instant you wake up.
 */
export function computeStreak(expenses: Expense[]): number {
  const days = new Set(expenses.filter((e) => !e.tripId).map((e) => e.date))
  if (days.size === 0) return 0

  const cursor = new Date(`${todayISO()}T00:00:00`)
  if (!days.has(toISO(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!days.has(toISO(cursor))) return 0
  }

  let streak = 0
  while (days.has(toISO(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

function toISO(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
