import { useState } from 'react'
import { X, Check, Trash2 } from 'lucide-react'
import type { Trip, TripIconId } from '../types'
import { TRIP_ICONS } from '../data/tripIcons'
import { AmountKeypad } from './AmountKeypad'
import { SheetGrabber } from './SheetGrabber'
import { haptic } from '../lib/haptics'
import { useSheetDrag } from '../hooks/useSheetDrag'

interface Props {
  initial: Trip | null
  currencySymbol: string
  onClose: () => void
  onSave: (data: Omit<Trip, 'id' | 'createdAt'>) => void
  onDelete: (id: string) => void
}

export function TripForm({ initial, currencySymbol, onClose, onSave, onDelete }: Props) {
  const [name, setName] = useState(() => initial?.name ?? '')
  const [budget, setBudget] = useState(() => (initial ? String(initial.budget) : '0'))
  const [icon, setIcon] = useState<TripIconId>(() => initial?.icon ?? 'plane')

  const { dragging, handleStyle, handlers } = useSheetDrag(onClose)
  const numericBudget = parseFloat(budget) || 0
  const canSave = numericBudget > 0 && name.trim().length > 0

  function handleSave() {
    if (!canSave) return
    haptic('success')
    onSave({ name: name.trim(), budget: numericBudget, icon })
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
          {initial ? 'Edit trip' : 'New trip'}
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
          <span className="text-5xl font-semibold tabular-nums">{budget}</span>
        </div>
        <p className="pb-5 text-center text-[12.5px] text-[var(--text-muted)]">Fixed budget for this trip</p>

        <div className="px-5">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Trip name, e.g. Japan"
            maxLength={40}
            autoFocus
            className="w-full border-b-2 border-[var(--border)] bg-transparent py-2.5 text-center text-[16px] font-medium outline-none placeholder:text-[var(--text-muted)] placeholder:font-normal"
          />
        </div>

        <div className="mt-6 grid grid-cols-4 gap-y-3 px-5">
          {TRIP_ICONS.map(({ id, icon: Icon }) => {
            const selected = icon === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  if (id !== icon) haptic('tick')
                  setIcon(id)
                }}
                className="press-sm flex items-center justify-center py-1"
              >
                <span
                  key={`${id}-${selected}`}
                  className="flex h-12 w-12 animate-pop-in items-center justify-center rounded-lg border-2 border-[var(--border-hard)]"
                  style={{
                    backgroundColor: selected ? 'var(--accent-2)' : 'var(--surface-2)',
                    boxShadow: selected ? '2px 2px 0 var(--border-hard)' : undefined,
                  }}
                >
                  <Icon size={20} color={selected ? 'var(--accent-2-text)' : 'var(--text-muted)'} strokeWidth={1.85} />
                </span>
              </button>
            )
          })}
        </div>

        {initial && (
          <div className="mt-6 px-5">
            <button
              type="button"
              onClick={handleDelete}
              className="flex w-full items-center justify-center gap-2 py-2 text-[15px] font-medium transition-opacity active:opacity-60"
              style={{ color: 'var(--danger)' }}
            >
              <Trash2 size={17} />
              Delete trip
            </button>
          </div>
        )}
      </div>

      <div className="border-t-2 border-[var(--border-hard)]" style={{ paddingBottom: 'var(--safe-bottom)' }}>
        <AmountKeypad value={budget} onChange={setBudget} />
      </div>
    </div>
  )
}
