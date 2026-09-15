import { Router } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import { getState, persist } from '../db.js'
import { signToken, publicUser, requireAuth } from '../auth.js'

export const authRouter = Router()

const DEFAULT_SETTINGS = { currency: 'USD', theme: 'system', budget: null, notificationsEnabled: false }

function normalizeEmail(email) {
  return String(email).trim().toLowerCase()
}

authRouter.post('/signup', async (req, res) => {
  const { email, password } = req.body || {}
  if (typeof email !== 'string' || !email.includes('@') || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'A valid email and a password of at least 8 characters are required' })
  }
  const normalizedEmail = normalizeEmail(email)
  const state = getState()
  if (state.users.some((u) => u.email === normalizedEmail)) {
    return res.status(409).json({ error: 'An account with that email already exists' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    passwordHash,
    role: 'user',
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
  }
  state.users.push(user)
  state.settings.push({ userId: user.id, ...DEFAULT_SETTINGS })
  persist()

  res.status(201).json({ token: signToken(user), user: publicUser(user) })
})

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password are required' })
  }
  const normalizedEmail = normalizeEmail(email)
  const state = getState()
  const user = state.users.find((u) => u.email === normalizedEmail)
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Incorrect email or password' })
  }

  user.lastLoginAt = Date.now()
  persist()

  res.json({ token: signToken(user), user: publicUser(user) })
})

authRouter.get('/me', requireAuth, (req, res) => {
  const user = getState().users.find((u) => u.id === req.userId)
  if (!user) return res.status(401).json({ error: 'Not authenticated' })
  res.json({ user: publicUser(user) })
})
