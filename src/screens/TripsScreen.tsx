import { useMemo } from 'react'
import { Plane } from 'lucide-react'
import type { Expense, Trip } from '../types'
import { TripCard } from '../components/TripCard'
import { EmptyState } from '../components/EmptyState'

interface Props {
  trips: Trip[]
  expenses: Expense[]
  currency: string
  onSelect: (id: string) => void
  onNewTrip: () => void
}

export function TripsScreen({ trips, expenses, currency, onSelect, onNewTrip }: Props) {
  const spentByTrip = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of expenses) {
      if (!e.tripId) continue
      map.set(e.tripId, (map.get(e.tripId) ?? 0) + e.amount)
    }
    return map
  }, [expenses])

  const sortedTrips = useMemo(() => trips.slice().sort((a, b) => b.createdAt - a.createdAt), [trips])

  return (
    <div className="px-5 pb-6" style={{ paddingTop: 'calc(var(--safe-top) + 20px)' }}>
      <h1 className="mb-5 text-2xl font-semibold tracking-tight">Trips</h1>

      {sortedTrips.length === 0 ? (
        <EmptyState
          icon={Plane}
          title="No trips yet"
          subtitle="Set a fixed budget for a vacation or event and track spending against it."
          actionLabel="New trip"
          onAction={onNewTrip}
        />
      ) : (
        <div className="divide-y-2 divide-[var(--border)] border-t-2 border-[var(--border)]">
          {sortedTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              spent={spentByTrip.get(trip.id) ?? 0}
              currency={currency}
              onClick={() => onSelect(trip.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
