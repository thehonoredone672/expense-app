import fs from 'node:fs'
import path from 'node:path'

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data.json')

function emptyState() {
  return { users: [], expenses: [], trips: [], debts: [], settings: [] }
}

function load() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8')
    return { ...emptyState(), ...JSON.parse(raw) }
  } catch {
    return emptyState()
  }
}

const state = load()

/** Returns the live in-memory store. Mutate its arrays directly, then call persist(). */
export function getState() {
  return state
}

/** Synchronously writes the current state to disk. Data sizes here are small (personal-scale), so a full rewrite per mutation keeps things simple and crash-safe. */
export function persist() {
  fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2))
}
