import { useMemo, useState } from 'react'
import { HandCoins } from 'lucide-react'
import type { Debt } from '../types'
import { DebtRow } from '../components/DebtRow'
import { SwipeToDelete } from '../components/SwipeToDelete'
import { EmptyState } from '../components/EmptyState'
import { formatCurrency, todayISO } from '../lib/format'

interface Props {
  debts: Debt[]
  currency: string
  onEdit: (debt: Debt) => void
  onDelete: (id: string) => void
  onToggleSettled: (debt: Debt) => void
  onNewDebt: () => void
}

export function DebtsScreen({ debts, currency, onEdit, onDelete, onToggleSettled, onNewDebt }: Props) {
  const [openRowId, setOpenRowId] = useState<string | null>(null)
  const today = todayISO()

  const { active, settled, owedToMe, iOwe } = useMemo(() => {
    const active = debts
      .filter((d) => !d.settled)
      .sort((a, b) => {
        const aOverdue = a.dueDate ? a.dueDate < today : false
        const bOverdue = b.dueDate ? b.dueDate < today : false
        if (aOverdue !== bOverdue) return aOverdue ? -1 : 1
        if (a.dueDate && b.dueDate) return a.dueDate < b.dueDate ? -1 : 1
        if (a.dueDate) return -1
        if (b.dueDate) return 1
        return b.createdAt - a.createdAt
      })
    const settled = debts.filter((d) => d.settled).sort((a, b) => b.createdAt - a.createdAt)
    const owedToMe = active.filter((d) => d.direction === 'they_owe').reduce((sum, d) => sum + d.amount, 0)
    const iOwe = active.filter((d) => d.direction === 'i_owe').reduce((sum, d) => sum + d.amount, 0)
    return { active, settled, owedToMe, iOwe }
  }, [debts, today])

  const net = owedToMe - iOwe

  return (
    <div className="px-5 pb-6" style={{ paddingTop: 'calc(var(--safe-top) + 20px)' }}>
      <div className="card-flat rounded-[22px] px-5 py-5">
        <p className="text-[13px] font-medium text-[var(--text-muted)]">
          {net >= 0 ? "You're owed, net" : "You owe, net"}
        </p>
        <p
          className="text-4xl font-semibold tracking-tight tabular-nums"
          style={{ color: net < 0 ? 'var(--danger)' : undefined }}
        >
          {formatCurrency(Math.abs(net), currency)}
        </p>

        <div className="mt-4 grid grid-cols-2 divide-x-2 divide-[var(--border)] border-t-2 border-[var(--border)] pt-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Owed to you</p>
            <p className="mt-0.5 text-[15px] font-semibold tabular-nums">{formatCurrency(owedToMe, currency)}</p>
          </div>
          <div className="pl-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">You owe</p>
            <p className="mt-0.5 text-[15px] font-semibold tabular-nums" style={{ color: iOwe > 0 ? 'var(--danger)' : undefined }}>
              {formatCurrency(iOwe, currency)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {active.length === 0 && settled.length === 0 && (
          <EmptyState
            icon={HandCoins}
            title="No debts tracked"
            subtitle="Keep tabs on money you've lent or borrowed."
            actionLabel="Add debt"
            onAction={onNewDebt}
          />
        )}

        {active.length > 0 && (
          <div>
            <p className="pb-1 text-[12px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Active</p>
            <div className="divide-y-2 divide-[var(--border)] border-t-2 border-[var(--border)]">
              {active.map((debt) => (
                <SwipeToDelete
                  key={debt.id}
                  isOpen={openRowId === debt.id}
                  onOpenChange={(open) => setOpenRowId(open ? debt.id : null)}
                  onDelete={() => onDelete(debt.id)}
                  onTap={() => onEdit(debt)}
                  onLongPress={() => onToggleSettled(debt)}
                  deleteLabel="Delete debt"
                >
                  <DebtRow debt={debt} currency={currency} />
                </SwipeToDelete>
              ))}
            </div>
          </div>
        )}

        {settled.length > 0 && (
          <div className={active.length > 0 ? 'mt-5' : ''}>
            <p className="pb-1 text-[12px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Settled</p>
            <div className="divide-y-2 divide-[var(--border)] border-t-2 border-[var(--border)]">
              {settled.map((debt) => (
                <SwipeToDelete
                  key={debt.id}
                  isOpen={openRowId === debt.id}
                  onOpenChange={(open) => setOpenRowId(open ? debt.id : null)}
                  onDelete={() => onDelete(debt.id)}
                  onTap={() => onEdit(debt)}
                  onLongPress={() => onToggleSettled(debt)}
                  deleteLabel="Delete debt"
                >
                  <DebtRow debt={debt} currency={currency} />
                </SwipeToDelete>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
