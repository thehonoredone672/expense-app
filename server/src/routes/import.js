import { Router } from 'express'
import { getState, persist } from '../db.js'
import { requireAuth } from '../auth.js'

export const importRouter = Router()
importRouter.use(requireAuth)

/** Bulk-attaches previously-local records to the current account, skipping any id already present. */
importRouter.post('/', (req, res) => {
  const { expenses = [], trips = [], debts = [] } = req.body || {}
  const state = getState()
  const result = { expenses: 0, trips: 0, debts: 0 }

  for (const e of Array.isArray(expenses) ? expenses : []) {
    if (state.expenses.some((x) => x.id === e.id)) continue
    state.expenses.push({ ...e, userId: req.userId })
    result.expenses++
  }
  for (const t of Array.isArray(trips) ? trips : []) {
    if (state.trips.some((x) => x.id === t.id)) continue
    state.trips.push({ ...t, userId: req.userId })
    result.trips++
  }
  for (const d of Array.isArray(debts) ? debts : []) {
    if (state.debts.some((x) => x.id === d.id)) continue
    state.debts.push({ ...d, userId: req.userId })
    result.debts++
  }

  persist()
  res.json(result)
})
