import jwt from 'jsonwebtoken'
import { getState } from './db.js'

const SECRET = process.env.JWT_SECRET
if (!SECRET) {
  console.warn('[warn] JWT_SECRET is not set — using an insecure development default. Set JWT_SECRET before deploying.')
}
const EFFECTIVE_SECRET = SECRET || 'dev-insecure-secret-change-me'
const EXPIRES_IN = '30d'

export function signToken(user) {
  return jwt.sign({ sub: user.id }, EFFECTIVE_SECRET, { expiresIn: EXPIRES_IN })
}

export function publicUser(user) {
  return { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt }
}

/** Verifies the bearer token and attaches req.userId. */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Not authenticated' })
  try {
    const payload = jwt.verify(token, EFFECTIVE_SECRET)
    req.userId = payload.sub
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' })
  }
}

/** Must run after requireAuth. Rejects unless the current user's role is 'admin'. */
export function requireAdmin(req, res, next) {
  const user = getState().users.find((u) => u.id === req.userId)
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' })
  next()
}
