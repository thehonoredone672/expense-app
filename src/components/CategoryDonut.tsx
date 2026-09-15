import { formatCurrency } from '../lib/format'

interface Segment {
  color: string
  amount: number
}

interface Props {
  segments: Segment[]
  total: number
  currency: string
}

const SIZE = 160
const STROKE = 20
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const GAP = 3

export function CategoryDonut({ segments, total, currency }: Props) {
  const arcs = segments.reduce<{ offset: number; length: number; color: string }[]>((acc, seg) => {
    const prevEnd = acc.length > 0 ? acc[acc.length - 1].offset + (acc[acc.length - 1].length + GAP) : 0
    const fraction = total > 0 ? seg.amount / total : 0
    const length = Math.max(0, fraction * CIRCUMFERENCE - GAP)
    acc.push({ offset: prevEnd, length, color: seg.color })
    return acc
  }, [])

  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} className="-rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth={STROKE}
        />
        {arcs.map((arc, idx) => (
          <circle
            key={idx}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={arc.color}
            strokeWidth={STROKE}
            strokeDasharray={`${arc.length} ${CIRCUMFERENCE - arc.length}`}
            strokeDashoffset={-arc.offset}
          />
        ))}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--border-hard)"
          strokeWidth={2}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] font-medium text-[var(--text-muted)]">Total</span>
        <span className="text-[19px] font-semibold tracking-tight tabular-nums">{formatCurrency(total, currency)}</span>
      </div>
    </div>
  )
}
