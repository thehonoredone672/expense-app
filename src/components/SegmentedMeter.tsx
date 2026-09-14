interface Props {
  pct: number
  color?: string
  segments?: number
}

export function SegmentedMeter({ pct, color = 'var(--accent)', segments = 16 }: Props) {
  const filled = Math.round((Math.max(0, Math.min(100, pct)) / 100) * segments)
  return (
    <div className="flex gap-[2px]">
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className="h-2.5 flex-1 transition-colors duration-150"
          style={{
            backgroundColor: i < filled ? color : 'var(--surface-2)',
            border: '1px solid var(--border-hard)',
          }}
        />
      ))}
    </div>
  )
}
