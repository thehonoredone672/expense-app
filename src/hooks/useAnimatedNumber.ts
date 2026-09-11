import { useEffect, useRef, useState } from 'react'

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export function useAnimatedNumber(target: number, durationMs = 450): number {
  const [value, setValue] = useState(target)
  const fromRef = useRef(target)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const from = fromRef.current
    if (from === target) return

    const start = performance.now()
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const effectiveDuration = reduced ? 0 : durationMs

    function tick(now: number) {
      const elapsed = now - start
      const t = effectiveDuration === 0 ? 1 : Math.min(1, elapsed / effectiveDuration)
      const eased = easeOutCubic(t)
      setValue(from + (target - from) * eased)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = target
      }
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      fromRef.current = target
    }
  }, [target, durationMs])

  return value
}
