import { useState } from 'react'
import { DatabaseBackup } from 'lucide-react'

interface Props {
  onImport: () => Promise<void>
  onSkip: () => void
}

export function LegacyImportPrompt({ onImport, onSkip }: Props) {
  const [importing, setImporting] = useState(false)

  async function handleImport() {
    setImporting(true)
    await onImport()
    setImporting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6 animate-fade-in">
      <div className="card-flat w-full max-w-xs rounded-[22px] bg-[var(--bg)] px-5 py-6 text-center">
        <span
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border-2 border-[var(--border-hard)]"
          style={{ backgroundColor: 'var(--accent-2)' }}
        >
          <DatabaseBackup size={22} color="var(--accent-2-text)" />
        </span>
        <p className="mt-4 text-[15px] font-semibold">Import your existing data?</p>
        <p className="mt-1.5 text-[13px] text-[var(--text-muted)]">
          This browser has expenses, trips, or debts saved from before accounts existed. Attach them to this
          account?
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleImport}
            disabled={importing}
            className="press flex w-full items-center justify-center rounded-lg border-2 border-[var(--border-hard)] py-2.5 text-[14.5px] font-semibold disabled:opacity-60"
            style={{ backgroundColor: 'var(--accent-2)', color: 'var(--accent-2-text)', boxShadow: '3px 3px 0 var(--border-hard)' }}
          >
            {importing ? 'Importing…' : 'Import it'}
          </button>
          <button
            type="button"
            onClick={onSkip}
            disabled={importing}
            className="press-sm flex w-full items-center justify-center rounded-lg border-2 border-[var(--border-hard)] bg-[var(--surface)] py-2.5 text-[14.5px] font-medium disabled:opacity-60"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}
