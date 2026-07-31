import {isbot} from 'isbot'

let _isAutomatedBrowser: boolean | undefined

/**
 * Detects if the current browser is automated (bot, crawler, or testing framework).
 */
export function isAutomatedBrowser(): boolean {
  if (_isAutomatedBrowser !== undefined) return _isAutomatedBrowser
  if (typeof navigator === 'undefined') {
    _isAutomatedBrowser = false
    return _isAutomatedBrowser
  }
  _isAutomatedBrowser = navigator.webdriver || isbot(navigator.userAgent)
  return _isAutomatedBrowser
}

/** @internal Reset memoized value — for tests only */
export function resetIsAutomatedBrowser(): void {
  _isAutomatedBrowser = undefined
}
