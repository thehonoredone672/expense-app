import { useCallback, useEffect, useState } from 'react'
import type { Settings } from '../types'
import { loadSettings, saveSettings } from '../lib/storage'

function applyTheme(theme: Settings['theme']) {
  const root = document.documentElement
  const resolveDark = () =>
    theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  root.classList.toggle('dark', resolveDark())
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings())

  useEffect(() => {
    saveSettings(settings)
    applyTheme(settings.theme)
  }, [settings])

  useEffect(() => {
    if (settings.theme !== 'system') return
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [settings.theme])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  return { settings, updateSettings }
}
