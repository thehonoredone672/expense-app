import { Router } from 'express'
import { collections } from '../db.js'
import { requireAuth } from '../auth.js'

export const importRouter = Router()
importRouter.use(requireAuth)

/** Bulk-attaches previously-local records to the current account, skipping any id already present. */
importRouter.post('/', async (req, res) => {
  const { expenses = [], trips = [], debts = [] } = req.body || {}
  const result = { expenses: 0, trips: 0, debts: 0 }

  for (const [key, incoming] of [
    ['expenses', expenses],
    ['trips', trips],
    ['debts', debts],
  ]) {
    const coll = collections()[key]
    for (const item of Array.isArray(incoming) ? incoming : []) {
      if (await coll.findOne({ id: item.id })) continue
      await coll.insertOne({ ...item, userId: req.userId })
      result[key]++
    }
  }

  res.json(result)
})
