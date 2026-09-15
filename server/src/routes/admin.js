import { Router } from 'express'
import { collections } from '../db.js'
import { requireAuth, requireAdmin } from '../auth.js'

export const adminRouter = Router()
adminRouter.use(requireAuth, requireAdmin)

// Account activity only — never the actual expense/trip/debt contents.
adminRouter.get('/users', async (req, res) => {
  const { users, expenses, trips, debts } = collections()
  const allUsers = await users.find({}).toArray()

  const rows = await Promise.all(
    allUsers.map(async (u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt ?? null,
      expenseCount: await expenses.countDocuments({ userId: u.id }),
      tripCount: await trips.countDocuments({ userId: u.id }),
      debtCount: await debts.countDocuments({ userId: u.id }),
    })),
  )
  rows.sort((a, b) => b.createdAt - a.createdAt)
  res.json(rows)
})
