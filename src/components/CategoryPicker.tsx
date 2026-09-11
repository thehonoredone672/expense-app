import { CATEGORIES } from '../data/categories'
import type { CategoryId } from '../types'
import { haptic } from '../lib/haptics'

interface Props {
  value: CategoryId
  onChange: (id: CategoryId) => void
}

export function CategoryPicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-4 gap-y-3 px-4">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon
        const selected = value === cat.id
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              if (cat.id !== value) haptic('tick')
              onChange(cat.id)
            }}
            className="flex flex-col items-center gap-1.5 transition-transform active:scale-90"
          >
            <span
              className={selected ? 'flex h-12 w-12 items-center justify-center rounded-full transition-all' : 'glass flex h-12 w-12 items-center justify-center rounded-full transition-all'}
              style={
                selected
                  ? {
                      background: `linear-gradient(155deg, color-mix(in srgb, ${cat.color} 100%, white 20%), ${cat.color})`,
                      boxShadow: `0 6px 16px -4px ${cat.color}88`,
                    }
                  : undefined
              }
            >
              <Icon size={19} color={selected ? '#fff' : cat.color} strokeWidth={2} />
            </span>
            <span
              className="text-[11px]"
              style={{ color: selected ? 'var(--text)' : 'var(--text-muted)', fontWeight: selected ? 600 : 500 }}
            >
              {cat.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
