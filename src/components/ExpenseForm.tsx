import { useState } from 'react'
import { X, Check, Trash2, CalendarDays, Repeat } from 'lucide-react'
import type { CategoryId, Expense } from '../types'
import { CategoryPicker } from './CategoryPicker'
import { AmountKeypad } from './AmountKeypad'
import { SheetGrabber } from './SheetGrabber'
import { todayISO } from '../lib/format'
import { haptic } from '../lib/haptics'
import { useSheetDrag } from '../hooks/useSheetDrag'

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
  const { dragging, handleStyle, handlers } = useSheetDrag(onClose)

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
    <div className="absolute inset-0 z-40 flex flex-col bg-[var(--bg)] bg-dither animate-sheet-up" style={handleStyle}>
      <div {...handlers} style={{ touchAction: 'none', paddingTop: 'var(--safe-top)' }}>
        <SheetGrabber />
      </div>

      <div className="flex items-center justify-between px-4 pb-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cancel"
          className="press-sm flex h-9 w-9 items-center justify-center rounded-lg border-2 border-[var(--border-hard)] bg-[var(--surface)] text-[var(--text)]"
          style={{ boxShadow: '2px 2px 0 var(--border-hard)' }}
        >
          <X size={18} />
        </button>
        <span {...handlers} style={{ touchAction: 'none' }} className="text-[15px] font-semibold">
          {initial ? 'Edit expense' : 'Add expense'}
        </span>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          aria-label="Save"
          className="press-sm flex h-9 w-9 items-center justify-center rounded-lg border-2 border-[var(--border-hard)] disabled:opacity-40"
          style={{
            backgroundColor: canSave ? 'var(--accent-2)' : 'var(--surface-2)',
            color: canSave ? 'var(--accent-2-text)' : 'var(--text-muted)',
            boxShadow: canSave ? '2px 2px 0 var(--border-hard)' : undefined,
          }}
        >
          <Check size={18} strokeWidth={2.75} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto" style={dragging ? { overflow: 'hidden' } : undefined}>
        {tripId && tripName && (
          <div className="flex justify-center pt-4">
            <span
              className="rounded-md border-2 border-[var(--border-hard)] px-3 py-1 text-[12px] font-medium"
              style={{ backgroundColor: 'var(--surface-2)' }}
            >
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
            className="w-full border-b-2 border-[var(--border)] bg-transparent py-2.5 text-[15px] outline-none placeholder:text-[var(--text-muted)]"
          />

          <label className="flex items-center gap-3 border-b-2 border-[var(--border)] py-2.5">
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
              className="flex w-full items-center gap-3 border-b-2 border-[var(--border)] py-2.5 text-left"
            >
              <Repeat size={17} className="text-[var(--text-muted)]" />
              <span className="flex-1 text-[15px]">Repeat monthly</span>
              <span
                className="relative h-6 w-10 shrink-0 rounded-full border-2 border-[var(--border-hard)] transition-colors"
                style={{ backgroundColor: recurring ? 'var(--accent-2)' : 'var(--surface-2)' }}
              >
                <span
                  className="absolute top-0 h-4 w-4 rounded-full border-2 border-[var(--border-hard)] bg-[var(--surface)] transition-all"
                  style={{ left: recurring ? 17 : 1 }}
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

      <div className="border-t-2 border-[var(--border-hard)]" style={{ paddingBottom: 'var(--safe-bottom)' }}>
        <AmountKeypad value={amount} onChange={setAmount} />
      </div>
    </div>
  )
}
