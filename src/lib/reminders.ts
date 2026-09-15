const SEEN_KEY = 'centsible.notified.v1'

function loadSeen(): Record<string, string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveSeen(seen: Record<string, string>) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen))
  } catch {
    // ignore
  }
}

/** Whether `key` hasn't fired within the last `windowDays` days. */
export function shouldNotify(key: string, windowDays = 1): boolean {
  const seen = loadSeen()
  const last = seen[key]
  if (!last) return true
  const daysSince = (Date.now() - new Date(last).getTime()) / 86_400_000
  return daysSince >= windowDays
}

export function markNotified(key: string) {
  const seen = loadSeen()
  seen[key] = new Date().toISOString()
  saveSeen(seen)
}
