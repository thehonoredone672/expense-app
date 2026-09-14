import { useRef, useState } from 'react'
import { Trash2, Check, Download, Upload, FileSpreadsheet } from 'lucide-react'
import type { Settings, ThemePreference } from '../types'
import { CURRENCIES, getCurrencySymbol } from '../lib/format'

interface Props {
  settings: Settings
  expenseCount: number
  onUpdate: (patch: Partial<Settings>) => void
  onClearAll: () => void
  onExportJSON: () => void
  onExportCSV: () => void
  onImportFile: (file: File) => void
}

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

export function SettingsScreen({
  settings,
  expenseCount,
  onUpdate,
  onClearAll,
  onExportJSON,
  onExportCSV,
  onImportFile,
}: Props) {
  const [confirming, setConfirming] = useState(false)
  const [budgetInput, setBudgetInput] = useState(settings.budget != null ? String(settings.budget) : '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleClear() {
    if (!confirming) {
      setConfirming(true)
      return
    }
    onClearAll()
    setConfirming(false)
  }

  function commitBudget() {
    const parsed = parseFloat(budgetInput)
    onUpdate({ budget: budgetInput.trim() === '' || Number.isNaN(parsed) || parsed <= 0 ? null : parsed })
  }

  return (
    <div className="space-y-7 px-5 pb-8" style={{ paddingTop: 'calc(var(--safe-top) + 20px)' }}>
      <h1 className="text-2xl font-semibold">Settings</h1>

      <section>
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Appearance</p>
        <div className="flex gap-1.5 rounded-lg border-2 border-[var(--border-hard)] p-1">
          {THEME_OPTIONS.map((opt) => {
            const selected = settings.theme === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onUpdate({ theme: opt.value })}
                className="flex-1 rounded py-2 text-[13.5px] font-semibold transition-all"
                style={{
                  backgroundColor: selected ? 'var(--accent-2)' : 'transparent',
                  color: selected ? 'var(--accent-2-text)' : 'var(--text-muted)',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Currency</p>
        <div className="grid grid-cols-4 gap-2">
          {CURRENCIES.map((code) => {
            const selected = settings.currency === code
            return (
              <button
                key={code}
                type="button"
                onClick={() => onUpdate({ currency: code })}
                className="press-sm flex items-center justify-center gap-1 rounded-lg border-2 border-[var(--border-hard)] py-2.5 text-[13.5px] font-semibold"
                style={{
                  backgroundColor: selected ? 'var(--accent-2)' : 'var(--surface)',
                  color: selected ? 'var(--accent-2-text)' : 'var(--text)',
                  boxShadow: selected ? '2px 2px 0 var(--border-hard)' : undefined,
                }}
              >
                {selected && <Check size={13} strokeWidth={3} />}
                {code}
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Monthly budget
        </p>
        <div className="flex items-center gap-2 border-b-2 border-[var(--border)] py-2.5">
          <span className="text-[15px] text-[var(--text-muted)]">{getCurrencySymbol(settings.currency)}</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            onBlur={commitBudget}
            placeholder="No limit set"
            className="w-full bg-transparent text-[15px] outline-none placeholder:text-[var(--text-muted)]"
          />
        </div>
      </section>

      <section>
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Backup</p>
        <div className="divide-y-2 divide-[var(--border)] border-y-2 border-[var(--border)]">
          <button
            type="button"
            onClick={onExportJSON}
            disabled={expenseCount === 0}
            className="flex w-full items-center gap-3 py-3 text-[14.5px] font-medium transition-opacity active:opacity-60 disabled:opacity-40"
          >
            <Download size={16} className="text-[var(--text-muted)]" />
            Export backup (JSON)
          </button>
          <button
            type="button"
            onClick={onExportCSV}
            disabled={expenseCount === 0}
            className="flex w-full items-center gap-3 py-3 text-[14.5px] font-medium transition-opacity active:opacity-60 disabled:opacity-40"
          >
            <FileSpreadsheet size={16} className="text-[var(--text-muted)]" />
            Export as CSV
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center gap-3 py-3 text-[14.5px] font-medium transition-opacity active:opacity-60"
          >
            <Upload size={16} className="text-[var(--text-muted)]" />
            Import backup
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onImportFile(file)
              e.target.value = ''
            }}
          />
        </div>
      </section>

      <section>
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Data</p>
        <button
          type="button"
          onClick={handleClear}
          disabled={expenseCount === 0}
          className="flex w-full items-center gap-2 border-y-2 border-[var(--border)] py-3 text-[14.5px] font-medium transition-opacity active:opacity-60 disabled:opacity-40"
          style={{ color: 'var(--danger)' }}
          onBlur={() => setConfirming(false)}
        >
          <Trash2 size={16} />
          {confirming ? 'Tap again to confirm' : `Clear all data (${expenseCount})`}
        </button>
      </section>

      <section className="pt-2 text-center">
        <p className="text-[12px] text-[var(--text-muted)]">
          Made by{' '}
          <a
            href="https://dexys.in"
            target="_blank"
            rel="noreferrer"
            className="font-semibold"
            style={{ color: 'var(--accent)' }}
          >
            Dexys IT Solutions
          </a>
        </p>
      </section>
    </div>
  )
}
