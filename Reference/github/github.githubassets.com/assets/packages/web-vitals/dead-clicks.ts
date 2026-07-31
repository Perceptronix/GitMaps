import {sendEvent} from '@github-ui/hydro-analytics'
import {sendCustomMetric} from '@github-ui/stats'
import {getSelector} from './get-selector'
import {onFetchInitiated} from './fetch-patch'

/**
 * Dead click detection: identifies clicks on actionable elements that produce no visible response.
 *
 * A "dead click" is a click on an actionable element that produces NO:
 * - DOM mutations (no content changes, no loading indicators)
 * - Network requests (fetch/XHR completing after the click)
 * - Scroll events (no scroll-into-view or anchor behavior)
 * - Input focus changes
 * - Page navigations (popstate, pagehide)
 *
 * This is more actionable than rage clicks because it catches the problem on the
 * FIRST failed interaction, before the user becomes frustrated.
 *
 * Only tracks clicks on actionable elements (Datadog RUM approach):
 * - <a> (with or without href)
 * - <button>
 * - Elements with role="button", role="tab", role="switch", role="checkbox", role="option"
 * - Elements with tabindex
 * - Elements with data-action (GitHub custom element pattern)
 *
 * This avoids false positives from incidental clicks on non-interactive content.
 */

/** Time to wait for page activity after a click before declaring it "dead".
 * We patch window.fetch (via fetch-patch) to detect request initiation
 * instantly, so this timeout only needs to cover non-fetch signals like XHR
 * (detected via PerformanceObserver on completion) and delayed DOM mutations.
 * Note: XHR requests that take longer than this timeout to complete will
 * still be classified as dead clicks since PerformanceObserver fires on
 * completion, not initiation. This is an accepted trade-off.
 * Sentry uses a 3s "slow click" threshold with a 7s final timeout. */
const DEAD_CLICK_TIMEOUT_MS = 3000

/** Don't report dead clicks on the same selector more than once per cooldown */
const COOLDOWN_MS = 10000

/** How long to keep errors in the buffer before pruning */
const ERROR_BUFFER_TTL_MS = 2000

/** Max errors to keep in the ring buffer */
const ERROR_BUFFER_MAX = 20

/** CSS selector matching actionable elements — those expected to respond to clicks */
const ACTIONABLE_SELECTOR = [
  'a',
  'button',
  '[tabindex]',
  '[data-action]',
  '[role="button"]',
  '[role="tab"]',
  '[role="switch"]',
  '[role="checkbox"]',
  '[role="option"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  '[role="link"]',
  '[role="treeitem"]',
  '[role="combobox"]',
].join(',')

/** Check whether the click target (or an ancestor) is an actionable element */
function isActionable(element: Element): boolean {
  return element.closest(ACTIONABLE_SELECTOR) !== null
}

export function observeDeadClicks(): void {
  const cooldowns = new Map<string, number>()
  const errorBuffer: Array<{timestamp: number; message: string}> = []
  let pendingClick = false

  // Track JS errors that occur near clicks — uses addEventListener to avoid
  // clobbering existing window.onerror handlers
  window.addEventListener('error', event => {
    const message = event.message || ''
    if (!message) return
    errorBuffer.push({timestamp: performance.now(), message})
    // Keep buffer bounded
    if (errorBuffer.length > ERROR_BUFFER_MAX) errorBuffer.shift()
  })

  window.addEventListener('unhandledrejection', event => {
    const message = event.reason?.message || String(event.reason || '')
    if (!message) return
    errorBuffer.push({timestamp: performance.now(), message})
    if (errorBuffer.length > ERROR_BUFFER_MAX) errorBuffer.shift()
  })

  document.addEventListener(
    'click',
    event => {
      const target = event.target
      if (!target || !(target instanceof Element)) return
      if (!isActionable(target)) return

      // Skip clicks where the user is selecting text (e.g. triple-click-to-select)
      const selection = window.getSelection()
      if (selection && selection.toString().length > 0) return

      // Only track one click at a time — avoid stacking MutationObservers
      // on rapid clicks, which would observe the full document subtree concurrently
      if (pendingClick) return

      const now = performance.now()
      const selector = getSelector(target)
      if (!selector) return

      // Check cooldown
      const lastReport = cooldowns.get(selector)
      if (lastReport && now - lastReport < COOLDOWN_MS) return

      // Watch for page activity: DOM mutations, network requests, scrolls,
      // focus changes, or navigations (aligns with Sentry/Datadog detection)
      let activityDetected = false
      let cleanedUp = false
      let resourceObserver: PerformanceObserver | undefined
      pendingClick = true

      const onActivity = () => {
        activityDetected = true
        cleanup()
      }

      // Detect fetch initiation instantly via the shared fetch patch.
      // This fires synchronously when window.fetch is called, so we know about
      // network activity within milliseconds of the click — no need to wait for
      // the response to complete.
      const unsubscribeFetch = onFetchInitiated(onActivity)

      const cleanup = () => {
        if (cleanedUp) return
        cleanedUp = true
        pendingClick = false
        mutationObserver.disconnect()
        resourceObserver?.disconnect()
        unsubscribeFetch()
        document.removeEventListener('scroll', onScroll, {capture: true})
        document.removeEventListener('focusin', onFocusIn)
        document.removeEventListener('soft-nav:start', onActivity)
        window.removeEventListener('pagehide', onActivity)
        window.removeEventListener('popstate', onActivity)
      }

      const mutationObserver = new MutationObserver(onActivity)

      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      })

      const onScroll = () => {
        onActivity()
      }
      const onFocusIn = () => {
        onActivity()
      }

      // eslint-disable-next-line github/prefer-observers -- detecting scroll activity post-click, not element visibility
      document.addEventListener('scroll', onScroll, {capture: true, once: true})
      document.addEventListener('focusin', onFocusIn, {once: true})

      // Fallback: PerformanceObserver catches XHR requests and any fetches
      // that bypass the patched window.fetch. Fires on completion, not initiation.
      if (typeof PerformanceObserver !== 'undefined' && PerformanceObserver.supportedEntryTypes?.includes('resource')) {
        resourceObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.startTime >= now) {
              const {initiatorType} = entry as PerformanceResourceTiming
              if (initiatorType === 'fetch' || initiatorType === 'xmlhttprequest') {
                onActivity()
                return
              }
            }
          }
        })
        resourceObserver.observe({type: 'resource', buffered: false})
      }

      // Page navigation counts as activity — the click is leading somewhere
      window.addEventListener('pagehide', onActivity, {once: true})
      window.addEventListener('popstate', onActivity, {once: true})
      // Soft navigation (Turbo/React) counts as activity — the click is
      // triggering a client-side page transition
      document.addEventListener('soft-nav:start', onActivity, {once: true})

      // Check defaultPrevented after event propagation completes — at this point
      // bubble-phase handlers have had a chance to call preventDefault()
      setTimeout(() => {
        if (event.defaultPrevented) {
          activityDetected = true
          cleanup()
          return
        }
      }, 0)

      setTimeout(() => {
        cleanup()

        if (!activityDetected) {
          cooldowns.set(selector, performance.now())

          // Clean up old cooldowns
          if (cooldowns.size > 50) {
            const cutoff = performance.now() - COOLDOWN_MS
            for (const [key, time] of cooldowns) {
              if (time < cutoff) cooldowns.delete(key)
            }
          }

          // Check if a JS error occurred during this click's lifetime
          const clickEnd = performance.now()
          const errorDuringClick = findErrorDuringClick(errorBuffer, now, clickEnd)

          if (errorDuringClick) {
            reportErrorClick(selector, errorDuringClick)
          } else {
            reportDeadClick(selector)
          }

          // Prune stale errors
          pruneErrorBuffer(errorBuffer, clickEnd)
        }
      }, DEAD_CLICK_TIMEOUT_MS)
    },
    {capture: true},
  )
}

function reportDeadClick(selector: string): void {
  sendEvent(
    'dead-click',
    {
      target: selector.slice(0, 200),
      url: window.location.href,
    },
    {batched: true},
  )

  sendCustomMetric(
    {
      name: 'BROWSER_VITALS_COUNT_DEAD_CLICK',
      value: 1,
      requestUrl: window.location.href,
    },
    false,
    1, // Low-frequency event, no additional sampling needed
  )
}

function sanitizeErrorMessage(message: string): string {
  // Extract only the error type/name (e.g. "TypeError", "ReferenceError") to avoid
  // sending potentially sensitive user data in error messages
  const colonIndex = message.indexOf(':')
  if (colonIndex > 0 && colonIndex < 50) {
    const errorType = message.slice(0, colonIndex).trim()
    // Only keep the type if it looks like an error class name (alphanumeric, no spaces)
    if (/^[A-Za-z][A-Za-z0-9]*$/.test(errorType)) {
      return errorType
    }
  }
  return 'Error'
}

function reportErrorClick(selector: string, errorMessage: string): void {
  sendEvent(
    'error-click',
    {
      target: selector.slice(0, 200),
      errorType: sanitizeErrorMessage(errorMessage),
      url: window.location.href,
    },
    {batched: true},
  )

  sendCustomMetric(
    {
      name: 'BROWSER_VITALS_COUNT_ERROR_CLICK',
      value: 1,
      requestUrl: window.location.href,
    },
    false,
    1, // Low-frequency event, no additional sampling needed
  )
}

function findErrorDuringClick(
  buffer: Array<{timestamp: number; message: string}>,
  clickStart: number,
  clickEnd: number,
): string | undefined {
  for (const entry of buffer) {
    if (entry.timestamp >= clickStart && entry.timestamp <= clickEnd) {
      return entry.message
    }
  }
  return undefined
}

function pruneErrorBuffer(buffer: Array<{timestamp: number; message: string}>, now: number): void {
  const cutoff = now - ERROR_BUFFER_TTL_MS
  while (buffer.length > 0 && buffer[0] && buffer[0].timestamp < cutoff) {
    buffer.shift()
  }
}
