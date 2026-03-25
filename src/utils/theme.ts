export const THEME_STORAGE_KEY = 'tools-theme'

export type ThemePreference = 'light' | 'dark'

export function getStoredTheme(): ThemePreference | null {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY)
    if (v === 'light' || v === 'dark') return v
  } catch {
    /* ignore */
  }
  return null
}

export function applyThemeToDocument(stored: ThemePreference | null): void {
  const root = document.documentElement
  if (stored === 'light') root.setAttribute('data-theme', 'light')
  else if (stored === 'dark') root.setAttribute('data-theme', 'dark')
  else root.removeAttribute('data-theme')
}

export function isEffectiveDark(stored: ThemePreference | null): boolean {
  if (stored === 'dark') return true
  if (stored === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function setStoredTheme(mode: ThemePreference): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode)
  } catch {
    /* ignore */
  }
  applyThemeToDocument(mode)
}
