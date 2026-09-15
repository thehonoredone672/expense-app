import { Router } from 'express'
import { getState, persist } from '../db.js'
import { requireAuth } from '../auth.js'

export const settingsRouter = Router()
settingsRouter.use(requireAuth)

const DEFAULTS = { currency: 'USD', theme: 'system', budget: null, notificationsEnabled: false }

function findOrCreate(req) {
  const state = getState()
  let row = state.settings.find((s) => s.userId === req.userId)
  if (!row) {
    row = { userId: req.userId, ...DEFAULTS }
    state.settings.push(row)
    persist()
  }
  return row
}

function stripUserId({ userId: _userId, ...rest }) {
  return rest
}

settingsRouter.get('/', (req, res) => {
  res.json(stripUserId(findOrCreate(req)))
})

settingsRouter.put('/', (req, res) => {
  const row = findOrCreate(req)
  Object.assign(row, req.body)
  persist()
  res.json(stripUserId(row))
})
