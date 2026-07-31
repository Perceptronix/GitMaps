/**
 * User preferences for hovercards.
 *
 * Preferences are read from `<meta>` tags in the document head and cached
 * after first access. No DOM queries are performed after the initial read.
 */

// Cached preference values (read from meta tags once, then cached)
let cachedHovercardsEnabled: boolean | undefined
let cachedHovercardHintEnabled: boolean | undefined

/**
 * Check if hovercards are enabled for the current user.
 * Reads from `<meta name="hovercards-preference">` tag. Defaults to true if not set.
 * Result is cached after first call - no repeated DOM queries.
 */
export function isHovercardEnabledForUser(): boolean {
  if (typeof document === 'undefined') return true
  if (cachedHovercardsEnabled !== undefined) return cachedHovercardsEnabled

  const meta = document.querySelector<HTMLMetaElement>('meta[name=hovercards-preference]')
  cachedHovercardsEnabled = meta?.content === 'true' || meta === null
  return cachedHovercardsEnabled
}

/**
 * Check if hovercard keyboard hint (aria-keyshortcuts) is enabled for the current user.
 * Reads from `<meta name="announcement-preference-hovercard">` tag. Defaults to true if not set.
 * Returns false if hovercards are disabled entirely.
 * Result is cached after first call - no repeated DOM queries.
 */
export function isHovercardHintEnabledForUser(): boolean {
  if (typeof document === 'undefined') return true
  if (cachedHovercardHintEnabled !== undefined) return cachedHovercardHintEnabled
  if (!isHovercardEnabledForUser()) {
    cachedHovercardHintEnabled = false
    return false
  }

  const meta = document.querySelector<HTMLMetaElement>('meta[name=announcement-preference-hovercard]')
  cachedHovercardHintEnabled = meta?.content === 'true' || meta === null
  return cachedHovercardHintEnabled
}

/**
 * Reset cached preference values. Useful for testing.
 */
export function resetHovercardPreferences(): void {
  cachedHovercardsEnabled = undefined
  cachedHovercardHintEnabled = undefined
}

/** The keyboard shortcut for opening hovercards */
export const HOVERCARD_KEYBOARD_SHORTCUT = 'Alt+ArrowUp'
