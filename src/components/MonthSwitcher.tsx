import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMonthLabel } from '../lib/format'

interface Props {
  year: number
  month: number
  onChange: (year: number, month: number) => void
}

export function MonthSwitcher({ year, month, onChange }: Props) {
  const now = new Date()
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()

  function shift(delta: number) {
    const d = new Date(year, month + delta, 1)
    onChange(d.getFullYear(), d.getMonth())
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
      <span className="w-40 text-center text-[15px] font-semibold">{formatMonthLabel(year, month)}</span>
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
