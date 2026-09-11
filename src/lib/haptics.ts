type HapticStyle = 'tick' | 'success' | 'warning'

const PATTERNS: Record<HapticStyle, number | number[]> = {
  tick: 8,
  success: [12, 40, 16],
  warning: [20, 60, 20, 60, 20],
}

export function haptic(style: HapticStyle = 'tick') {
  try {
    navigator.vibrate?.(PATTERNS[style])
  } catch {
    // vibration unsupported or blocked — silently ignore
  }
}
