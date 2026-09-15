import { useMemo } from 'react'
import { ArrowLeft, Pencil, Plus, Luggage } from 'lucide-react'
import type { Expense, Trip } from '../types'
import { TRIP_ICON_MAP } from '../data/tripIcons'
import { ExpenseList } from '../components/ExpenseList'
import { SheetGrabber } from '../components/SheetGrabber'
import { SegmentedMeter } from '../components/SegmentedMeter'
import { formatCurrency } from '../lib/format'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import { useSheetDrag } from '../hooks/useSheetDrag'

interface Props {
  trip: Trip
  expenses: Expense[]
  currency: string
  onClose: () => void
  onEditTrip: () => void
  onAddExpense: () => void
  onEditExpense: (expense: Expense) => void
  onDeleteExpense: (id: string) => void
  onDuplicateExpense: (expense: Expense) => void
}

export function TripDetailScreen({
  trip,
  expenses,
  currency,
  onClose,
  onEditTrip,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onDuplicateExpense,
}: Props) {
  const tripExpenses = useMemo(() => expenses.filter((e) => e.tripId === trip.id), [expenses, trip.id])
  const spent = tripExpenses.reduce((sum, e) => sum + e.amount, 0)
  const pct = trip.budget > 0 ? Math.min(100, Math.round((spent / trip.budget) * 100)) : 0
  const over = spent > trip.budget
  const remaining = trip.budget - spent
  const animatedRemaining = useAnimatedNumber(Math.abs(remaining))
  const Icon = TRIP_ICON_MAP[trip.icon]
  const { dragging, handleStyle, handlers } = useSheetDrag(onClose)

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-[var(--bg)] bg-dither animate-sheet-up" style={handleStyle}>
      <div {...handlers} style={{ touchAction: 'none', paddingTop: 'var(--safe-top)' }}>
        <SheetGrabber />
      </div>

      <div className="flex items-center justify-between px-4 pb-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Back to trips"
          className="press-sm flex h-9 w-9 items-center justify-center rounded-lg border-2 border-[var(--border-hard)] bg-[var(--surface)] text-[var(--text)]"
          style={{ boxShadow: '2px 2px 0 var(--border-hard)' }}
        >
          <ArrowLeft size={17} />
        </button>
        <span {...handlers} style={{ touchAction: 'none' }} className="text-[15px] font-semibold">
          Trip
        </span>
        <button
          type="button"
          onClick={onAddExpense}
          aria-label="Add expense to trip"
          className="press-sm flex h-9 w-9 items-center justify-center rounded-lg border-2 border-[var(--border-hard)]"
          style={{ backgroundColor: 'var(--accent-2)', color: 'var(--accent-2-text)', boxShadow: '2px 2px 0 var(--border-hard)' }}
        >
          <Plus size={19} strokeWidth={2.75} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6" style={dragging ? { overflow: 'hidden' } : undefined}>
        <div className="card-flat rounded-[22px] px-5 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[var(--border-hard)]"
                style={{ backgroundColor: 'var(--surface-2)' }}
              >
                <Icon size={18} color="var(--text)" strokeWidth={1.75} />
              </span>
              <span className="text-[17px] font-semibold">{trip.name}</span>
            </div>
            <button
              type="button"
              onClick={onEditTrip}
              aria-label="Edit trip"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-opacity active:opacity-60"
            >
              <Pencil size={15} />
            </button>
          </div>

          <div className="mt-5">
            <p className="text-[13px] font-medium text-[var(--text-muted)]">
              {over ? 'Over budget by' : 'Remaining'}
            </p>
            <p className="text-4xl font-semibold tracking-tight tabular-nums" style={{ color: over ? 'var(--danger)' : undefined }}>
              {formatCurrency(animatedRemaining, currency)}
            </p>
            <div className="mt-3">
              <SegmentedMeter pct={pct} color={over ? 'var(--danger)' : 'var(--accent-2)'} />
            </div>
            <p className="mt-1.5 text-[12.5px] text-[var(--text-muted)]">
              {formatCurrency(spent, currency)} spent of {formatCurrency(trip.budget, currency)} budget
            </p>
          </div>
        </div>

        <div className="mt-6">
          <ExpenseList
            expenses={tripExpenses}
            currency={currency}
            onEdit={onEditExpense}
            onDelete={onDeleteExpense}
            onDuplicate={onDuplicateExpense}
            emptyIcon={Luggage}
            emptyTitle="No expenses logged"
            emptySubtitle="Add an expense to start tracking this trip's spending."
            emptyActionLabel="Add expense"
            onEmptyAction={onAddExpense}
          />
        </div>
      </div>
    </div>
  )
}
