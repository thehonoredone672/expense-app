import { useRef, useState } from 'react'

export function useCelebration(durationMs = 950) {
  const [visible, setVisible] = useState(false)
  const [key, setKey] = useState(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function fire() {
    if (timer.current) clearTimeout(timer.current)
    setKey((k) => k + 1)
    setVisible(true)
    timer.current = setTimeout(() => setVisible(false), durationMs)
  }

  return { visible, key, fire }
}
