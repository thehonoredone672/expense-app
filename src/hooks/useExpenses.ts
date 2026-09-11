import { useCallback, useEffect, useState } from 'react'
import type { Expense } from '../types'
import { loadExpenses, saveExpenses } from '../lib/storage'

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(() => loadExpenses())

  useEffect(() => {
    saveExpenses(expenses)
  }, [expenses])

  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const entry: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    }
    setExpenses((prev) => [entry, ...prev])
  }, [])

  const updateExpense = useCallback((id: string, patch: Omit<Expense, 'id' | 'createdAt'>) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }, [])

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setExpenses([])
  }, [])

  const importExpenses = useCallback((incoming: Expense[]) => {
    setExpenses((prev) => {
      const existingIds = new Set(prev.map((e) => e.id))
      const added = incoming.filter((e) => !existingIds.has(e.id))
      return [...added, ...prev]
    })
  }, [])

  const unassignTrip = useCallback((tripId: string) => {
    setExpenses((prev) => prev.map((e) => (e.tripId === tripId ? { ...e, tripId: null } : e)))
  }, [])

  return { expenses, addExpense, updateExpense, deleteExpense, clearAll, importExpenses, unassignTrip }
}
