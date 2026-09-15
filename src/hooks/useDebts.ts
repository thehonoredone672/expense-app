import { useCallback, useEffect, useState } from 'react'
import type { Debt } from '../types'
import { api } from '../lib/api'

export function useDebts() {
  const [debts, setDebts] = useState<Debt[]>([])

  const refetch = useCallback(() => {
    api
      .listDebts()
      .then(setDebts)
      .catch((err) => console.error('Failed to load debts', err))
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const addDebt = useCallback((debt: Omit<Debt, 'id' | 'createdAt' | 'settled'>) => {
    const tempId = crypto.randomUUID()
    const optimistic: Debt = { ...debt, id: tempId, createdAt: Date.now(), settled: false }
    setDebts((prev) => [optimistic, ...prev])
    api
      .createDebt({ ...debt, settled: false })
      .then((saved) => setDebts((prev) => prev.map((d) => (d.id === tempId ? saved : d))))
      .catch((err) => {
        console.error('Failed to add debt', err)
        setDebts((prev) => prev.filter((d) => d.id !== tempId))
      })
  }, [])

  const updateDebt = useCallback((id: string, patch: Omit<Debt, 'id' | 'createdAt'>) => {
    setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)))
    api.updateDebt(id, patch).catch((err) => console.error('Failed to update debt', err))
  }, [])

  const deleteDebt = useCallback((id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id))
    api.deleteDebt(id).catch((err) => console.error('Failed to delete debt', err))
  }, [])

  const setSettled = useCallback((id: string, settled: boolean) => {
    setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, settled } : d)))
    api.updateDebt(id, { settled }).catch((err) => console.error('Failed to update debt', err))
  }, [])

  const clearAll = useCallback(() => {
    setDebts([])
    api.clearDebts().catch((err) => console.error('Failed to clear debts', err))
  }, [])

  return { debts, addDebt, updateDebt, deleteDebt, setSettled, clearAll, refetch }
}
