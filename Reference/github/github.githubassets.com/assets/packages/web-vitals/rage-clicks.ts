import {sendEvent} from '@github-ui/hydro-analytics'
import {sendCustomMetric} from '@github-ui/stats'
import {getSelector} from './get-selector'

/**
 * Rage click detection: identifies when a user rapidly clicks the same element
 * multiple times, indicating the UI isn't responding to their interaction.
 *
 * Definition: 3+ clicks within 1 second on the same logical target.
 * Uses CSS selectors (via getSelector) for target identity to survive React re-renders.
 */

/** Minimum clicks within the window to qualify as a rage click */
const RAGE_THRESHOLD = 3

/** Time window in ms for counting rapid clicks */
const RAGE_WINDOW_MS = 1000

/** Don't report rage clicks on the same target more than once per cooldown */
const COOLDOWN_MS = 5000

/** Maximum Manhattan distance in px between clicks to consider them the same target.
 * ~42px Manhattan ≈ 30px Euclidean radius, matching Sentry's threshold. */
const MAX_DISTANCE_PX = 42

interface ClickRecord {
  timestamp: number
  selector: string
  x: number
  y: number
}

export function observeRageClicks(): void {
  const recentClicks: ClickRecord[] = []
  const cooldowns = new Map<string, number>()

  document.addEventListener(
    'click',
    event => {
      const target = event.target
      if (!target || !(target instanceof Element)) return

      const now = performance.now()
      const selector = getSelector(target)
      if (!selector) return

      // Prune old clicks outside the window
      while (recentClicks.length > 0) {
        const oldest = recentClicks[0]
        if (oldest && now - oldest.timestamp > RAGE_WINDOW_MS) {
          recentClicks.shift()
        } else {
          break
        }
      }

      recentClicks.push({timestamp: now, selector, x: event.clientX, y: event.clientY})

      // Count clicks on the same target within proximity (selector match + 100px radius)
      const matchingClicks = recentClicks.filter(
        c =>
          c.selector === selector && Math.abs(c.x - event.clientX) + Math.abs(c.y - event.clientY) <= MAX_DISTANCE_PX,
      )

      if (matchingClicks.length >= RAGE_THRESHOLD) {
        // Suppress when user is selecting text (triple-click-to-select is the #1 false positive)
        const selection = window.getSelection()
        if (selection && selection.toString().length > 0) return

        // Check cooldown — don't report the same target repeatedly
        const lastReport = cooldowns.get(selector)
        if (lastReport && now - lastReport < COOLDOWN_MS) return

        cooldowns.set(selector, now)

        // Clean up old cooldowns periodically
        if (cooldowns.size > 50) {
          for (const [key, time] of cooldowns) {
            if (now - time > COOLDOWN_MS) cooldowns.delete(key)
          }
        }

        reportRageClick(selector, matchingClicks.length)

        // Clear matching clicks to avoid re-triggering on the next click
        for (let i = recentClicks.length - 1; i >= 0; i--) {
          const click = recentClicks[i]
          if (click && click.selector === selector) {
            recentClicks.splice(i, 1)
          }
        }
      }
    },
    {capture: true},
  )
}

function reportRageClick(selector: string, clickCount: number): void {
  sendEvent(
    'rage-click',
    {
      target: selector.slice(0, 200),
      clickCount: String(clickCount),
      url: window.location.href,
    },
    {batched: true},
  )

  sendCustomMetric(
    {
      name: 'BROWSER_VITALS_COUNT_RAGE_CLICK',
      value: 1,
      requestUrl: window.location.href,
    },
    false,
    1, // Low-frequency event, no additional sampling needed
  )
}
