import { useState } from 'react'
import { X, Check, Trash2, CalendarDays } from 'lucide-react'
import type { Debt, DebtDirection } from '../types'
import { AmountKeypad } from './AmountKeypad'
import { SheetGrabber } from './SheetGrabber'
import { haptic } from '../lib/haptics'
import { useSheetDrag } from '../hooks/useSheetDrag'

interface Props {
  initial: Debt | null
  currencySymbol: string
  onClose: () => void
  onSave: (data: Omit<Debt, 'id' | 'createdAt'>) => void
  onDelete: (id: string) => void
}

const DIRECTIONS: { value: DebtDirection; label: string }[] = [
  { value: 'they_owe', label: 'Owed to me' },
  { value: 'i_owe', label: 'I owe' },
]

export function DebtForm({ initial, currencySymbol, onClose, onSave, onDelete }: Props) {
  const [amount, setAmount] = useState(() => (initial ? String(initial.amount) : '0'))
  const [direction, setDirection] = useState<DebtDirection>(() => initial?.direction ?? 'they_owe')
  const [person, setPerson] = useState(() => initial?.person ?? '')
  const [note, setNote] = useState(() => initial?.note ?? '')
  const [dueDate, setDueDate] = useState(() => initial?.dueDate ?? '')
  const [settled, setSettled] = useState(() => initial?.settled ?? false)

  const { dragging, handleStyle, handlers } = useSheetDrag(onClose)
  const numericAmount = parseFloat(amount) || 0
  const canSave = numericAmount > 0 && person.trim().length > 0

  function handleSave() {
    if (!canSave) return
    haptic('success')
    onSave({
      amount: numericAmount,
      direction,
      person: person.trim(),
      note: note.trim(),
      dueDate: dueDate || null,
      settled,
    })
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
          {initial ? 'Edit debt' : 'New debt'}
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
        <div className="flex items-baseline justify-center gap-1 py-6">
          <span className="text-3xl font-medium text-[var(--text-muted)]">{currencySymbol}</span>
          <span className="text-5xl font-semibold tracking-tight tabular-nums">{amount}</span>
        </div>

        <div className="px-5">
          <div className="flex gap-1.5 rounded-lg border-2 border-[var(--border-hard)] p-1">
            {DIRECTIONS.map((opt) => {
              const selected = direction === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    if (opt.value !== direction) haptic('tick')
                    setDirection(opt.value)
                  }}
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

          <input
            type="text"
            value={person}
            onChange={(e) => setPerson(e.target.value)}
            placeholder="Who's this with?"
            maxLength={40}
            autoFocus
            className="mt-5 w-full border-b-2 border-[var(--border)] bg-transparent py-2.5 text-[15px] outline-none placeholder:text-[var(--text-muted)]"
          />

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
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-transparent text-[15px] outline-none"
              style={!dueDate ? { color: 'var(--text-muted)' } : undefined}
            />
            {dueDate && (
              <button
                type="button"
                onClick={() => setDueDate('')}
                aria-label="Clear due date"
                className="shrink-0 text-[12.5px] font-medium text-[var(--text-muted)]"
              >
                Clear
              </button>
            )}
          </label>

          {initial && (
            <button
              type="button"
              onClick={() => {
                haptic('tick')
                setSettled((s) => !s)
              }}
              className="flex w-full items-center gap-3 border-b-2 border-[var(--border)] py-2.5 text-left"
            >
              <Check size={17} className="text-[var(--text-muted)]" />
              <span className="flex-1 text-[15px]">Settled</span>
              <span
                className="relative h-6 w-10 shrink-0 rounded-full border-2 border-[var(--border-hard)] transition-colors"
                style={{ backgroundColor: settled ? 'var(--accent-2)' : 'var(--surface-2)' }}
              >
                <span
                  className="absolute top-0 h-4 w-4 rounded-full border-2 border-[var(--border-hard)] bg-[var(--surface)] transition-all"
                  style={{ left: settled ? 17 : 1 }}
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
              Delete debt
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
