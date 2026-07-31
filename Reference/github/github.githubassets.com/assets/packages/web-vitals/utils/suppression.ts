import type {MetricOrHPC} from '../web-vitals'
import {ssrSafeDocument} from '@github-ui/ssr-utils'
import {sendCustomMetric} from '@github-ui/stats'

/**
 * Visibility Handling for Custom Observers (Long Tasks, Long Animation Frames)
 *
 * This module mirrors the visibility tracking pattern from the web-vitals library
 * (see: https://github.com/GoogleChrome/web-vitals/blob/main/src/lib/getVisibilityWatcher.ts)
 *
 * Unlike core web vitals (INP, LCP, CLS) which are collected via the web-vitals library
 * that handles visibility internally, our custom observers use raw PerformanceObserver APIs.
 *
 * Key alignment with web-vitals library:
 * - Track "firstHiddenTime" to filter entries that occurred after the page was backgrounded
 * - Use event.timeStamp (not performance.now()) for consistency with web-vitals
 * - Handle prerendering states: document.prerendering pages are "hidden" but shouldn't
 *   be treated as truly hidden until after prerendering completes (prerenderingchange event)
 * - Use capture phase event listeners
 * - Filter: suppress entries where entry.startTime >= firstHiddenTime
 *
 * Reference: web-vitals uses this pattern to ensure metrics represent actual user experience,
 * filtering out metrics collected when the page was backgrounded/not visible.
 */

// Track when the page first became hidden
// Mirrors web-vitals library: https://github.com/GoogleChrome/web-vitals/blob/main/src/lib/getVisibilityWatcher.ts
let firstHiddenTime = Infinity
let visibilityListenerInitialized = false

/**
 * Determines the initial hidden time, accounting for prerendering.
 *
 * Mirrors web-vitals library's `initHiddenTime()`:
 * - If document is hidden AND not prerendering, assume hidden since navigation (time = 0)
 * - If prerendering, the page appears "hidden" but we shouldn't set firstHiddenTime to 0
 *   until we know the actual visibility state after prerendering completes
 * - Otherwise, Infinity means "not yet hidden"
 *
 * Reference: https://github.com/GoogleChrome/web-vitals/blob/main/src/lib/getVisibilityWatcher.ts#L22-L30
 */
function initHiddenTime(): number {
  // During prerendering, visibilityState is 'hidden' but this doesn't represent
  // the actual user-facing visibility. We wait for prerenderingchange to determine
  // the true initial visibility state.
  if (typeof document !== 'undefined') {
    const isPrerendering = 'prerendering' in document && document.prerendering === true
    if (document.visibilityState === 'hidden' && !isPrerendering) {
      return 0
    }
  }
  return Infinity
}

/**
 * Handles visibility and prerendering state changes.
 * Mirrors web-vitals library's `onVisibilityUpdate` pattern.
 *
 * Reference: https://github.com/GoogleChrome/web-vitals/blob/main/src/lib/getVisibilityWatcher.ts#L33-L59
 */
function onVisibilityUpdate(event: Event): void {
  if (typeof document === 'undefined') return

  if (document.visibilityState === 'hidden') {
    // Only update firstHiddenTime if it hasn't been set yet (still Infinity)
    if (!isFinite(firstHiddenTime)) {
      // For visibilitychange events: use event.timeStamp (aligns with web-vitals)
      // For prerenderingchange events: if still hidden, page was activated in background (time = 0)
      firstHiddenTime = event.type === 'visibilitychange' ? event.timeStamp : 0
    }
  }
}

/**
 * Initialize visibility tracking - called lazily on first use.
 * Mirrors web-vitals library's getVisibilityWatcher() initialization.
 *
 * Reference: https://github.com/GoogleChrome/web-vitals/blob/main/src/lib/getVisibilityWatcher.ts#L61-L100
 */
function initializeVisibilityTracking(): void {
  if (visibilityListenerInitialized) return
  visibilityListenerInitialized = true

  if (typeof document === 'undefined') return

  // Set initial hidden time (accounting for prerendering)
  firstHiddenTime = initHiddenTime()

  // Listen for visibility changes using capture phase (matches web-vitals)
  document.addEventListener('visibilitychange', onVisibilityUpdate, {capture: true})

  // Handle prerendering: when prerendering completes, check if page became visible or stayed hidden
  // Note: during prerender, visibilityState is 'hidden' but we don't want to treat it as truly hidden
  if ('prerendering' in document) {
    document.addEventListener('prerenderingchange', onVisibilityUpdate, {capture: true})
  }
}

/**
 * Suppression thresholds for Web Vitals metrics.
 * Values above these thresholds are considered non-representative and suppressed
 * to protect Datadog percentile accuracy.
 */

/** INP values above this are suppressed (5x "poor" threshold of 500ms) */
export const INP_VALUE_THRESHOLD_MS = 2500

/** INP processing duration above this indicates debugger pause */
export const INP_PROCESSING_DURATION_THRESHOLD_MS = 2000

/** LCP/ElementTiming values above this are suppressed (2.5x "poor" threshold of 4000ms) */
export const LCP_VALUE_THRESHOLD_MS = 10000

/** LCP elementRenderDelay above this indicates non-representative execution */
export const LCP_ELEMENT_RENDER_DELAY_THRESHOLD_MS = 8000

/** Long tasks above this are almost certainly debugger pauses */
export const LONG_TASK_DURATION_THRESHOLD_MS = 5000

/** Long animation frames above this are almost certainly debugger pauses */
export const LONG_ANIMATION_FRAME_DURATION_THRESHOLD_MS = 5000

/** CLS values above this are almost certainly non-representative (20x the "poor" threshold of 0.25) */
export const CLS_VALUE_THRESHOLD = 5.0

/** HPC values above this are almost certainly debugger pauses or background tabs */
export const HPC_VALUE_THRESHOLD_MS = 30000

/**
 * Suppression reasons for telemetry tracking
 */
export type SuppressionReason =
  | 'page_hidden'
  | 'value_exceeded'
  | 'processing_exceeded'
  | 'render_delay_exceeded'
  | 'missing_first_render_time'

/**
 * Reports a suppression event to telemetry.
 * Uses requestIdleCallback to avoid blocking the main thread.
 *
 * @param metric - The metric type that was suppressed
 * @param reason - The reason for suppression
 */
function reportSuppression(metric: string, reason: SuppressionReason): void {
  const send = () => {
    sendCustomMetric({
      name: 'BROWSER_VITALS_SUPPRESSED',
      value: 1,
      tags: {
        metric,
        reason,
      },
    })
  }

  requestIdleCallback(send)
}

/**
 * Checks if the page is currently visible to the user.
 * Hidden pages should not report Web Vitals as they don't represent actual UX.
 *
 * Note: In SSR environments, `ssrSafeDocument` will be null/undefined because there
 * is no real `document` or visibility state to inspect. In that case this helper
 * returns `true` by default. This is safe because Web Vitals collection only runs
 * in the browser, so this function is not used to report metrics from the server.
 *
 * @returns true if the page is visible, false otherwise
 */
export function isPageVisible(): boolean {
  // Default to "not visible" when ssrSafeDocument is unavailable.
  // This is the safer choice: if we can't determine visibility, suppress the metric
  // rather than risk reporting non-representative data.
  if (!ssrSafeDocument) return false
  return ssrSafeDocument.visibilityState === 'visible'
}

/**
 * Checks if INP metric has extreme attribution values indicating non-representative execution.
 *
 * @param metric - The INP metric to check
 * @returns true if attribution indicates suppression, false otherwise
 */
function shouldSuppressINPAttribution(metric: MetricOrHPC): boolean {
  // Only check if this is actually an INP metric with attribution
  if (metric.name !== 'INP' || !('attribution' in metric) || !metric.attribution) {
    return false
  }

  // Check processing duration with runtime type guards
  if ('processingDuration' in metric.attribution) {
    const processingDuration = metric.attribution.processingDuration
    // Extreme processing delays are likely debugger-related
    if (typeof processingDuration === 'number' && processingDuration > INP_PROCESSING_DURATION_THRESHOLD_MS) {
      return true
    }
  }

  return false
}

/**
 * Checks if LCP metric has extreme attribution values indicating non-representative execution.
 *
 * @param metric - The LCP metric to check
 * @returns true if attribution indicates suppression, false otherwise
 */
function shouldSuppressLCPAttribution(metric: MetricOrHPC): boolean {
  // Only check if this is actually an LCP metric with attribution
  if (metric.name !== 'LCP' || !('attribution' in metric) || !metric.attribution) {
    return false
  }

  const attribution = metric.attribution

  // Check elementRenderDelay - this is the delay from resource load to element render
  // Extreme render delays indicate non-representative execution
  if ('elementRenderDelay' in attribution && typeof attribution.elementRenderDelay === 'number') {
    if (attribution.elementRenderDelay > LCP_ELEMENT_RENDER_DELAY_THRESHOLD_MS) {
      return true
    }
  }

  return false
}

/**
 * Visibility Suppression Strategy by Metric Type
 *
 * CORE WEB VITALS (INP, LCP, CLS, ElementTiming):
 * - Page visibility suppression is NOT applied here
 * - The web-vitals library already handles visibility internally per Chrome UX guidelines
 * - Reference: https://github.com/GoogleChrome/web-vitals/blob/main/src/onLCP.ts#L66
 *   - `if (entry.startTime < visibilityWatcher.firstHiddenTime)`
 * - The library finalizes metrics when the page becomes hidden
 * - We only apply value-based suppression for extreme outliers (debugger pauses)
 *
 * CUSTOM OBSERVERS (Long Tasks, Long Animation Frames):
 * - Page visibility suppression IS applied (see shouldReportLongTask/shouldReportLongAnimationFrame)
 * - These use raw PerformanceObserver APIs that don't filter by visibility
 * - We implement the same firstHiddenTime pattern as web-vitals library
 * - This prevents inflated durations when page is paused/backgrounded
 */

/**
 * Determines if a Web Vital metric should be reported based on execution conditions
 * and metric-specific thresholds.
 *
 * Suppression policy for core web vitals:
 * - Extreme metric values: Apply metric-specific thresholds tuned for Datadog p95
 * - NO visibility suppression (handled by web-vitals library internally)
 *
 * Thresholds are intentionally conservative to prevent false negatives while
 * protecting Datadog percentiles from severe outliers.
 *
 * @param metric - The Web Vital metric to evaluate
 * @returns true if the metric should be reported, false if it should be suppressed
 */
export function shouldReportWebVital(metric: MetricOrHPC): boolean {
  const {name, value} = metric

  // Only apply suppression to INP, LCP, CLS, ElementTiming, and HPC
  if (name !== 'INP' && name !== 'LCP' && name !== 'CLS' && name !== 'ElementTiming' && name !== 'HPC') {
    return true
  }

  // Apply metric-specific extreme value suppression
  switch (name) {
    case 'INP': {
      // INP suppression: Datadog p95 becomes unstable above threshold with low sample counts
      if (value > INP_VALUE_THRESHOLD_MS) {
        reportSuppression(name, 'value_exceeded')
        return false
      }

      // Check attribution for extreme processing delays
      if (shouldSuppressINPAttribution(metric)) {
        reportSuppression(name, 'processing_exceeded')
        return false
      }
      break
    }

    case 'LCP':
    case 'ElementTiming': {
      // LCP/ElementTiming suppression: Values above threshold are almost always non-representative in RUM
      if (value > LCP_VALUE_THRESHOLD_MS) {
        reportSuppression(name, 'value_exceeded')
        return false
      }

      // Check attribution for extreme render delays (LCP only - ElementTiming doesn't have this)
      if (name === 'LCP' && shouldSuppressLCPAttribution(metric)) {
        reportSuppression(name, 'render_delay_exceeded')
        return false
      }
      break
    }

    case 'CLS': {
      // CLS values above threshold are non-representative (debugger pauses, browser extensions)
      if (value > CLS_VALUE_THRESHOLD) {
        reportSuppression(name, 'value_exceeded')
        return false
      }
      break
    }

    case 'HPC': {
      // HPC values above threshold are almost certainly non-representative
      if (value > HPC_VALUE_THRESHOLD_MS) {
        reportSuppression(name, 'value_exceeded')
        return false
      }
      break
    }
  }

  // Metric passes all suppression checks
  return true
}

/**
 * Container Timing parity with `shouldReportWebVital`. Container Timing
 * entries aren't part of the `MetricOrHPC` union (the API is still a
 * trial and we don't want to bake its shape into the typed metric
 * pipeline), so it gets a dedicated helper instead of a switch arm.
 *
 * Mirrors the HPC ceiling exactly: anything above `HPC_VALUE_THRESHOLD_MS`
 * is suppressed and counted via `BROWSER_VITALS_SUPPRESSED` so we can
 * see the drop rate next to HPC's in the same Datadog series.
 */
export function shouldReportContainerTiming(
  value: number,
  reason: 'page_hidden' | 'value_exceeded' | 'missing_first_render_time',
): boolean {
  if (reason === 'page_hidden') {
    reportSuppression('ContainerTiming', 'page_hidden')
    return false
  }
  if (reason === 'missing_first_render_time') {
    // The observer hands us an entry whose `firstRenderTime` is missing
    // or non-positive. Counted in Datadog so we can see how often the
    // strict guard fires — if this number is high we're losing samples
    // and need to reconsider the fallback.
    reportSuppression('ContainerTiming', 'missing_first_render_time')
    return false
  }
  // Match HPC's strict `>` comparator in `shouldReportWebVital` so both
  // metrics treat the threshold identically. Values *at* the threshold
  // pass through; only values strictly above are suppressed.
  if (!Number.isFinite(value) || value <= 0 || value > HPC_VALUE_THRESHOLD_MS) {
    reportSuppression('ContainerTiming', 'value_exceeded')
    return false
  }
  return true
}

/**
 * Determines if a Long Task should be reported.
 *
 * Suppression policy (matching web-vitals visibility patterns):
 * 1. Page hidden: Suppress tasks that started after firstHiddenTime
 *    - Mirrors how web-vitals filters entries: `entry.startTime < visibilityWatcher.firstHiddenTime`
 *    - Reference: https://github.com/GoogleChrome/web-vitals/blob/main/src/onLCP.ts#L66
 * 2. Extreme duration: Tasks above threshold are likely debugger pauses, not real UX
 *
 * Note: Unlike core web vitals (INP, LCP, CLS), Long Tasks use raw PerformanceObserver APIs
 * that don't have built-in visibility filtering, so we apply it here.
 *
 * @param entry - The PerformanceEntry for the long task
 * @returns true if the task should be reported, false if it should be suppressed
 */
export function shouldReportLongTask(entry: PerformanceEntry): boolean {
  // Initialize visibility tracking on first use (lazy initialization)
  initializeVisibilityTracking()

  // Suppress if the task started at or after the page was first hidden
  // Uses >= comparison matching web-vitals pattern (entries at hidden time are not representative)
  if (entry.startTime >= firstHiddenTime) {
    reportSuppression('LongTask', 'page_hidden')
    return false
  }

  // Long tasks above threshold are almost certainly debugger pauses
  if (entry.duration > LONG_TASK_DURATION_THRESHOLD_MS) {
    reportSuppression('LongTask', 'value_exceeded')
    return false
  }

  return true
}

/**
 * Determines if a Long Animation Frame should be reported.
 *
 * Suppression policy (matching web-vitals visibility patterns):
 * 1. Page hidden: Suppress frames that started after firstHiddenTime
 *    - Same pattern as shouldReportLongTask, aligned with web-vitals library
 * 2. Extreme duration: Frames above threshold are likely debugger pauses
 *
 * Note: Unlike core web vitals, Long Animation Frames use raw PerformanceObserver APIs
 * that don't have built-in visibility filtering, so we apply it here.
 *
 * @param entry - The PerformanceEntry for the long animation frame
 * @returns true if the frame should be reported, false if it should be suppressed
 */
export function shouldReportLongAnimationFrame(entry: PerformanceEntry): boolean {
  // Initialize visibility tracking on first use (lazy initialization)
  initializeVisibilityTracking()

  // Suppress if the frame started at or after the page was first hidden
  if (entry.startTime >= firstHiddenTime) {
    reportSuppression('LongAnimationFrame', 'page_hidden')
    return false
  }

  // Long animation frames above threshold are almost certainly debugger pauses
  if (entry.duration > LONG_ANIMATION_FRAME_DURATION_THRESHOLD_MS) {
    reportSuppression('LongAnimationFrame', 'value_exceeded')
    return false
  }

  return true
}

// Exported for testing purposes
export function getFirstHiddenTime(): number {
  return firstHiddenTime
}

// Exported for testing purposes - allows resetting state between tests
export function resetFirstHiddenTime(): void {
  firstHiddenTime = Infinity
  visibilityListenerInitialized = false
}
