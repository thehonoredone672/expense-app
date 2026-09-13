import { useRef, useState, type PointerEvent } from 'react'
import { haptic } from '../lib/haptics'

const DISMISS_DISTANCE = 90
const DISMISS_VELOCITY = 0.5

export function useSheetDrag(onClose: () => void) {
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const drag = useRef<{ startY: number; startTime: number; lastY: number; lastTime: number; moved: boolean } | null>(
    null,
  )

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // some browsers reject capture for pointers they don't consider active
    }
    const now = performance.now()
    drag.current = { startY: e.clientY, startTime: now, lastY: e.clientY, lastTime: now, moved: false }
    setDragging(true)
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const state = drag.current
    if (!state) return
    const delta = e.clientY - state.startY
    if (Math.abs(delta) > 4) state.moved = true
    const next = Math.max(0, delta)
    state.lastY = e.clientY
    state.lastTime = performance.now()
    setDragY(next)
  }

  function onPointerUp() {
    const state = drag.current
    if (!state) return
    setDragging(false)
    const elapsed = Math.max(1, state.lastTime - state.startTime)
    const velocity = (state.lastY - state.startY) / elapsed
    if (dragY > DISMISS_DISTANCE || velocity > DISMISS_VELOCITY) {
      haptic('tick')
      onClose()
    } else {
      setDragY(0)
    }
    drag.current = null
  }

  return {
    dragY,
    dragging,
    handleStyle: {
      transform: `translateY(${dragY}px)`,
      transition: dragging ? 'none' : 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
      opacity: 1 - Math.min(0.4, dragY / 400),
    },
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
  }
}
