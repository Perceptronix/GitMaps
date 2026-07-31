import type {LCPMetricWithAttribution} from 'web-vitals/attribution'

const MARKER_PREFIX = 'js-parse-end'

interface BlockingCSSResult {
  /** Approximate time spent parsing CSS (First Paint - last CSS download end) */
  cssParseTime: number | undefined
  /** Total time to download all blocking CSS (max of individual download times, since parallel) */
  cssDownloadTime: number | undefined
  /** Total decoded (uncompressed) size of all blocking CSS in bytes */
  blockingCSSWeight: number | undefined
}

function getBlockingCSSUrls(): Set<string> {
  // This excludes preload, prefetch, alternate, etc.
  const stylesheets = document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
  const urls = new Set<string>()
  for (const link of stylesheets) urls.add(link.href)
  return urls
}

/**
 * Calculates timing metrics for render-blocking CSS.
 *
 * How it works:
 * 1. Identifies stylesheets that finished downloading before First Paint
 *    (these are "render-blocking" because the browser won't paint until they're parsed)
 * 2. Calculates timing breakdowns:
 *    - cssDownloadTime: max download duration (parallel downloads)
 *    - cssParseTime: FP - last CSS download end (includes render setup)
 *
 * Note on cssParseTime approximation:
 * - We can't inject executable code into CSS to measure parse time directly
 * - The gap also includes browser rendering setup time, not just CSS parsing
 * - If JS also blocks, the gap may include JS execution time
 *
 * Despite these limitations, it's a useful proxy for "time spent on CSS" since
 * First Paint is blocked until all render-blocking CSS is parsed and applied.
 */
function getBlockingCSS(
  resources: PerformanceResourceTiming[],
  firstPaint: PerformanceEntry | undefined,
  lcpTime: number,
): BlockingCSSResult {
  const blockingCSSUrls = getBlockingCSSUrls()
  const threshold = firstPaint?.startTime ?? lcpTime

  let lastCSSEnd = -Infinity
  let cssDownloadTime = -Infinity
  let blockingCSSWeight = 0
  let hasBlockingCSS = false

  for (const r of resources) {
    if (r.initiatorType !== 'link' || !blockingCSSUrls.has(r.name) || r.responseEnd >= threshold) continue
    hasBlockingCSS = true
    if (r.responseEnd > lastCSSEnd) lastCSSEnd = r.responseEnd
    const downloadTime = r.responseEnd - r.responseStart
    if (downloadTime > cssDownloadTime) cssDownloadTime = downloadTime
    blockingCSSWeight += r.decodedBodySize
  }

  if (!hasBlockingCSS) {
    return {
      cssParseTime: undefined,
      cssDownloadTime: undefined,
      blockingCSSWeight: undefined,
    }
  }

  const cssParseTime = firstPaint ? firstPaint.startTime - lastCSSEnd : undefined

  return {cssParseTime, cssDownloadTime, blockingCSSWeight}
}

/**
 * Aggregated stats for a group of JS entries, computed in a single pass.
 */
interface JSGroupStats {
  entries: PlatformBlockingJSEntry[]
  parseTimeTotal: number
  /** Total decoded (uncompressed) size in bytes */
  decodedBodySizeTotal: number
  /** Earliest responseEnd (when first script could start executing) */
  firstResponseEnd: number
  /** Latest parseEnd (when last script finished) */
  lastParseEnd: number
}

function createJSGroupStats(): JSGroupStats {
  return {
    entries: [],
    parseTimeTotal: 0,
    decodedBodySizeTotal: 0,
    firstResponseEnd: Infinity,
    lastParseEnd: -Infinity,
  }
}

function addToJSGroup(group: JSGroupStats, entry: PlatformBlockingJSEntry): void {
  group.entries.push(entry)
  group.parseTimeTotal += entry.parseTime
  group.decodedBodySizeTotal += entry.decodedBodySize
  if (entry.responseEnd < group.firstResponseEnd) group.firstResponseEnd = entry.responseEnd
  if (entry.parseEnd > group.lastParseEnd) group.lastParseEnd = entry.parseEnd
}

/**
 * Calculate wall-clock time for script execution in a group.
 * This is the actual time the main thread was blocked, accounting for parallel downloads.
 *
 * @param group - The JS group stats
 * @param windowStart - The start of the time window (e.g., 0 for FCP, fcpTime for LCP)
 * @returns Wall-clock blocking time, or 0 if no scripts
 */
function getJSWallTime(group: JSGroupStats, windowStart: number): number {
  if (group.entries.length === 0) return 0
  // Execution can't start before windowStart (e.g., deferred scripts wait for DOM)
  // or before the first script downloads
  const effectiveStart = Math.max(windowStart, group.firstResponseEnd)
  return Math.max(0, group.lastParseEnd - effectiveStart)
}

/**
 * JavaScript entries categorized by when they executed relative to paint milestones.
 */
interface CategorizedBlockingJS {
  /** Scripts that finished executing (parseEnd) before FCP - these actually blocked paint */
  beforeFCP: JSGroupStats
  /** Scripts that executed between FCP and LCP (affects hydration/main content) */
  betweenFCPAndLCP: JSGroupStats
  /** All scripts that executed before LCP */
  all: JSGroupStats
}

/**
 * Categorizes JavaScript by when it executed relative to FCP and LCP.
 *
 * How it works:
 * 1. Builds a Map of parse timing marks for O(1) lookups
 * 2. Single pass through all resource timing entries
 * 3. For each script that executed before LCP:
 *    - Matches it to its parse timing mark (injected by BundleParseTimingPlugin)
 *    - Calculates parse time = mark timestamp - download end
 *    - Categorizes into "before FCP" or "between FCP and LCP"
 *
 * Scripts are categorized based on when they finished EXECUTING (parseEnd),
 * not when they finished downloading. This is important because:
 * - `defer` scripts download early but execute after HTML parsing
 * - A script that downloaded before FCP but executed after didn't block FCP
 * - Using parseEnd accurately identifies scripts that actually blocked paint
 *
 * Note: parseTime includes both parse and compile time. V8 uses lazy parsing,
 * so some parsing may be deferred until function execution.
 */
function categorizeBlockingJS(
  resources: PerformanceResourceTiming[],
  marks: PerformanceEntryList,
  fcpTime: number,
  lcpTime: number,
): CategorizedBlockingJS {
  const marksByName = new Map<string, PerformanceEntry>()
  for (const mark of marks) {
    if (mark.name.startsWith(MARKER_PREFIX)) {
      marksByName.set(mark.name, mark)
    }
  }

  const beforeFCP = createJSGroupStats()
  const betweenFCPAndLCP = createJSGroupStats()
  const all = createJSGroupStats()

  for (const r of resources) {
    if (r.initiatorType !== 'script' || r.name.endsWith('.css.js')) continue

    const filename = getFilename(r.name)
    const parseMark = marksByName.get(`${MARKER_PREFIX}:${filename}`)

    // Skip if no valid parse mark or negative parse time
    if (!parseMark) continue
    const parseTime = parseMark.startTime - r.responseEnd
    if (parseTime <= 0) continue

    // Skip scripts that executed after LCP
    if (parseMark.startTime >= lcpTime) continue

    const entry: PlatformBlockingJSEntry = {
      name: filename,
      downloadTime: r.responseEnd - r.responseStart,
      parseTime,
      transferSize: r.transferSize,
      decodedBodySize: r.decodedBodySize,
      responseEnd: r.responseEnd,
      parseEnd: parseMark.startTime,
    }

    addToJSGroup(all, entry)

    if (parseMark.startTime < fcpTime) {
      addToJSGroup(beforeFCP, entry)
    } else {
      addToJSGroup(betweenFCPAndLCP, entry)
    }
  }

  return {beforeFCP, betweenFCPAndLCP, all}
}

/**
 * Generates a detailed breakdown of LCP timing to identify performance bottlenecks.
 *
 * ## Timeline Overview
 *
 * ```
 * 0 ──────── TTFB ──────── FCP ──────── LCP
 *              │            │            │
 *              ├─ HTML      ├─ JS parse  │
 *              ├─ CSS       ├─ Hydration │
 *              └─ Render    └────────────┘
 * ```
 *
 * ## How to Interpret Results
 *
 * ### Diagnosing TTFB → FCP gap:
 *
 * 1. **Check cssRequestDelay**
 *    - Negative = good! Preload scanner started CSS early
 *    - Positive = HTML parsing was slow, or CSS not discoverable early
 *
 * 2. **Check cssDownloadTime**
 *    - High value = slow CDN, large CSS, or too many CSS files
 *    - Compare with cssOverlapWithHtml to see if parallel loading helped
 *
 * 3. **Check cssParseTime**
 *    - Usually small (<50ms). If large, CSS may be complex or browser is slow
 *    - Note: includes render setup time, not just parsing
 *
 * 4. **Check jsBreakdownBeforeFCP**
 *    - Scripts that actually EXECUTED before FCP (not just downloaded)
 *    - With `defer` scripts, this should be empty
 *    - Any entries here indicate truly render-blocking scripts
 *
 * ### Diagnosing FCP → LCP gap:
 *
 * 1. **Check jsBreakdownBetweenFCPAndLCP**
 *    - Shows scripts that ran during hydration
 *    - Large bundles here delay main content
 *
 * 2. **Compare jsParseWallTime vs jsParseTimeTotal**
 *    - If jsParseTimeTotal >> jsParseWallTime, parallel parsing is working
 *    - If they're similar, scripts may be loading sequentially
 *
 * 3. **Check elementRenderDelay (from web-vitals)**
 *    - Time from resources loaded to LCP element painted
 *    - High value = slow React render, layout thrashing, or late data
 *
 * ### Quick Health Check
 *
 * ✅ Good signs:
 * - cssRequestDelay is negative (preload scanner active)
 * - jsBreakdownBeforeFCP is empty (no JS executed before FCP)
 * - cssOverlapWithHtml > 0 (parallel loading)
 *
 * ⚠️ Warning signs:
 * - jsBreakdownBeforeFCP has entries (JS actually blocked FCP!)
 * - cssParseTime > 100ms (complex CSS or slow device)
 * - jsParseWallTime ≈ jsParseTimeTotal (no parallel parsing)
 */
export function getLCPBreakdown(metric: LCPMetricWithAttribution): PlatformLCPBreakdown | undefined {
  const resources = performance.getEntriesByType('resource')
  const marks = performance.getEntriesByType('mark')
  const nav = performance.getEntriesByType('navigation')[0]

  if (!nav) return

  const paintEntries = performance.getEntriesByType('paint')
  const firstPaint = paintEntries.find(p => p.name === 'first-paint')
  const fcp = paintEntries.find(p => p.name === 'first-contentful-paint')

  const fcpTime = fcp?.startTime ?? metric.value
  const lcpTime = metric.value

  const blockingJS = categorizeBlockingJS(resources, marks, fcpTime, lcpTime)
  const {cssParseTime, cssDownloadTime, blockingCSSWeight} = getBlockingCSS(resources, firstPaint, lcpTime)

  // HTML timing: time to download the HTML document after first byte
  const htmlDownloadTime = nav.responseEnd - nav.responseStart

  // domInteractive: HTML parsing complete (but subresources may still be loading)
  // This includes time spent blocked by synchronous scripts during parsing
  const domInteractive = nav.domInteractive

  // domContentLoaded: HTML parsed + all deferred scripts have executed
  const domContentLoaded = nav.domContentLoadedEventStart

  // Time from HTML download end to DOM interactive (HTML parse + sync script execution)
  const htmlParseTime = domInteractive - nav.responseEnd

  return {
    // Core milestones
    ttfb: metric.attribution.timeToFirstByte,
    fcp: fcp?.startTime,
    elementRenderDelay: metric.attribution.elementRenderDelay,
    // HTML timing
    htmlDownloadTime,
    htmlParseTime,
    htmlSize: nav.decodedBodySize,
    domInteractive,
    domContentLoaded,
    // CSS timing
    cssDownloadTime,
    cssParseTime,
    // JS that blocked first paint
    jsBlockingFcp: blockingJS.beforeFCP.entries,
    // Wall-clock time scripts blocked before FCP (accounts for parallel downloads)
    jsParseTimeFcp: getJSWallTime(blockingJS.beforeFCP, 0),
    // JS that ran between FCP and LCP (hydration)
    jsBlockingLcp: blockingJS.betweenFCPAndLCP.entries,
    // Wall-clock time scripts blocked between FCP and LCP
    jsParseTimeLcp: getJSWallTime(blockingJS.betweenFCPAndLCP, fcpTime),
    // Total JS parse time before LCP
    jsParseTimeTotal: blockingJS.all.parseTimeTotal,
    // General resource metrics from web-vitals
    resourceLoadDelay: metric.attribution.resourceLoadDelay,
    resourceLoadDuration: metric.attribution.resourceLoadDuration,
    // Blocking asset weights (decoded/uncompressed bytes)
    blockingJSWeight: blockingJS.beforeFCP.decodedBodySizeTotal,
    blockingCSSWeight,
  }
}

function getFilename(url: string): string {
  try {
    return new URL(url, window.location.origin).pathname.split('/').pop() || url
  } catch {
    return url
  }
}
