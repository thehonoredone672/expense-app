import type { Trip } from '../types'
import { TRIP_ICON_MAP } from '../data/tripIcons'
import { formatCurrency } from '../lib/format'

interface Props {
  trip: Trip
  spent: number
  currency: string
  onClick: () => void
}

export function TripCard({ trip, spent, currency, onClick }: Props) {
  const Icon = TRIP_ICON_MAP[trip.icon]
  const pct = trip.budget > 0 ? Math.min(100, Math.round((spent / trip.budget) * 100)) : 0
  const over = spent > trip.budget
  const remaining = trip.budget - spent

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3.5 py-3.5 text-left transition-opacity active:opacity-60"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)]">
        <Icon size={19} color="var(--text)" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[15px] font-semibold">{trip.name}</span>
          <span
            className="shrink-0 text-[13px] font-medium tabular-nums"
            style={{ color: over ? 'var(--danger)' : 'var(--text-muted)' }}
          >
            {over ? `${formatCurrency(-remaining, currency)} over` : `${formatCurrency(remaining, currency)} left`}
          </span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              background: over ? 'var(--danger)' : 'linear-gradient(90deg, var(--accent-1), var(--accent-2))',
            }}
          />
        </div>
        <p className="mt-1.5 text-[12.5px] text-[var(--text-muted)]">
          {formatCurrency(spent, currency)} of {formatCurrency(trip.budget, currency)}
        </p>
      </div>
    </button>
  )
}
