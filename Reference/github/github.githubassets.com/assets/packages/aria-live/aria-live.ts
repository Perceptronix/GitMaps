import type {} from './global.d'
import {ssrSafeDocument} from '@github-ui/ssr-utils'
import '@github/arianotify-polyfill'

/**
 * Troubleshooting guide for aria-live regions available on the Hub
 * - https://thehub.github.com/epd/engineering/dev-practicals/frontend/accessibility/readiness-routine/screenreaders/live-regions-and-focus-management-techniques/#why-isnt-my-live-region-working-as-i-expect
 */

// Announce an element's text to the screen reader.
export function announceFromElement(el: HTMLElement, options?: {assertive?: boolean; element?: HTMLElement}) {
  // innerText does not contain hidden text
  /* eslint-disable-next-line github/no-innerText */
  const message = (el.getAttribute('aria-label') || el.innerText || '').trim()
  announce(message, {...options, element: options?.element ?? el})
}

// Announce message update to screen reader.
// Note: Use caution when using this function while a dialog is active.
// If the message is updated while the dialog is open, the screen reader may not announce the live region.
// For more information, view the document on dialog and live region support: https://github.com/github/accessibility/blob/main/docs/wiki/screen-reader-testing/dialog-live-region-support.md
export function announce(message: string, options?: {assertive?: boolean; element?: HTMLElement}) {
  const {assertive, element} = options ?? {}

  try {
    const priority = assertive ? 'high' : 'normal'
    const announcer = element?.isConnected ? element : ssrSafeDocument
    if (announcer) {
      announcer.ariaNotify(message, {priority})
    }
  } catch {
    // Ignore the error but don’t block other JS execution
    // we may later `reportError` from here or emit stats to track.
  }
}
