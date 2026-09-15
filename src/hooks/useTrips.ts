import { useCallback, useEffect, useState } from 'react'
import type { Trip } from '../types'
import { api } from '../lib/api'

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([])

  const refetch = useCallback(() => {
    api
      .listTrips()
      .then(setTrips)
      .catch((err) => console.error('Failed to load trips', err))
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const addTrip = useCallback((trip: Omit<Trip, 'id' | 'createdAt'>) => {
    const tempId = crypto.randomUUID()
    const optimistic: Trip = { ...trip, id: tempId, createdAt: Date.now() }
    setTrips((prev) => [optimistic, ...prev])
    api
      .createTrip(trip)
      .then((saved) => setTrips((prev) => prev.map((t) => (t.id === tempId ? saved : t))))
      .catch((err) => {
        console.error('Failed to add trip', err)
        setTrips((prev) => prev.filter((t) => t.id !== tempId))
      })
    return tempId
  }, [])

  const updateTrip = useCallback((id: string, patch: Omit<Trip, 'id' | 'createdAt'>) => {
    setTrips((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
    api.updateTrip(id, patch).catch((err) => console.error('Failed to update trip', err))
  }, [])

  const deleteTrip = useCallback((id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id))
    api.deleteTrip(id).catch((err) => console.error('Failed to delete trip', err))
  }, [])

  return { trips, addTrip, updateTrip, deleteTrip, refetch }
}
