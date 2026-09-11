import { useState } from 'react'
import { X, Check, Trash2, CalendarDays, Repeat } from 'lucide-react'
import type { CategoryId, Expense } from '../types'
import { CategoryPicker } from './CategoryPicker'
import { AmountKeypad } from './AmountKeypad'
import { todayISO } from '../lib/format'
import { haptic } from '../lib/haptics'

interface Props {
  initial: Expense | null
  presetCategory?: CategoryId
  presetTripId?: string | null
  tripName?: string
  defaultDate: string
  currencySymbol: string
  onClose: () => void
  onSave: (data: Omit<Expense, 'id' | 'createdAt'>) => void
  onDelete: (id: string) => void
}

export function ExpenseForm({
  initial,
  presetCategory,
  presetTripId,
  tripName,
  defaultDate,
  currencySymbol,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [amount, setAmount] = useState(() => (initial ? String(initial.amount) : '0'))
  const [category, setCategory] = useState<CategoryId>(() => initial?.category ?? presetCategory ?? 'food')
  const [note, setNote] = useState(() => initial?.note ?? '')
  const [date, setDate] = useState(() => initial?.date ?? defaultDate)
  const [recurring, setRecurring] = useState(() => initial?.recurring ?? false)
  const tripId = initial ? initial.tripId ?? null : (presetTripId ?? null)

  const numericAmount = parseFloat(amount) || 0
  const canSave = numericAmount > 0

  function handleSave() {
    if (!canSave) return
    haptic('success')
    onSave({ amount: numericAmount, category, note: note.trim(), date, tripId, recurring })
  }

  function handleDelete() {
    if (!initial) return
    haptic('warning')
    onDelete(initial.id)
  }

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-[var(--bg)] bg-wash animate-sheet-up">
      <div
        className="flex items-center justify-between px-4 pb-3"
        style={{ paddingTop: 'calc(var(--safe-top) + 12px)' }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cancel"
          className="glass flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-transform active:scale-90"
        >
          <X size={19} />
        </button>
        <span className="text-[15px] font-semibold">{initial ? 'Edit expense' : 'Add expense'}</span>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          aria-label="Save"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--accent-text)] transition-transform active:scale-90 disabled:opacity-40"
          style={canSave ? { background: 'linear-gradient(155deg, var(--accent-1), var(--accent-2))' } : { backgroundColor: 'var(--surface-2)', color: 'var(--text-muted)' }}
        >
          <Check size={18} strokeWidth={2.75} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tripId && tripName && (
          <div className="flex justify-center pt-4">
            <span className="glass rounded-full px-3 py-1 text-[12px] font-medium text-[var(--text-muted)]">
              Adding to {tripName}
            </span>
          </div>
        )}

        <div className="flex items-baseline justify-center gap-1 py-6">
          <span className="text-3xl font-medium text-[var(--text-muted)]">{currencySymbol}</span>
          <span className="text-5xl font-semibold tabular-nums">{amount}</span>
        </div>

        <CategoryPicker value={category} onChange={setCategory} />

        <div className="mt-6 px-5">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)"
            maxLength={60}
            className="w-full border-b border-[var(--border)] bg-transparent py-2.5 text-[15px] outline-none placeholder:text-[var(--text-muted)]"
          />

          <label className="flex items-center gap-3 border-b border-[var(--border)] py-2.5">
            <CalendarDays size={17} className="text-[var(--text-muted)]" />
            <input
              type="date"
              value={date}
              max={todayISO()}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-transparent text-[15px] outline-none"
            />
          </label>

          {!tripId && (
            <button
              type="button"
              onClick={() => {
                haptic('tick')
                setRecurring((r) => !r)
              }}
              className="flex w-full items-center gap-3 border-b border-[var(--border)] py-2.5 text-left"
            >
              <Repeat size={17} className="text-[var(--text-muted)]" />
              <span className="flex-1 text-[15px]">Repeat monthly</span>
              <span
                className="relative h-6 w-10 shrink-0 rounded-full transition-colors"
                style={{ backgroundColor: recurring ? undefined : 'var(--surface-2)' }}
              >
                {recurring && <span className="accent-gradient absolute inset-0 rounded-full" />}
                <span
                  className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
                  style={{ left: recurring ? 18 : 2 }}
                />
              </span>
            </button>
          )}

          {initial && (
            <button
              type="button"
              onClick={handleDelete}
              className="mt-5 flex w-full items-center justify-center gap-2 py-2 text-[15px] font-medium transition-opacity active:opacity-60"
              style={{ color: 'var(--danger)' }}
            >
              <Trash2 size={17} />
              Delete expense
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-[var(--border)]" style={{ paddingBottom: 'var(--safe-bottom)' }}>
        <AmountKeypad value={amount} onChange={setAmount} />
      </div>
    </div>
  )
}
