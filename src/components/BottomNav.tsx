import { Home, PieChart, Settings, Plus, Plane } from 'lucide-react'
import { haptic } from '../lib/haptics'

export type Tab = 'home' | 'trips' | 'stats' | 'settings'

interface Props {
  active: Tab
  onChange: (tab: Tab) => void
  onAdd: () => void
}

export function BottomNav({ active, onChange, onAdd }: Props) {
  function selectTab(tab: Tab) {
    if (tab !== active) haptic('tick')
    onChange(tab)
  }

  return (
    <nav
      className="sticky bottom-0 z-30 border-t-2 border-[var(--border-hard)] bg-[var(--bg)]"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      <div className="relative mx-auto grid max-w-md grid-cols-4 items-center px-2">
        <NavButton label="Home" icon={Home} isActive={active === 'home'} onClick={() => selectTab('home')} />
        <NavButton label="Trips" icon={Plane} isActive={active === 'trips'} onClick={() => selectTab('trips')} />
        <NavButton label="Stats" icon={PieChart} isActive={active === 'stats'} onClick={() => selectTab('stats')} />
        <NavButton
          label="Settings"
          icon={Settings}
          isActive={active === 'settings'}
          onClick={() => selectTab('settings')}
        />

        <button
          type="button"
          onClick={() => {
            haptic('tick')
            onAdd()
          }}
          aria-label="Add"
          className="press absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border-2 border-[var(--border-hard)] text-[var(--accent-2-text)]"
          style={{
            width: 54,
            height: 54,
            backgroundColor: 'var(--accent-2)',
            boxShadow: '4px 4px 0 var(--border-hard)',
          }}
        >
          <Plus size={25} strokeWidth={2.75} />
        </button>
      </div>
    </nav>
  )
}

function NavButton({
  label,
  icon: Icon,
  isActive,
  onClick,
}: {
  label: string
  icon: typeof Home
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 py-2.5 transition-opacity active:opacity-60"
      style={{ color: isActive ? 'var(--text)' : 'var(--text-muted)' }}
    >
      <Icon size={21} strokeWidth={isActive ? 2.3 : 1.8} />
      <span className="flex items-center gap-1 text-[10.5px] font-medium">
        {isActive && <span className="h-1 w-1 rounded-full" style={{ backgroundColor: 'var(--accent-2)' }} />}
        {label}
      </span>
    </button>
  )
}
