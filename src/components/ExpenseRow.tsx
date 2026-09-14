import type { Expense } from '../types'
import { CATEGORY_MAP } from '../data/categories'
import { formatCurrency } from '../lib/format'

interface Props {
  expense: Expense
  currency: string
}

export function ExpenseRow({ expense, currency }: Props) {
  const cat = CATEGORY_MAP[expense.category]
  const Icon = cat.icon

  return (
    <div className="flex w-full items-center gap-3 bg-[var(--bg)] py-3 text-left">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2"
        style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border-hard)' }}
      >
        <Icon size={16} color={cat.color} strokeWidth={1.9} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium">{expense.note || cat.label}</span>
        {expense.note && <span className="block text-[12.5px] text-[var(--text-muted)]">{cat.label}</span>}
      </span>
      <span className="shrink-0 text-[15px] font-semibold tabular-nums">
        {formatCurrency(expense.amount, currency)}
      </span>
    </div>
  )
}
