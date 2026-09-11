import { useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { Trash2 } from 'lucide-react'
import { haptic } from '../lib/haptics'

const REVEAL = 76

interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onDelete: () => void
  onTap: () => void
  children: ReactNode
}

export function SwipeToDelete({ isOpen, onOpenChange, onDelete, onTap, children }: Props) {
  const [dragging, setDragging] = useState(false)
  const [dragX, setDragX] = useState(0)
  const drag = useRef<{ startX: number; base: number; moved: boolean; pastThreshold: boolean } | null>(null)

  const translate = dragging ? dragX : isOpen ? -REVEAL : 0

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
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const state = drag.current
    if (!state) return
    const delta = e.clientX - state.startX
    if (Math.abs(delta) > 4) state.moved = true
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
    if (!state) return
    setDragging(false)
    if (state.moved) {
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
          transform: `translateX(${translate}px)`,
          transition: dragging ? 'none' : 'transform 200ms cubic-bezier(0.22, 1, 0.36, 1)',
          touchAction: 'pan-y',
        }}
        className="relative z-10 bg-[var(--bg)]"
      >
        {children}
      </div>
    </div>
  )
}
