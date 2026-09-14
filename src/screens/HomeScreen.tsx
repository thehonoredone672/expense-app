import { useMemo, useState } from 'react'
import { Receipt, Search, X, Repeat, Flame } from 'lucide-react'
import type { CategoryId, Expense } from '../types'
import { MonthSwitcher } from '../components/MonthSwitcher'
import { ExpenseList } from '../components/ExpenseList'
import { SegmentedMeter } from '../components/SegmentedMeter'
import { CATEGORY_MAP } from '../data/categories'
import { formatCurrency } from '../lib/format'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import { getPendingRecurring } from '../lib/recurring'
import { computeStreak } from '../lib/streak'

interface Props {
  expenses: Expense[]
  currency: string
  budget: number | null
  year: number
  month: number
  onMonthChange: (year: number, month: number) => void
  onEdit: (expense: Expense) => void
  onAdd: (presetCategory?: CategoryId) => void
  onDelete: (id: string) => void
  onDuplicate: (expense: Expense) => void
  onAddRecurring: (pending: ReturnType<typeof getPendingRecurring>) => void
}

export function HomeScreen({
  expenses,
  currency,
  budget,
  year,
  month,
  onMonthChange,
  onEdit,
  onAdd,
  onDelete,
  onDuplicate,
  onAddRecurring,
}: Props) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  const untaggedExpenses = useMemo(() => expenses.filter((e) => !e.tripId), [expenses])

  const now = new Date()
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()
  const pendingRecurring = useMemo(
    () => (isCurrentMonth ? getPendingRecurring(expenses, year, month) : []),
    [expenses, year, month, isCurrentMonth],
  )

  const monthExpenses = useMemo(
    () =>
      untaggedExpenses.filter((e) => {
        const d = new Date(`${e.date}T00:00:00`)
        return d.getFullYear() === year && d.getMonth() === month
      }),
    [untaggedExpenses, year, month],
  )

  const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0)
  const animatedTotal = useAnimatedNumber(total)
  const streak = useMemo(() => computeStreak(expenses), [expenses])

  const quickCategories = useMemo(() => {
    const counts = new Map<CategoryId, number>()
    for (const e of untaggedExpenses) counts.set(e.category, (counts.get(e.category) ?? 0) + 1)
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([id]) => CATEGORY_MAP[id])
  }, [untaggedExpenses])

  const visibleExpenses = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return monthExpenses
    return monthExpenses.filter(
      (e) => e.note.toLowerCase().includes(q) || CATEGORY_MAP[e.category].label.toLowerCase().includes(q),
    )
  }, [monthExpenses, query])

  const budgetPct = budget ? Math.min(100, Math.round((total / budget) * 100)) : 0
  const overBudget = budget != null && total > budget

  function closeSearch() {
    setSearchOpen(false)
    setQuery('')
  }

  return (
    <div className="px-5 pb-6" style={{ paddingTop: 'calc(var(--safe-top) + 20px)' }}>
      <div className="card-flat rounded-xl px-5 py-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] font-medium text-[var(--text-muted)]">Total spent</p>
            <p className="text-4xl font-semibold tabular-nums">{formatCurrency(animatedTotal, currency)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {streak >= 2 && (
              <span
                className="flex items-center gap-1 rounded-md border-2 border-[var(--border-hard)] px-2 py-1"
                title={`${streak}-day logging streak`}
              >
                <Flame size={13} className="animate-flicker" color="#f97316" fill="#f97316" />
                <span className="text-[12.5px] font-semibold tabular-nums">{streak}</span>
              </span>
            )}
            <button
              type="button"
              onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
              aria-label={searchOpen ? 'Close search' : 'Search'}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-opacity active:opacity-60"
            >
              {searchOpen ? <X size={18} /> : <Search size={18} />}
            </button>
          </div>
        </div>

        {budget != null && (
          <div className="mt-3">
            <SegmentedMeter pct={budgetPct} color={overBudget ? 'var(--danger)' : 'var(--accent-2)'} />
            <p className="mt-1.5 text-[12.5px] text-[var(--text-muted)]">
              {overBudget
                ? `${formatCurrency(total - budget, currency)} over your ${formatCurrency(budget, currency)} budget`
                : `${formatCurrency(budget - total, currency)} left of ${formatCurrency(budget, currency)} budget`}
            </p>
          </div>
        )}

        {searchOpen && (
          <div className="mt-4 animate-fade-in">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes or categories"
              className="w-full border-b-2 border-[var(--border)] bg-transparent py-2 text-[15px] outline-none placeholder:text-[var(--text-muted)]"
            />
          </div>
        )}

        <div className="mt-4">
          <MonthSwitcher year={year} month={month} onChange={onMonthChange} />
        </div>
      </div>

      {pendingRecurring.length > 0 && (
        <button
          type="button"
          onClick={() => onAddRecurring(pendingRecurring)}
          className="card-flat-sm press mt-4 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left"
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-[var(--border-hard)]"
            style={{ backgroundColor: 'var(--accent-2)' }}
          >
            <Repeat size={16} color="var(--accent-2-text)" />
          </span>
          <span className="flex-1">
            <span className="block text-[14px] font-semibold">
              {pendingRecurring.length} recurring bill{pendingRecurring.length === 1 ? '' : 's'} due
            </span>
            <span className="block text-[12.5px] text-[var(--text-muted)]">Tap to add this month's amounts</span>
          </span>
        </button>
      )}

      {quickCategories.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {quickCategories.map((cat) => {
            const Icon = cat.icon
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onAdd(cat.id)}
                className="press-sm flex shrink-0 items-center gap-2 rounded-lg border-2 border-[var(--border-hard)] py-1.5 pl-1.5 pr-3.5"
                style={{ backgroundColor: 'var(--surface)' }}
              >
                <span
                  className="flex h-6 w-6 items-center justify-center rounded"
                  style={{ backgroundColor: `${cat.color}22` }}
                >
                  <Icon size={13} color={cat.color} strokeWidth={1.9} />
                </span>
                <span className="text-[13px] font-medium">{cat.label}</span>
              </button>
            )
          })}
        </div>
      )}

      <div className="mt-6">
        <ExpenseList
          expenses={visibleExpenses}
          currency={currency}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          emptyIcon={Receipt}
          emptyTitle={query ? 'No matches' : 'No expenses yet'}
          emptySubtitle={query ? 'Try a different search term.' : 'Log your first expense to get started.'}
          emptyActionLabel={query ? undefined : 'Add expense'}
          onEmptyAction={query ? undefined : () => onAdd()}
        />
      </div>
    </div>
  )
}
