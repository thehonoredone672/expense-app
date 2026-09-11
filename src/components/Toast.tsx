interface Props {
  message: string
}

export function Toast({ message }: Props) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-24 z-50 flex justify-center px-6">
      <div
        className="accent-gradient animate-pop-in rounded-full px-4 py-2.5 text-[13px] font-medium shadow-lg"
        style={{ color: 'var(--accent-text)' }}
      >
        {message}
      </div>
    </div>
  )
}
