import { Router } from 'express'
import crypto from 'node:crypto'
import { getState, persist } from '../db.js'
import { requireAuth } from '../auth.js'

function stripUserId({ userId: _userId, ...rest }) {
  return rest
}

/** A CRUD router scoped to the current user for a flat collection (expenses, trips, or debts). */
export function createResourceRouter(collectionName) {
  const router = Router()
  router.use(requireAuth)

  router.get('/', (req, res) => {
    const items = getState()[collectionName].filter((item) => item.userId === req.userId)
    res.json(items.map(stripUserId))
  })

  router.post('/', (req, res) => {
    const entry = { ...req.body, id: crypto.randomUUID(), userId: req.userId, createdAt: Date.now() }
    getState()[collectionName].push(entry)
    persist()
    res.status(201).json(stripUserId(entry))
  })

  router.put('/:id', (req, res) => {
    const list = getState()[collectionName]
    const idx = list.findIndex((item) => item.id === req.params.id && item.userId === req.userId)
    if (idx === -1) return res.status(404).json({ error: 'Not found' })
    list[idx] = { ...list[idx], ...req.body, id: list[idx].id, userId: list[idx].userId, createdAt: list[idx].createdAt }
    persist()
    res.json(stripUserId(list[idx]))
  })

  router.delete('/:id', (req, res) => {
    const list = getState()[collectionName]
    const idx = list.findIndex((item) => item.id === req.params.id && item.userId === req.userId)
    if (idx === -1) return res.status(404).json({ error: 'Not found' })
    list.splice(idx, 1)
    persist()
    res.status(204).end()
  })

  // Bulk clear — backs the app's "Clear all data" setting.
  router.delete('/', (req, res) => {
    const state = getState()
    state[collectionName] = state[collectionName].filter((item) => item.userId !== req.userId)
    persist()
    res.status(204).end()
  })

  return router
}
