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
            className="press-sm flex flex-col items-center gap-1.5"
          >
            <span
              key={`${cat.id}-${selected}`}
              className="flex h-12 w-12 animate-pop-in items-center justify-center rounded-lg border-2"
              style={{
                backgroundColor: selected ? cat.color : 'var(--surface-2)',
                borderColor: 'var(--border-hard)',
                boxShadow: selected ? '2px 2px 0 var(--border-hard)' : undefined,
              }}
            >
              <Icon size={19} color={selected ? '#fff' : cat.color} strokeWidth={2} />
            </span>
            <span
              className="text-[11px]"
              style={{ color: selected ? 'var(--text)' : 'var(--text-muted)', fontWeight: selected ? 700 : 500 }}
            >
              {cat.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
