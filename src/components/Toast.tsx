interface Props {
  message: string
}

export function Toast({ message }: Props) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-24 z-50 flex justify-center px-6">
      <div
        className="animate-pop-in rounded-lg border-2 border-[var(--border-hard)] px-4 py-2.5 text-[13px] font-semibold"
        style={{
          backgroundColor: 'var(--accent-2)',
          color: 'var(--accent-2-text)',
          boxShadow: '3px 3px 0 var(--border-hard)',
        }}
      >
        {message}
      </div>
    </div>
  )
}
