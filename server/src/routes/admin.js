import { Router } from 'express'
import { getState } from '../db.js'
import { requireAuth, requireAdmin } from '../auth.js'

export const adminRouter = Router()
adminRouter.use(requireAuth, requireAdmin)

// Account activity only — never the actual expense/trip/debt contents.
adminRouter.get('/users', (req, res) => {
  const state = getState()
  const rows = state.users.map((u) => ({
    id: u.id,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt ?? null,
    expenseCount: state.expenses.filter((e) => e.userId === u.id).length,
    tripCount: state.trips.filter((t) => t.userId === u.id).length,
    debtCount: state.debts.filter((d) => d.userId === u.id).length,
  }))
  rows.sort((a, b) => b.createdAt - a.createdAt)
  res.json(rows)
})
