import { useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { Expense } from '../types'
import { ExpenseRow } from './ExpenseRow'
import { SwipeToDelete } from './SwipeToDelete'
import { EmptyState } from './EmptyState'
import { formatDateHeading } from '../lib/format'

interface Props {
  expenses: Expense[]
  currency: string
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
  emptyIcon: LucideIcon
  emptyTitle: string
  emptySubtitle: string
  emptyActionLabel?: string
  onEmptyAction?: () => void
}

export function ExpenseList({
  expenses,
  currency,
  onEdit,
  onDelete,
  emptyIcon,
  emptyTitle,
  emptySubtitle,
  emptyActionLabel,
  onEmptyAction,
}: Props) {
  const [openRowId, setOpenRowId] = useState<string | null>(null)

  const groups = useMemo(() => {
    const sorted = expenses
      .slice()
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt))
    const map = new Map<string, Expense[]>()
    for (const e of sorted) {
      const list = map.get(e.date) ?? []
      list.push(e)
      map.set(e.date, list)
    }
    return Array.from(map.entries())
  }, [expenses])

  if (groups.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        subtitle={emptySubtitle}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    )
  }

  return (
    <div>
      {groups.map(([date, items], idx) => (
        <div key={date} className={idx > 0 ? 'mt-5' : ''}>
          <p className="pb-1 text-[12px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            {formatDateHeading(date)}
          </p>
          <div className="divide-y divide-[var(--border)] border-t border-[var(--border)]">
            {items.map((expense) => (
              <SwipeToDelete
                key={expense.id}
                isOpen={openRowId === expense.id}
                onOpenChange={(open) => setOpenRowId(open ? expense.id : null)}
                onDelete={() => onDelete(expense.id)}
                onTap={() => onEdit(expense)}
              >
                <ExpenseRow expense={expense} currency={currency} />
              </SwipeToDelete>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
