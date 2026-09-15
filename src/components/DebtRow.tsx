import { ArrowDownLeft, ArrowUpRight, Check } from 'lucide-react'
import type { Debt } from '../types'
import { formatCurrency, formatShortDate, todayISO } from '../lib/format'

interface Props {
  debt: Debt
  currency: string
}

export function DebtRow({ debt, currency }: Props) {
  const incoming = debt.direction === 'they_owe'
  const overdue = !debt.settled && !!debt.dueDate && debt.dueDate < todayISO()

  return (
    <div className="flex w-full items-center gap-3 bg-[var(--bg)] py-3 text-left">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-[var(--border-hard)]"
        style={{ backgroundColor: debt.settled ? 'var(--surface-2)' : incoming ? 'var(--accent-2)' : 'var(--surface-2)' }}
      >
        {debt.settled ? (
          <Check size={16} color="var(--text-muted)" strokeWidth={2.25} />
        ) : incoming ? (
          <ArrowDownLeft size={16} color="var(--accent-2-text)" strokeWidth={2.1} />
        ) : (
          <ArrowUpRight size={16} color="var(--danger)" strokeWidth={2.1} />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className="block truncate text-[15px] font-medium"
          style={{ textDecoration: debt.settled ? 'line-through' : undefined, opacity: debt.settled ? 0.6 : 1 }}
        >
          {debt.person}
        </span>
        <span className="block text-[12.5px]" style={{ color: overdue ? 'var(--danger)' : 'var(--text-muted)' }}>
          {debt.settled
            ? 'Settled'
            : debt.dueDate
              ? `${overdue ? 'Overdue' : 'Due'} ${formatShortDate(debt.dueDate)}`
              : debt.note || (incoming ? 'Owed to you' : 'You owe')}
        </span>
      </span>
      <span
        className="shrink-0 text-[15px] font-semibold tabular-nums"
        style={{ opacity: debt.settled ? 0.5 : 1, color: debt.settled ? undefined : incoming ? undefined : 'var(--danger)' }}
      >
        {incoming ? '+' : '-'}
        {formatCurrency(debt.amount, currency)}
      </span>
    </div>
  )
}
