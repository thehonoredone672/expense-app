import { Router } from 'express'
import crypto from 'node:crypto'
import { collections, stripInternal } from '../db.js'
import { requireAuth } from '../auth.js'

/** A CRUD router scoped to the current user for a flat collection (expenses, trips, or debts). */
export function createResourceRouter(collectionName) {
  const router = Router()
  router.use(requireAuth)

  router.get('/', async (req, res) => {
    const items = await collections()[collectionName].find({ userId: req.userId }).toArray()
    res.json(items.map(stripInternal))
  })

  router.post('/', async (req, res) => {
    const entry = { ...req.body, id: crypto.randomUUID(), userId: req.userId, createdAt: Date.now() }
    await collections()[collectionName].insertOne(entry)
    res.status(201).json(stripInternal(entry))
  })

  router.put('/:id', async (req, res) => {
    const coll = collections()[collectionName]
    const patch = { ...req.body }
    delete patch.id
    delete patch.userId
    delete patch.createdAt

    const result = await coll.findOneAndUpdate(
      { id: req.params.id, userId: req.userId },
      { $set: patch },
      { returnDocument: 'after' },
    )
    if (!result) return res.status(404).json({ error: 'Not found' })
    res.json(stripInternal(result))
  })

  router.delete('/:id', async (req, res) => {
    const result = await collections()[collectionName].deleteOne({ id: req.params.id, userId: req.userId })
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' })
    res.status(204).end()
  })

  // Bulk clear — backs the app's "Clear all data" setting.
  router.delete('/', async (req, res) => {
    await collections()[collectionName].deleteMany({ userId: req.userId })
    res.status(204).end()
  })

  return router
}
