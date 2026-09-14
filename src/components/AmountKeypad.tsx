import { Delete } from 'lucide-react'

interface Props {
  value: string
  onChange: (value: string) => void
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del']

export function AmountKeypad({ value, onChange }: Props) {
  function press(key: string) {
    if (key === 'del') {
      onChange(value.slice(0, -1))
      return
    }
    if (key === '.' && value.includes('.')) return
    if (value.includes('.') && value.split('.')[1]?.length >= 2) return
    if (value === '0' && key !== '.') {
      onChange(key)
      return
    }
    if (value.length >= 9) return
    onChange(value + key)
  }

  return (
    <div className="grid grid-cols-3 gap-1 px-2 pb-1">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => press(key)}
          className="flex h-14 items-center justify-center rounded-lg text-2xl font-medium text-[var(--text)] transition-transform active:scale-95 active:bg-[var(--accent-soft)]"
        >
          {key === 'del' ? <Delete size={22} /> : key}
        </button>
      ))}
    </div>
  )
}
