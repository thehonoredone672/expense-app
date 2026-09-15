import { useRef, useState } from 'react'
import { Trash2, Check, Download, Upload, FileSpreadsheet, BellRing, LogOut, ShieldCheck } from 'lucide-react'
import type { AuthUser, Settings, ThemePreference } from '../types'
import { CURRENCIES, getCurrencySymbol } from '../lib/format'
import {
  getNotificationPermission,
  notificationsSupported,
  requestNotificationPermission,
  sendNotification,
} from '../lib/notifications'

interface Props {
  user: AuthUser
  settings: Settings
  expenseCount: number
  debtCount: number
  onUpdate: (patch: Partial<Settings>) => void
  onClearAll: () => void
  onExportJSON: () => void
  onExportCSV: () => void
  onImportFile: (file: File) => void
  onLogout: () => void
  onOpenAdmin: () => void
}

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

export function SettingsScreen({
  user,
  settings,
  expenseCount,
  debtCount,
  onUpdate,
  onClearAll,
  onExportJSON,
  onExportCSV,
  onImportFile,
  onLogout,
  onOpenAdmin,
}: Props) {
  const [confirming, setConfirming] = useState(false)
  const [budgetInput, setBudgetInput] = useState(settings.budget != null ? String(settings.budget) : '')
  const [permission, setPermission] = useState(getNotificationPermission())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const totalCount = expenseCount + debtCount

  function handleClear() {
    if (!confirming) {
      setConfirming(true)
      return
    }
    onClearAll()
    setConfirming(false)
  }

  async function handleToggleNotifications() {
    if (settings.notificationsEnabled) {
      onUpdate({ notificationsEnabled: false })
      return
    }
    if (!notificationsSupported()) return
    const result = await requestNotificationPermission()
    setPermission(result)
    if (result === 'granted') {
      onUpdate({ notificationsEnabled: true })
      sendNotification('Notifications on', {
        body: "We'll let you know about your budget, recurring bills, and debts that are due.",
      })
    }
  }

  function commitBudget() {
    const parsed = parseFloat(budgetInput)
    onUpdate({ budget: budgetInput.trim() === '' || Number.isNaN(parsed) || parsed <= 0 ? null : parsed })
  }

  return (
    <div className="space-y-7 px-5 pb-8" style={{ paddingTop: 'calc(var(--safe-top) + 20px)' }}>
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <section>
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Account</p>
        <div className="card-flat-sm rounded-xl px-4 py-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-[14.5px] font-medium">{user.email}</span>
            {user.role === 'admin' && (
              <span
                className="shrink-0 rounded-md border-2 border-[var(--border-hard)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide"
                style={{ backgroundColor: 'var(--accent-2)', color: 'var(--accent-2-text)' }}
              >
                Admin
              </span>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            {user.role === 'admin' && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="press-sm flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-[var(--border-hard)] bg-[var(--surface)] py-2 text-[13.5px] font-semibold"
              >
                <ShieldCheck size={15} />
                Admin
              </button>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="press-sm flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-[var(--border-hard)] bg-[var(--surface)] py-2 text-[13.5px] font-semibold"
              style={{ color: 'var(--danger)' }}
            >
              <LogOut size={15} />
              Log out
            </button>
          </div>
        </div>
      </section>

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
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Notifications</p>
        <button
          type="button"
          onClick={handleToggleNotifications}
          disabled={!notificationsSupported() || permission === 'denied'}
          className="flex w-full items-center gap-3 border-y-2 border-[var(--border)] py-3 text-left disabled:opacity-40"
        >
          <BellRing size={17} className="text-[var(--text-muted)]" />
          <span className="flex-1">
            <span className="block text-[14.5px] font-medium">Budget, bill &amp; debt alerts</span>
            <span className="block text-[12.5px] text-[var(--text-muted)]">
              {!notificationsSupported()
                ? 'Not supported on this browser'
                : permission === 'denied'
                  ? 'Blocked — allow notifications in your browser settings'
                  : 'Get notified when you near your budget, a bill is due, or a debt is due'}
            </span>
          </span>
          <span
            className="relative h-6 w-10 shrink-0 rounded-full border-2 border-[var(--border-hard)] transition-colors"
            style={{ backgroundColor: settings.notificationsEnabled ? 'var(--accent-2)' : 'var(--surface-2)' }}
          >
            <span
              className="absolute top-0 h-4 w-4 rounded-full border-2 border-[var(--border-hard)] bg-[var(--surface)] transition-all"
              style={{ left: settings.notificationsEnabled ? 17 : 1 }}
            />
          </span>
        </button>
      </section>

      <section>
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Backup</p>
        <div className="divide-y-2 divide-[var(--border)] border-y-2 border-[var(--border)]">
          <button
            type="button"
            onClick={onExportJSON}
            disabled={totalCount === 0}
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
          disabled={totalCount === 0}
          className="flex w-full items-center gap-2 border-y-2 border-[var(--border)] py-3 text-[14.5px] font-medium transition-opacity active:opacity-60 disabled:opacity-40"
          style={{ color: 'var(--danger)' }}
          onBlur={() => setConfirming(false)}
        >
          <Trash2 size={16} />
          {confirming ? 'Tap again to confirm' : `Clear all data (${totalCount})`}
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
