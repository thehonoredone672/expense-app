import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import { getState, persist } from './db.js'
import { authRouter } from './routes/auth.js'
import { createResourceRouter } from './routes/resource.js'
import { settingsRouter } from './routes/settings.js'
import { importRouter } from './routes/import.js'
import { adminRouter } from './routes/admin.js'

const app = express()
const PORT = process.env.PORT || 3001
const CORS_ORIGIN = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim())

app.use(cors({ origin: CORS_ORIGIN }))
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRouter)
app.use('/api/expenses', createResourceRouter('expenses'))
app.use('/api/trips', createResourceRouter('trips'))
app.use('/api/debts', createResourceRouter('debts'))
app.use('/api/settings', settingsRouter)
app.use('/api/import', importRouter)
app.use('/api/admin', adminRouter)

app.use((err, req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Something went wrong' })
})

/** Ensures ADMIN_EMAIL always has admin access, creating the account on first boot if needed. */
async function bootstrapAdmin() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn('[admin] ADMIN_EMAIL/ADMIN_PASSWORD not set — no admin account will be created or promoted.')
    return
  }
  const email = ADMIN_EMAIL.trim().toLowerCase()
  const state = getState()
  const existing = state.users.find((u) => u.email === email)

  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin'
      persist()
      console.log(`[admin] Promoted existing user ${email} to admin`)
    }
    return
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)
  const user = {
    id: crypto.randomUUID(),
    email,
    passwordHash,
    role: 'admin',
    createdAt: Date.now(),
    lastLoginAt: null,
  }
  state.users.push(user)
  state.settings.push({ userId: user.id, currency: 'USD', theme: 'system', budget: null, notificationsEnabled: false })
  persist()
  console.log(`[admin] Created admin account for ${email}`)
}

bootstrapAdmin().then(() => {
  app.listen(PORT, () => console.log(`Expensify API listening on port ${PORT}`))
})
