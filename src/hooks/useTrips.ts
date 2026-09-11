import { useCallback, useEffect, useState } from 'react'
import type { Trip } from '../types'
import { loadTrips, saveTrips } from '../lib/storage'

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>(() => loadTrips())

  useEffect(() => {
    saveTrips(trips)
  }, [trips])

  const addTrip = useCallback((trip: Omit<Trip, 'id' | 'createdAt'>) => {
    const entry: Trip = { ...trip, id: crypto.randomUUID(), createdAt: Date.now() }
    setTrips((prev) => [entry, ...prev])
    return entry.id
  }, [])

  const updateTrip = useCallback((id: string, patch: Omit<Trip, 'id' | 'createdAt'>) => {
    setTrips((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }, [])

  const deleteTrip = useCallback((id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const importTrips = useCallback((incoming: Trip[]) => {
    setTrips((prev) => {
      const existingIds = new Set(prev.map((t) => t.id))
      const added = incoming.filter((t) => !existingIds.has(t.id))
      return [...added, ...prev]
    })
  }, [])

  return { trips, addTrip, updateTrip, deleteTrip, importTrips }
}
