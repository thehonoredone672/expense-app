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
    <nav className="sticky bottom-0 z-30 px-4 pb-3" style={{ paddingBottom: 'calc(var(--safe-bottom) + 12px)' }}>
      <div className="glass relative mx-auto grid max-w-md grid-cols-4 items-center rounded-full px-2">
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
          className="accent-gradient absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[var(--accent-text)] transition-transform active:scale-90"
          style={{
            width: 54,
            height: 54,
            boxShadow: '0 10px 24px -6px rgba(79, 70, 229, 0.55), 0 0 0 4px var(--glass-bg)',
          }}
        >
          <Plus size={25} strokeWidth={2.5} />
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
      style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
    >
      <Icon size={21} strokeWidth={isActive ? 2.2 : 1.8} />
      <span className="text-[10.5px] font-medium">{label}</span>
    </button>
  )
}
