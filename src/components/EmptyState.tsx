import type { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  title: string
  subtitle: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-8 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-2)]">
        <Icon size={24} className="text-[var(--text-muted)]" strokeWidth={1.75} />
      </span>
      <p className="mt-2 text-[15px] font-medium">{title}</p>
      <p className="text-[13px] text-[var(--text-muted)]">{subtitle}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="accent-gradient mt-4 rounded-full px-5 py-2.5 text-[14px] font-semibold transition-transform active:scale-95"
          style={{ color: 'var(--accent-text)', boxShadow: '0 8px 20px -6px rgba(79, 70, 229, 0.45)' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
