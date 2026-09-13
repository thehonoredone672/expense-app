// A tiny 1-bit (two-tone) pixel sparkle, drawn as a fixed bitmap of
// square "pixels" that pop in with a stagger, then fade out together.
const BITMAP = [
  [0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0],
]

interface Props {
  cell?: number
  color?: string
  durationMs?: number
}

export function PixelSpark({ cell = 8, color = 'var(--accent-2)', durationMs = 900 }: Props) {
  const pixels: { x: number; y: number }[] = []
  BITMAP.forEach((row, y) => row.forEach((v, x) => v && pixels.push({ x, y })))

  return (
    <div
      className="pointer-events-none"
      style={{
        position: 'relative',
        width: cell * 7,
        height: cell * 7,
        animation: `spark-fade ${durationMs}ms ease-in forwards`,
      }}
    >
      {pixels.map(({ x, y }, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: x * cell,
            top: y * cell,
            width: cell,
            height: cell,
            backgroundColor: color,
            animation: `pixel-pop 200ms ease-out ${i * 16}ms both`,
          }}
        />
      ))}
    </div>
  )
}
