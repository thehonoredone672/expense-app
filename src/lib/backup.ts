import type { Debt, Expense, Settings, Trip } from '../types'
import { CATEGORY_MAP } from '../data/categories'
import { todayISO } from './format'

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportJSON(expenses: Expense[], trips: Trip[], debts: Debt[], settings: Settings) {
  const payload = { version: 3, exportedAt: new Date().toISOString(), settings, expenses, trips, debts }
  download(`expensify-backup-${todayISO()}.json`, JSON.stringify(payload, null, 2), 'application/json')
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export function exportCSV(expenses: Expense[], trips: Trip[]) {
  const tripNames = new Map(trips.map((t) => [t.id, t.name]))
  const rows = [
    ['Date', 'Category', 'Note', 'Amount', 'Trip'],
    ...expenses
      .slice()
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .map((e) => [
        e.date,
        CATEGORY_MAP[e.category]?.label ?? e.category,
        e.note,
        e.amount.toFixed(2),
        (e.tripId && tripNames.get(e.tripId)) || '',
      ]),
  ]
  const csv = rows.map((row) => row.map(csvEscape).join(',')).join('\n')
  download(`expensify-export-${todayISO()}.csv`, csv, 'text/csv')
}

function isValidExpense(value: unknown): value is Expense {
  if (!value || typeof value !== 'object') return false
  const e = value as Record<string, unknown>
  return (
    typeof e.id === 'string' &&
    typeof e.amount === 'number' &&
    typeof e.category === 'string' &&
    typeof e.note === 'string' &&
    typeof e.date === 'string' &&
    typeof e.createdAt === 'number'
  )
}

function isValidTrip(value: unknown): value is Trip {
  if (!value || typeof value !== 'object') return false
  const t = value as Record<string, unknown>
  return (
    typeof t.id === 'string' &&
    typeof t.name === 'string' &&
    typeof t.budget === 'number' &&
    typeof t.icon === 'string' &&
    typeof t.createdAt === 'number'
  )
}

function isValidDebt(value: unknown): value is Debt {
  if (!value || typeof value !== 'object') return false
  const d = value as Record<string, unknown>
  return (
    typeof d.id === 'string' &&
    typeof d.person === 'string' &&
    typeof d.amount === 'number' &&
    (d.direction === 'they_owe' || d.direction === 'i_owe') &&
    typeof d.note === 'string' &&
    (d.dueDate === null || typeof d.dueDate === 'string') &&
    typeof d.settled === 'boolean' &&
    typeof d.createdAt === 'number'
  )
}

export async function readBackupFile(file: File): Promise<{ expenses: Expense[]; trips: Trip[]; debts: Debt[] }> {
  const text = await file.text()
  const parsed = JSON.parse(text)
  const expenseList = Array.isArray(parsed) ? parsed : parsed.expenses
  if (!Array.isArray(expenseList)) throw new Error('No expenses found in file')
  const expenses = expenseList.filter(isValidExpense)
  const tripList = Array.isArray(parsed?.trips) ? parsed.trips : []
  const trips = tripList.filter(isValidTrip)
  const debtList = Array.isArray(parsed?.debts) ? parsed.debts : []
  const debts = debtList.filter(isValidDebt)
  if (expenses.length === 0 && trips.length === 0 && debts.length === 0) throw new Error('File contained no valid data')
  return { expenses, trips, debts }
}
