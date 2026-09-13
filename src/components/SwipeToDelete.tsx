import { useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { Trash2 } from 'lucide-react'
import { haptic } from '../lib/haptics'

const REVEAL = 76
const LONG_PRESS_MS = 480

interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onDelete: () => void
  onTap: () => void
  onLongPress?: () => void
  children: ReactNode
}

export function SwipeToDelete({ isOpen, onOpenChange, onDelete, onTap, onLongPress, children }: Props) {
  const [dragging, setDragging] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [pressing, setPressing] = useState(false)
  const drag = useRef<{ startX: number; base: number; moved: boolean; pastThreshold: boolean } | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressFired = useRef(false)

  const translate = dragging ? dragX : isOpen ? -REVEAL : 0

  function clearLongPress() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // some browsers reject capture for pointers they don't consider active; the drag still works via bubbling
    }
    const base = isOpen ? -REVEAL : 0
    drag.current = { startX: e.clientX, base, moved: false, pastThreshold: base < -REVEAL / 2 }
    setDragX(base)
    setDragging(true)
    longPressFired.current = false

    if (onLongPress && !isOpen) {
      setPressing(true)
      longPressTimer.current = setTimeout(() => {
        const state = drag.current
        if (state && !state.moved) {
          longPressFired.current = true
          haptic('success')
          onLongPress()
        }
        setPressing(false)
      }, LONG_PRESS_MS)
    }
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const state = drag.current
    if (!state) return
    const delta = e.clientX - state.startX
    if (Math.abs(delta) > 4) {
      state.moved = true
      clearLongPress()
      setPressing(false)
    }
    const next = Math.min(0, Math.max(-REVEAL, state.base + delta))
    const nowPast = next < -REVEAL / 2
    if (nowPast !== state.pastThreshold) {
      state.pastThreshold = nowPast
      haptic('tick')
    }
    setDragX(next)
  }

  function onPointerUp() {
    const state = drag.current
    clearLongPress()
    setPressing(false)
    if (!state) return
    setDragging(false)
    if (longPressFired.current) {
      // long press already handled the gesture
    } else if (state.moved) {
      onOpenChange(dragX < -REVEAL / 2)
    } else if (isOpen) {
      onOpenChange(false)
    } else {
      onTap()
    }
    drag.current = null
  }

  function handleDeleteClick() {
    haptic('warning')
    onDelete()
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 right-0 flex" style={{ width: REVEAL }}>
        <button
          type="button"
          onClick={handleDeleteClick}
          aria-label="Delete expense"
          className="flex h-full w-full items-center justify-center"
          style={{ backgroundColor: 'var(--danger)' }}
        >
          <Trash2 size={18} color="#fff" />
        </button>
      </div>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          transform: translate === 0 ? undefined : `translateX(${translate}px)`,
          transition: dragging ? 'none' : 'transform 200ms cubic-bezier(0.22, 1, 0.36, 1), opacity 150ms ease-out',
          opacity: pressing ? 0.55 : 1,
          touchAction: 'pan-y',
        }}
        className="relative z-10 bg-[var(--bg)]"
      >
        {children}
      </div>
    </div>
  )
}
