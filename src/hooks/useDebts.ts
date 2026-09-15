import { useCallback, useEffect, useState } from 'react'
import type { Debt } from '../types'
import { loadDebts, saveDebts } from '../lib/storage'

export function useDebts() {
  const [debts, setDebts] = useState<Debt[]>(() => loadDebts())

  useEffect(() => {
    saveDebts(debts)
  }, [debts])

  const addDebt = useCallback((debt: Omit<Debt, 'id' | 'createdAt' | 'settled'>) => {
    const entry: Debt = { ...debt, id: crypto.randomUUID(), createdAt: Date.now(), settled: false }
    setDebts((prev) => [entry, ...prev])
    return entry.id
  }, [])

  const updateDebt = useCallback((id: string, patch: Omit<Debt, 'id' | 'createdAt'>) => {
    setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  }, [])

  const deleteDebt = useCallback((id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id))
  }, [])

  const setSettled = useCallback((id: string, settled: boolean) => {
    setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, settled } : d)))
  }, [])

  const clearAll = useCallback(() => {
    setDebts([])
  }, [])

  const importDebts = useCallback((incoming: Debt[]) => {
    setDebts((prev) => {
      const existingIds = new Set(prev.map((d) => d.id))
      const added = incoming.filter((d) => !existingIds.has(d.id))
      return [...added, ...prev]
    })
  }, [])

  return { debts, addDebt, updateDebt, deleteDebt, setSettled, clearAll, importDebts }
}
