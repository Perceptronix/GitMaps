// ICV (Interaction Content Visible) Observer
//
// Measures interaction-content-visible for in-page interactions that fetch data.
// Modeled after HPC (for page loads) and Datadog RUM Actions (for click tracking).
//
// Algorithm:
// 1. Listen for clicks on interactive elements
// 2. On click, start watching for "page activity" (DOM mutations + network requests)
// 3. If no activity within VALIDATION_DELAY (100ms), discard (not a data-fetching interaction)
// 4. While network requests are pending, keep waiting
// 5. After last activity + END_DELAY (100ms) of quiet, report the timing
// 6. If a data-icv-visible element is inserted, report immediately (precise mode)
// 7. Max duration cap at MAX_DURATION (10s)

import type {ICVCallback, ICVTimingEvent, InteractionType, PendingInteraction} from './types'
import {getSelector} from '../get-selector'
import {getActionName} from './action-name'
import {extractEndpoint, shouldIgnoreUrl} from '../fetch-url-utils'
import {addFetchInterceptor} from '../fetch-patch'
import {buildMutationObserver, getElementType} from './build-mutation-observer'
import {getCurrentReactAppName} from '@github-ui/stats-metadata'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {ssrSafeDocument} from '@github-ui/ssr-utils'
import {getGlobalINPObserver} from '../web-vitals'
import {getCPUBucket} from '@github-ui/cpu-bucket'
import {getFeatureFlags} from '../get-feature-flags'

// Elements we consider "interactive" for click tracking
export const INTERACTIVE_SELECTORS = [
  'button',
  'summary',
  '[role="button"]',
  '[role="menuitem"]',
  '[role="tab"]',
  '[role="option"]',
  'a[data-icv-name]',
  'details-menu[src]',
  'input[type="text"]',
  'input[type="search"]',
  'input:not([type])',
  'textarea',
].join(',')

// Text input types that trigger tracking on the `input` event (type-to-search, etc.)
export const TEXT_INPUT_SELECTOR = 'input[type="text"], input[type="search"], input:not([type]), textarea'

// If no page activity within this window after click, discard the interaction
export const VALIDATION_DELAY = 100

// After activity stops, wait this long to confirm it's settled
export const END_DELAY = 100

// Absolute max duration for any interaction
export const MAX_DURATION = 10_000

// Returns the current URL without the hash fragment.
// Hash changes should still trigger interactions as long as on same page
function urlWithoutHash(): string {
  return location.href.replace(/#.*$/, '')
}

// Parse a Server-Timing header value into a {name: dur} map.
// Returns null when the header is absent or has no parseable entries.
// Format: "SQL;dur=43.68,Redis;dur=1.76,Cache;desc="hit";dur=2.2"
export function parseServerTimings(header: string | null): Record<string, number> | null {
  if (!header) return null
  const result: Record<string, number> = {}
  for (const entry of header.split(',')) {
    const parts = entry.trim().split(';')
    const name = parts[0]?.trim()
    if (!name) continue
    let dur = 0
    for (let i = 1; i < parts.length; i++) {
      const param = parts[i]
      if (!param) continue
      if (param.trim().startsWith('dur=')) {
        dur = parseFloat(param.trim().slice(4)) || 0
        break
      }
    }
    result[name] = dur
  }
  return Object.keys(result).length > 0 ? result : null
}

// Round to 2 decimal places (sub-millisecond precision) to reduce payload size.
function round2(v: number): number {
  return Math.round(v * 100) / 100
}

// Find the best-matching resource timing entry for a given URL and start time.
// Handles duplicate URLs (e.g. multiple /graphql calls) by selecting the entry
// whose startTime is closest to the fetch initiation timestamp.
// Also handles URL prefix matching (fetch URL may lack query params the browser adds).
export function findResourceTimingEntry(
  map: Map<string, PerformanceResourceTiming[]>,
  url: string,
  startTime: number,
): PerformanceResourceTiming | null {
  // Collect candidate entries: exact match + prefix match (url?query)
  const candidates: PerformanceResourceTiming[] = []
  for (const [key, entries] of map) {
    if (key === url || key.startsWith(`${url}?`)) {
      candidates.push(...entries)
    }
  }
  if (candidates.length === 0) return null
  // Pick the entry whose startTime is closest to when the fetch was initiated
  let best = candidates[0]
  let bestDelta = best ? Math.abs(best.startTime - startTime) : Infinity
  for (let i = 1; i < candidates.length; i++) {
    const candidate = candidates[i]
    if (!candidate) continue
    const delta = Math.abs(candidate.startTime - startTime)
    if (delta < bestDelta) {
      best = candidate
      bestDelta = delta
    }
  }
  return best ?? null
}

export function observeICV(callback: ICVCallback): void {
  // Only run when all required browser APIs are available
  if (typeof Element.prototype.checkVisibility !== 'function') return

  let pending: PendingInteraction | null = null

  // The default resource timing buffer (250 entries) fills up on resource-heavy pages,
  // causing getEntriesByName to miss entries added after the buffer is full.
  // Use a PerformanceObserver to capture resource timing entries as they arrive.
  // Only fetch/xmlhttprequest entries are stored (matching the fetch interceptor's filter).
  // Stores arrays per URL to handle duplicate URLs (e.g. multiple /graphql calls).
  const resourceTimingMap = new Map<string, PerformanceResourceTiming[]>()
  try {
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries() as PerformanceResourceTiming[]) {
        if (entry.initiatorType !== 'fetch' && entry.initiatorType !== 'xmlhttprequest') continue
        if (shouldIgnoreUrl(entry.name)) continue
        const existing = resourceTimingMap.get(entry.name)
        if (existing) {
          existing.push(entry)
        } else {
          resourceTimingMap.set(entry.name, [entry])
        }
      }
    })
    observer.observe({type: 'resource', buffered: true})
  } catch {
    // PerformanceObserver not supported — fall back to getEntriesByName below
  }

  // Register a fetch interceptor for pending request tracking.
  // The shared fetch patch calls this for every non-telemetry fetch.
  // We track initiation (increment pending count) and completion (via responsePromise).
  addFetchInterceptor((url, responsePromise) => {
    const interaction = pending
    if (!interaction || interaction.settled) return

    const endpoint = extractEndpoint(url)

    interaction.pendingRequests++
    interaction.networkRequestCount++
    interaction.hadActivity = true
    if (endpoint && interaction.endpoints.length < 5) interaction.endpoints.push(endpoint)

    // Record when the first request fires
    if (interaction.networkStartTime === null) {
      interaction.networkStartTime = performance.now()
    }

    // Fallback fetch duration: delta from request initiation to response completion
    const requestInitiatedAt = performance.now()

    if (interaction.endTimer) {
      clearTimeout(interaction.endTimer)
      interaction.endTimer = undefined
    }

    // eslint-disable-next-line github/no-then -- tracking fetch completion for ICV timing
    responsePromise.then(
      response => {
        interaction.networkEndTime = Math.max(interaction.networkEndTime, performance.now())

        const serverTimings = parseServerTimings(response.headers.get('Server-Timing'))
        const responseCompletedAt = performance.now()

        // Only track same-origin requests with a resolved endpoint path.
        // Skip cross-origin or unrecognized URLs to avoid leaking full URLs into telemetry.
        if (endpoint && interaction.networkTimings.length < 5) {
          const absoluteUrl = new URL(url, location.origin).href
          interaction.networkTimings.push({
            endpoint,
            serverTimings,
            ttfb: null,
            downloadTime: null,
            fetchDuration: round2(responseCompletedAt - requestInitiatedAt),
            tempLookup: {absoluteUrl, requestInitiatedAt},
          })
        }

        onRequestComplete(interaction)
      },
      () => {
        interaction.networkEndTime = Math.max(interaction.networkEndTime, performance.now())
        onRequestComplete(interaction)
      },
    )
  })

  ssrSafeDocument?.addEventListener(
    'click',
    (e: MouseEvent) => {
      const target = e.target
      if (!(target instanceof Element)) return

      const interactive = target.closest(INTERACTIVE_SELECTORS)
      if (!interactive) return

      // Distinguish keyboard-initiated clicks (Enter/Space) from pointer clicks
      const interactionType: InteractionType = e.detail === 0 ? 'keyboard' : 'click'
      startInteraction(interactive, interactionType, e)
    },
    {capture: true},
  )

  // Input listener only starts tracking on the first keystroke. Subsequent keystrokes are ignored
  ssrSafeDocument?.addEventListener(
    'input',
    (e: Event) => {
      const target = e.target
      if (!(target instanceof Element)) return
      if (!target.matches(TEXT_INPUT_SELECTOR)) return
      if (pending && pending.interactionType === 'input' && pending.clickElement === target) return

      startInteraction(target, 'input')
    },
    {capture: true},
  )

  // Discard any pending interaction when a soft navigation starts —
  // URL-changing navigations are not in-page interactions we want to measure.
  ssrSafeDocument?.addEventListener(SOFT_NAV_STATE.START, () => {
    if (pending) {
      discard(pending)
    }
  })

  function startInteraction(interactive: Element, interactionType: InteractionType, event?: Event) {
    if (pending) {
      finalize(pending)
    }

    const nameStart = performance.now()
    const {actionName, nameFoundBy} = getActionName(interactive)
    const actionNameTime = performance.now() - nameStart

    const start = performance.now()

    const interaction: PendingInteraction = {
      clickElement: interactive,
      actionName,
      nameFoundBy,
      elementType: getElementType(interactive),
      interactionType,
      start,
      pendingRequests: 0,
      networkRequestCount: 0,
      endpoints: [],
      hadMutations: false,
      hadActivity: false,
      markerFound: false,
      settled: false,
      startUrl: urlWithoutHash(),
      mutationCallbackTime: 0,
      mutationCallbackCount: 0,
      mutationNodeCount: 0,
      rafTime: 0,
      actionNameTime,
      inpTime: null,
      networkStartTime: null,
      networkEndTime: 0,
      networkTimings: [],
    }

    // Register a callback to capture the INP duration for the triggering interaction.
    // Only pointer/keyboard events produce PerformanceEventTiming entries with an interactionId.
    if (event) {
      getGlobalINPObserver()?.registerCallback({
        event,
        cb: data => {
          interaction.inpTime = (interaction.inpTime ?? 0) + data.latency
        },
      })
    }

    interaction.maxTimer = setTimeout(() => finalize(interaction), MAX_DURATION)
    interaction.mutationObserver = buildMutationObserver(interaction, resetEndTimer, finalize)

    interaction.validationTimer = setTimeout(() => {
      if (!interaction.hadMutations && !interaction.hadActivity) {
        discard(interaction)
      }
    }, VALIDATION_DELAY)

    interaction.mutationObserver.observe(document, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['hidden', 'open'],
      attributeOldValue: true,
    })

    pending = interaction
  }

  function onRequestComplete(interaction: PendingInteraction) {
    if (interaction.settled) return
    interaction.pendingRequests--
    if (interaction.pendingRequests <= 0) {
      interaction.pendingRequests = 0
      resetEndTimer(interaction)
    }
  }

  function resetEndTimer(interaction: PendingInteraction) {
    if (interaction.settled) return
    if (interaction.endTimer) clearTimeout(interaction.endTimer)

    if (interaction.pendingRequests <= 0) {
      interaction.endTimer = setTimeout(() => {
        finalize(interaction)
      }, END_DELAY)
    }
  }

  // Convert interaction into reportable metric
  function finalize(interaction: PendingInteraction) {
    discard(interaction)

    if (!interaction.hadActivity) return
    // Discard if the URL changed (navigation occurred), ignoring hash-only changes.
    if (urlWithoutHash() !== interaction.startUrl) return

    // Resolve PerformanceResourceTiming data (ttfb, downloadTime, precise fetchDuration).
    // Done at finalization rather than fetch completion to give the PerformanceObserver
    // time to deliver entries (observer callback is a separate macrotask).
    for (const timing of interaction.networkTimings) {
      const {absoluteUrl, requestInitiatedAt = 0} = timing.tempLookup ?? {}
      if (!absoluteUrl) continue
      const entry =
        findResourceTimingEntry(resourceTimingMap, absoluteUrl, requestInitiatedAt) ||
        ((performance.getEntriesByName(absoluteUrl, 'resource') as PerformanceResourceTiming[]).at(-1) ?? null)
      if (entry) {
        timing.ttfb = round2(entry.responseStart - entry.requestStart)
        timing.downloadTime = round2(entry.responseEnd - entry.responseStart)
        timing.fetchDuration = round2(entry.responseEnd - entry.fetchStart)
      }
      delete timing.tempLookup
    }

    // Free resource timing entries from previous interactions to bound memory usage.
    resourceTimingMap.clear()

    const value = round2(performance.now() - interaction.start)
    const event: ICVTimingEvent = {
      name: 'ICV',
      value,
      clickTarget: getSelector(interaction.clickElement),
      contentTarget: getSelector(interaction.contentElement),
      app: getCurrentReactAppName() || 'rails',
      cpu: getCPUBucket(),
      featureFlags: getFeatureFlags(),
      actionName: interaction.actionName,
      nameFoundBy: interaction.nameFoundBy,
      interactionType: interaction.interactionType,
      markerFound: interaction.markerFound,
      networkRequestCount: interaction.networkRequestCount,
      endpoints: interaction.endpoints,
      elementType: interaction.elementType,
      inpTime: interaction.inpTime,
      networkDuration: round2(
        interaction.networkStartTime !== null ? interaction.networkEndTime - interaction.networkStartTime : 0,
      ),
      networkTimings: interaction.networkTimings.slice().sort((a, b) => b.fetchDuration - a.fetchDuration),
      mutationCallbackTime: round2(interaction.mutationCallbackTime),
      mutationCallbackCount: interaction.mutationCallbackCount,
      mutationNodeCount: interaction.mutationNodeCount,
      rafTime: round2(interaction.rafTime),
      actionNameTime: round2(interaction.actionNameTime),
    }

    callback(event)
  }

  // Clean up all timers and observers
  function discard(interaction: PendingInteraction) {
    if (interaction.settled) return
    interaction.settled = true

    if (interaction.validationTimer) clearTimeout(interaction.validationTimer)
    if (interaction.endTimer) clearTimeout(interaction.endTimer)
    if (interaction.maxTimer) clearTimeout(interaction.maxTimer)
    interaction.mutationObserver?.disconnect()

    if (pending === interaction) {
      pending = null
    }
  }
}
