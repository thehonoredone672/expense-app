import { useCallback, useEffect, useState } from 'react'
import type { Settings } from '../types'
import { DEFAULT_SETTINGS } from '../lib/storage'
import { api } from '../lib/api'

function applyTheme(theme: Settings['theme']) {
  const root = document.documentElement
  const resolveDark = () =>
    theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  root.classList.toggle('dark', resolveDark())
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)

  useEffect(() => {
    api
      .getSettings()
      .then(setSettings)
      .catch((err) => console.error('Failed to load settings', err))
  }, [])

  useEffect(() => {
    applyTheme(settings.theme)
  }, [settings.theme])

  useEffect(() => {
    if (settings.theme !== 'system') return
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [settings.theme])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
    api.updateSettings(patch).catch((err) => console.error('Failed to update settings', err))
  }, [])

  return { settings, updateSettings }
}
