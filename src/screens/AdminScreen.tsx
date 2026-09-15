import { useEffect, useState } from 'react'
import { ChevronLeft, ShieldCheck, RotateCw } from 'lucide-react'
import type { AdminUserRow } from '../types'
import { api } from '../lib/api'

interface Props {
  onClose: () => void
}

function formatDateTime(ms: number | null): string {
  if (ms == null) return 'Never'
  return new Date(ms).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function AdminScreen({ onClose }: Props) {
  const [rows, setRows] = useState<AdminUserRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function load() {
    setLoading(true)
    setError(null)
    api
      .adminListUsers()
      .then((data) => setRows(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load users'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-[var(--bg)] bg-dither animate-sheet-up">
      <div className="flex items-center justify-between px-4 pb-3" style={{ paddingTop: 'calc(var(--safe-top) + 12px)' }}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="press-sm flex h-9 w-9 items-center justify-center rounded-lg border-2 border-[var(--border-hard)] bg-[var(--surface)] text-[var(--text)]"
          style={{ boxShadow: '2px 2px 0 var(--border-hard)' }}
        >
          <ChevronLeft size={19} />
        </button>
        <span className="flex items-center gap-1.5 text-[15px] font-semibold">
          <ShieldCheck size={16} />
          Admin
        </span>
        <button
          type="button"
          onClick={load}
          aria-label="Refresh"
          className="press-sm flex h-9 w-9 items-center justify-center rounded-lg border-2 border-[var(--border-hard)] bg-[var(--surface)] text-[var(--text)]"
          style={{ boxShadow: '2px 2px 0 var(--border-hard)' }}
        >
          <RotateCw size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <p className="mb-4 text-[13px] text-[var(--text-muted)]">
          {rows ? `${rows.length} account${rows.length === 1 ? '' : 's'}` : loading ? 'Loading…' : ''}
        </p>

        {error && (
          <p
            className="mb-4 rounded-lg border-2 px-3 py-2 text-[13px] font-medium"
            style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
          >
            {error}
          </p>
        )}

        <div className="space-y-3">
          {rows?.map((row) => (
            <div key={row.id} className="card-flat-sm rounded-xl px-4 py-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate text-[14.5px] font-semibold">{row.email}</span>
                {row.role === 'admin' && (
                  <span
                    className="shrink-0 rounded-md border-2 border-[var(--border-hard)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide"
                    style={{ backgroundColor: 'var(--accent-2)', color: 'var(--accent-2-text)' }}
                  >
                    Admin
                  </span>
                )}
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-y-1.5 text-[12.5px] text-[var(--text-muted)]">
                <span>Joined {formatDateTime(row.createdAt)}</span>
                <span>Last login {formatDateTime(row.lastLoginAt)}</span>
              </div>

              <div className="mt-2.5 flex gap-4 border-t-2 border-[var(--border)] pt-2.5 text-[12.5px]">
                <span>
                  <strong className="font-semibold">{row.expenseCount}</strong> expenses
                </span>
                <span>
                  <strong className="font-semibold">{row.tripCount}</strong> trips
                </span>
                <span>
                  <strong className="font-semibold">{row.debtCount}</strong> debts
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
