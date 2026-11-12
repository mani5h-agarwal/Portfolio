import { useCallback, useEffect, useState } from 'react'

export type Finish = 'black' | 'silver'

export interface Settings {
  /** Keyboard backlight, 0–1. */
  backlight: number
  /** Key sound volume, 0–1. */
  volume: number
  muted: boolean
  finish: Finish
}

const STORAGE_KEY = 'portfolio.macbook'
const DEFAULTS: Settings = { backlight: 0.75, volume: 0.5, muted: false, finish: 'black' }

const clamp01 = (n: unknown, fallback: number) =>
  typeof n === 'number' && Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : fallback

function load(): Settings {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<Settings>
    return {
      backlight: clamp01(saved.backlight, DEFAULTS.backlight),
      volume: clamp01(saved.volume, DEFAULTS.volume),
      muted: typeof saved.muted === 'boolean' ? saved.muted : DEFAULTS.muted,
      finish: saved.finish === 'silver' ? 'silver' : 'black',
    }
  } catch {
    return DEFAULTS
  }
}

/** Keyboard settings, remembered per visitor in localStorage. */
export function useSettings() {
  const [settings, setSettings] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // storage unavailable (private mode etc.) — settings just won't persist
    }
  }, [settings])

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  return [settings, update] as const
}
