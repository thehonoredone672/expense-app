import { useCallback, useEffect, useState } from 'react'
import type { Expense } from '../types'
import { api } from '../lib/api'

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])

  const refetch = useCallback(() => {
    api
      .listExpenses()
      .then(setExpenses)
      .catch((err) => console.error('Failed to load expenses', err))
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const tempId = crypto.randomUUID()
    const optimistic: Expense = { ...expense, id: tempId, createdAt: Date.now() }
    setExpenses((prev) => [optimistic, ...prev])
    api
      .createExpense(expense)
      .then((saved) => setExpenses((prev) => prev.map((e) => (e.id === tempId ? saved : e))))
      .catch((err) => {
        console.error('Failed to add expense', err)
        setExpenses((prev) => prev.filter((e) => e.id !== tempId))
      })
  }, [])

  const updateExpense = useCallback((id: string, patch: Omit<Expense, 'id' | 'createdAt'>) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
    api.updateExpense(id, patch).catch((err) => console.error('Failed to update expense', err))
  }, [])

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
    api.deleteExpense(id).catch((err) => console.error('Failed to delete expense', err))
  }, [])

  const clearAll = useCallback(() => {
    setExpenses([])
    api.clearExpenses().catch((err) => console.error('Failed to clear expenses', err))
  }, [])

  const unassignTrip = useCallback(
    (tripId: string) => {
      setExpenses((prev) => {
        for (const e of prev) {
          if (e.tripId === tripId) {
            api.updateExpense(e.id, { tripId: null }).catch((err) => console.error('Failed to unassign trip', err))
          }
        }
        return prev.map((e) => (e.tripId === tripId ? { ...e, tripId: null } : e))
      })
    },
    [],
  )

  return { expenses, addExpense, updateExpense, deleteExpense, clearAll, unassignTrip, refetch }
}
