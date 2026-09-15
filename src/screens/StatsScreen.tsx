import { useMemo, useState } from 'react'
import { PieChart, ArrowUp, ArrowDown, Share2, Check } from 'lucide-react'
import type { Expense } from '../types'
import { MonthSwitcher } from '../components/MonthSwitcher'
import { EmptyState } from '../components/EmptyState'
import { CategoryDonut } from '../components/CategoryDonut'
import { SegmentedMeter } from '../components/SegmentedMeter'
import { CATEGORY_MAP } from '../data/categories'
import { formatCurrency, formatMonthLabel } from '../lib/format'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import { haptic } from '../lib/haptics'

interface Props {
  expenses: Expense[]
  currency: string
  year: number
  month: number
  onMonthChange: (year: number, month: number) => void
}

function totalFor(expenses: Expense[], year: number, month: number): number {
  return expenses.reduce((sum, e) => {
    const d = new Date(`${e.date}T00:00:00`)
    return d.getFullYear() === year && d.getMonth() === month ? sum + e.amount : sum
  }, 0)
}

export function StatsScreen({ expenses, currency, year, month, onMonthChange }: Props) {
  const [shared, setShared] = useState(false)
  const untaggedExpenses = useMemo(() => expenses.filter((e) => !e.tripId), [expenses])

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

  const breakdown = useMemo(() => {
    const totals = new Map<string, number>()
    for (const e of monthExpenses) {
      totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount)
    }
    return Array.from(totals.entries())
      .map(([id, amount]) => ({ cat: CATEGORY_MAP[id as keyof typeof CATEGORY_MAP], amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [monthExpenses])

  const now = new Date()
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()
  const daysElapsed = isCurrentMonth ? now.getDate() : new Date(year, month + 1, 0).getDate()
  const dailyAverage = daysElapsed > 0 ? total / daysElapsed : 0

  const prevDate = new Date(year, month - 1, 1)
  const prevTotal = totalFor(untaggedExpenses, prevDate.getFullYear(), prevDate.getMonth())
  const trendPct = prevTotal > 0 ? Math.round(((total - prevTotal) / prevTotal) * 100) : null

  async function handleShare() {
    haptic('tick')
    const lines = [
      `Expensify — ${formatMonthLabel(year, month)}`,
      `Total spent: ${formatCurrency(total, currency)}`,
      breakdown[0] ? `Top category: ${breakdown[0].cat.label} (${formatCurrency(breakdown[0].amount, currency)})` : null,
      `Daily average: ${formatCurrency(dailyAverage, currency)}`,
    ].filter(Boolean)
    const text = lines.join('\n')

    try {
      if (navigator.share) {
        await navigator.share({ text, title: 'My spending summary' })
        return
      }
      await navigator.clipboard.writeText(text)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch {
      // user cancelled the share sheet — nothing to do
    }
  }

  return (
    <div className="px-5 pb-6" style={{ paddingTop: 'calc(var(--safe-top) + 20px)' }}>
      <div className="card-flat rounded-[22px] px-5 py-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] font-medium text-[var(--text-muted)]">By category</p>
            <p className="text-4xl font-semibold tracking-tight tabular-nums">{formatCurrency(animatedTotal, currency)}</p>
          </div>
          <button
            type="button"
            onClick={handleShare}
            disabled={breakdown.length === 0}
            aria-label="Share summary"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition-opacity active:opacity-60 disabled:opacity-30"
          >
            {shared ? <Check size={17} /> : <Share2 size={17} />}
          </button>
        </div>

        <div className="mt-4">
          <MonthSwitcher year={year} month={month} onChange={onMonthChange} />
        </div>

        {breakdown.length > 0 && (
          <div className="mt-4 grid grid-cols-3 divide-x-2 divide-[var(--border)] border-t-2 border-[var(--border)] pt-3">
            <Stat label="Daily avg" value={formatCurrency(dailyAverage, currency)} />
            <Stat
              label="Vs last month"
              value={trendPct === null ? '—' : `${trendPct > 0 ? '+' : ''}${trendPct}%`}
              trend={trendPct}
            />
            <Stat label="Top category" value={breakdown[0].cat.label} />
          </div>
        )}
      </div>

      {breakdown.length > 0 && (
        <div className="mt-6">
          <CategoryDonut
            segments={breakdown.map(({ cat, amount }) => ({ color: cat.color, amount }))}
            total={total}
            currency={currency}
          />
        </div>
      )}

      <div className="mt-6 space-y-5">
        {breakdown.length === 0 && (
          <EmptyState icon={PieChart} title="Nothing to show" subtitle="Add expenses to see your breakdown." />
        )}
        {breakdown.map(({ cat, amount }) => {
          const Icon = cat.icon
          const pct = total > 0 ? Math.round((amount / total) * 100) : 0
          return (
            <div key={cat.id}>
              <div className="mb-2 flex items-center gap-2.5">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-[var(--border-hard)]"
                  style={{ backgroundColor: 'var(--surface-2)' }}
                >
                  <Icon size={15} color={cat.color} strokeWidth={1.9} />
                </span>
                <span className="flex-1 text-[14px] font-medium">{cat.label}</span>
                <span className="text-[14px] font-semibold tabular-nums">{formatCurrency(amount, currency)}</span>
                <span className="w-9 text-right text-[12.5px] text-[var(--text-muted)]">{pct}%</span>
              </div>
              <SegmentedMeter pct={pct} color={cat.color} segments={20} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ label, value, trend }: { label: string; value: string; trend?: number | null }) {
  const color = trend == null || trend === 0 ? 'var(--text)' : trend > 0 ? 'var(--danger)' : 'var(--text)'
  return (
    <div className="px-3 first:pl-0 last:pr-0">
      <p className="text-[11px] text-[var(--text-muted)]">{label}</p>
      <p className="mt-0.5 flex items-center gap-0.5 text-[14px] font-semibold tabular-nums" style={{ color }}>
        {trend != null && trend !== 0 && (trend > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
        {value}
      </p>
    </div>
  )
}
