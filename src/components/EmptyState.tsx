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
      <span
        className="flex h-14 w-14 items-center justify-center rounded-lg border-2"
        style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border-hard)' }}
      >
        <Icon size={24} className="text-[var(--text-muted)]" strokeWidth={1.75} />
      </span>
      <p className="mt-2 text-[15px] font-medium">{title}</p>
      <p className="text-[13px] text-[var(--text-muted)]">{subtitle}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="press mt-4 rounded-lg border-2 border-[var(--border-hard)] px-5 py-2.5 text-[14px] font-semibold"
          style={{
            backgroundColor: 'var(--accent-2)',
            color: 'var(--accent-2-text)',
            boxShadow: '3px 3px 0 var(--border-hard)',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
