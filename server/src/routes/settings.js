import { Router } from 'express'
import { collections, stripInternal } from '../db.js'
import { requireAuth } from '../auth.js'

export const settingsRouter = Router()
settingsRouter.use(requireAuth)

const DEFAULTS = { currency: 'USD', theme: 'system', budget: null, notificationsEnabled: false }

async function findOrCreate(req) {
  const coll = collections().settings
  const row = await coll.findOne({ userId: req.userId })
  if (row) return row
  const created = { userId: req.userId, ...DEFAULTS }
  await coll.insertOne(created)
  return created
}

settingsRouter.get('/', async (req, res) => {
  res.json(stripInternal(await findOrCreate(req)))
})

settingsRouter.put('/', async (req, res) => {
  await findOrCreate(req)
  const patch = { ...req.body }
  delete patch.userId
  const row = await collections().settings.findOneAndUpdate(
    { userId: req.userId },
    { $set: patch },
    { returnDocument: 'after' },
  )
  res.json(stripInternal(row))
})
