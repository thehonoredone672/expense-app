import { useRef, type PointerEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMonthLabel } from '../lib/format'
import { haptic } from '../lib/haptics'

interface Props {
  year: number
  month: number
  onChange: (year: number, month: number) => void
}

const SWIPE_THRESHOLD = 36

export function MonthSwitcher({ year, month, onChange }: Props) {
  const now = new Date()
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()
  const drag = useRef<{ startX: number; fired: boolean } | null>(null)

  function shift(delta: number) {
    if (delta > 0 && isCurrentMonth) return
    const d = new Date(year, month + delta, 1)
    onChange(d.getFullYear(), d.getMonth())
  }

  function onPointerDown(e: PointerEvent<HTMLSpanElement>) {
    drag.current = { startX: e.clientX, fired: false }
  }

  function onPointerMove(e: PointerEvent<HTMLSpanElement>) {
    const state = drag.current
    if (!state || state.fired) return
    const delta = e.clientX - state.startX
    if (Math.abs(delta) < SWIPE_THRESHOLD) return
    state.fired = true
    haptic('tick')
    shift(delta < 0 ? 1 : -1)
  }

  function onPointerUp() {
    drag.current = null
  }

  return (
    <div className="flex items-center justify-center gap-4 py-1">
      <button
        type="button"
        onClick={() => shift(-1)}
        aria-label="Previous month"
        className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] active:bg-[var(--surface-2)]"
      >
        <ChevronLeft size={18} />
      </button>
      <span
        key={`${year}-${month}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="w-40 select-none text-center text-[15px] font-semibold animate-fade-in"
        style={{ touchAction: 'pan-y' }}
      >
        {formatMonthLabel(year, month)}
      </span>
      <button
        type="button"
        onClick={() => shift(1)}
        disabled={isCurrentMonth}
        aria-label="Next month"
        className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-opacity active:bg-[var(--surface-2)] disabled:opacity-30"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
