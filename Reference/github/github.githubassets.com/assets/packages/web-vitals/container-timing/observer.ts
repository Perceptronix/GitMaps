import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {ssrSafeDocument, ssrSafeWindow} from '@github-ui/ssr-utils'
import {sendCustomMetric} from '@github-ui/stats'
import {getCPUBucket} from '@github-ui/cpu-bucket'
import {getSelector} from '../get-selector'
import {sendContainerTimingToHydro} from '../hydro-stats'
import {shouldReportContainerTiming} from '../utils/suppression'
import {InteractionGate} from '../utils/interaction-gate'
import {recordDevtoolsTrackEntry} from '../utils/devtools-track-entry'
import {getReportContext} from '../utils/report-context'
import {softNavSession} from '../utils/soft-nav-session'
import {getDomNodes, getDomNodesBucket} from '../dom-nodes'

/**
 * Mirror of HPC's `INSERTION_TIMEOUT`. Container Timing has no
 * native fallback when a container never emits a terminal paint
 * (e.g. a quiet page that paints once and idles), so we keep the
 * last seen intermediate and emit it as `emulated: true` after this
 * window of no further activity. Matches HPC's "fire the last seen
 * mutation after 10s of quiet" semantic so HPC and Container Timing
 * cover the same set of pageviews.
 */
const EMULATED_TIMEOUT = 10_000

/**
 * Feature-detect the Container Timing API. The API is currently
 * experimental (origin trial / chrome://flags), so this evaluates
 * to `false` on all stable browsers today. When the API is not
 * supported we never observe — there is no fallback metric. HPC
 * remains the source of truth.
 *
 * Detection prefers `PerformanceObserver.supportedEntryTypes` because
 * registering an observer for an unsupported `type` throws synchronously,
 * which would otherwise break setupWebVitals on browsers without the flag.
 */
function isContainerTimingSupported(): boolean {
  if (!ssrSafeWindow || typeof PerformanceObserver === 'undefined') return false
  const supported = PerformanceObserver.supportedEntryTypes
  return Array.isArray(supported) && supported.includes('container')
}

/**
 * ContainerTimingObserver mirrors `ElementTimingObserver`: it subscribes
 * to the Container Timing API and forwards entries to Datadog as a custom
 * distribution metric.
 *
 * We intentionally use a custom metric (rather than extending
 * `PlatformBrowserPerformanceWebVitalTiming`) because:
 *  - Container Timing is a trial; we don't want to bake schema changes
 *    into the backend before the API stabilizes.
 *  - Tags let us compare `hpc` ↔ `container_timing` for the same surface
 *    in Datadog without adding bespoke fields to the vitals payload.
 *
 * The constructor is side-effect-free aside from soft-nav listener
 * registration so it can be instantiated unconditionally in setup
 * even when the underlying API is missing.
 */
export class ContainerTimingObserver {
  observer?: PerformanceObserver
  url?: string

  /**
   * Cached at construction time. The API is gated by a browser flag
   * that never flips mid-session, so re-detecting on every observe()
   * would be wasted work. It also lets call sites invoke `observe()`
   * unconditionally.
   */
  readonly supported: boolean

  /**
   * Soft-nav origin for reported values. Reads from the shared
   * `softNavSession` so HPC and Container Timing subtract the same
   * value. `0` on hard load; `performance.now()` snapshot at
   * SOFT_NAV_STATE.START.
   */
  get softNavStart(): number {
    return softNavSession.navStart
  }

  /**
   * Soft-nav flag, sourced from the shared session so HPC and Container
   * Timing agree on whether the current navigation is soft.
   */
  get soft(): boolean {
    return softNavSession.soft
  }

  /**
   * Navigation mechanism, sourced from the shared session. Updates
   * automatically when SOFT_NAV_STATE.REPLACE_MECHANISM fires (e.g.
   * turbo upgrade to a full React route change).
   */
  get mechanism() {
    return softNavSession.mechanism
  }

  /** Interaction + visibility gate. Paints after the first interaction or
   *  while the tab is hidden are dropped in `report()`. */
  interactionGate?: InteractionGate

  /** Cached once per `observe()` call — constant for a session/CPU. */
  cpuBucket: string = ''

  /**
   * Most recent intermediate (`final: false`) paint. Held so the
   * emulated-timeout path can emit it if no terminal paint arrives
   * within `EMULATED_TIMEOUT`. Mirrors HPC's "last seen DOM insertion"
   * fallback.
   */
  lastIntermediate?: PerformanceContainerTiming

  /** Active emulated-timeout handle; cleared when a terminal entry arrives. */
  emulatedTimer?: ReturnType<typeof setTimeout>

  /** Tracks whether a real (non-emulated) terminal entry has been reported. */
  reportedTerminal = false

  constructor() {
    this.supported = isContainerTimingSupported()
    // Wires the soft-nav listeners on first observer construction so that
    // importing this module is side-effect-free.
    softNavSession.ensure()
    this.#setupSoftNavListeners()
  }

  // `interacted` and `tabHidden` are read by `#reportInner` and by tests.
  // The state itself lives on `interactionGate` so visibility/interaction
  // wiring isn't duplicated with HPC; these getters just expose it.
  get interacted(): boolean {
    return this.interactionGate?.interacted ?? false
  }
  get tabHidden(): boolean {
    return this.interactionGate?.tabHidden ?? false
  }

  #setupSoftNavListeners() {
    if (!this.supported) return

    // `soft`, `mechanism`, and `softNavStart` are owned by `softNavSession`,
    // which registers its own START / REPLACE_MECHANISM listeners. RENDER
    // resets per-nav observer state (gates, intermediate, emulated timer,
    // URL) but keeps the underlying `PerformanceObserver` alive so records
    // the browser had queued for the just-finished nav aren't dropped on
    // teardown (`takeRecords()` was previously discarded).
    ssrSafeDocument?.addEventListener(SOFT_NAV_STATE.RENDER, () => {
      this.reset()
    })
  }

  /**
   * Initialise (or re-initialise) per-nav observer state: URL snapshot,
   * intermediate tracking, interaction/visibility gate, emulated timer.
   * Does NOT touch `this.observer` so the same `PerformanceObserver` keeps
   * delivering entries across soft navs.
   */
  #resetNavState() {
    this.url = ssrSafeWindow?.location.href
    this.lastIntermediate = undefined
    this.reportedTerminal = false
    // Cache once — the CPU bucket is constant for the session and Datadog
    // tag values don't change mid-pageview.
    this.cpuBucket = getCPUBucket()
    // Replace the prior gate (if any) so each observation window starts
    // with a fresh `interacted`/`tabHidden` state.
    this.interactionGate?.teardown()
    this.interactionGate = new InteractionGate()
    // The emulated-timeout timer is armed lazily on the first intermediate
    // entry (see `#reportInner`) so we don't schedule a stray timer for
    // windows that never see one.
    this.#clearEmulatedTimer()
  }

  observe(initialLoad = true) {
    if (!this.supported) return

    // `soft`, `mechanism`, and `softNavStart` come from `softNavSession`,
    // which manages reset semantics itself (a hard load implicitly has
    // session defaults; soft navs are driven by SOFT_NAV_STATE.START).
    this.#resetNavState()

    try {
      this.observer = new PerformanceObserver(list => {
        // Cast through unknown: lib.dom doesn't yet declare 'container'
        // entries. The shape is documented in
        // app/assets/types/container-timing.d.ts.
        const entries = list.getEntries() as unknown as PerformanceContainerTiming[]
        for (const entry of entries) {
          this.report(entry)
        }
      })

      this.observer.observe({
        type: 'container',
        // Buffered entries cover the gap between page load and observer
        // setup, matching ElementTiming on initial load.
        buffered: initialLoad,
      })

      // Track API availability once per session-with-support so we can
      // estimate the trial's coverage in Datadog. Only emit on the first
      // observe() call (initialLoad) to avoid double-counting across
      // soft navigations.
      if (initialLoad) {
        sendCustomMetric({name: 'BROWSER_VITALS_CONTAINER_TIMING_SUPPORTED', value: 1})
      }
    } catch {
      // Defensive: even with feature detection, some UAs may throw
      // for `type: 'container'` if the flag is partially enabled.
      this.observer = undefined
    }
  }

  report(entry: PerformanceContainerTiming) {
    // Wrap the whole pipeline. Container Timing is an origin trial and
    // entry shape can shift between Chrome versions; an exception here
    // would otherwise break every subsequent entry on this pageview
    // because `PerformanceObserver` callbacks don't unwind per-entry.
    try {
      this.#reportInner(entry)
    } catch {
      // Swallow. Visibility into "this used to report and now doesn't"
      // comes from the Datadog metric volume dropping, which is enough
      // signal for a trial-stage metric. Avoid adding a counter here
      // because emitting from inside an error path can recurse.
    }
  }

  #reportInner(entry: PerformanceContainerTiming) {
    // Visibility/interaction gates run first so a paint that arrives after
    // the first interaction (or while the tab is hidden) is tagged with the
    // accurate `dropReason` instead of the more generic `intermediate_paint`,
    // and so post-gate intermediates don't keep re-arming the emulated timer.
    if (this.interacted) {
      this.#clearEmulatedTimer()
      this.#dispatchDropped(entry, 'interacted')
      return
    }

    // Drop entries from backgrounded tabs. Mirrors HPC's `tabHidden`.
    // Route through `shouldReportContainerTiming` so the `page_hidden`
    // suppression counter actually fires — otherwise the
    // `BROWSER_VITALS_SUPPRESSED` reason is dead code.
    if (this.tabHidden) {
      this.#clearEmulatedTimer()
      shouldReportContainerTiming(0, 'page_hidden')
      this.#dispatchDropped(entry, 'tab_hidden')
      return
    }

    // Intermediate paints don't reach the metric, but they DO arm the
    // emulated-timeout fallback. HPC fires its emulated event 10s after
    // the last DOM insertion; we do the same with the last seen
    // intermediate paint, so quiet pages without a terminal entry still
    // produce a comparable Container Timing value instead of silently
    // dropping out of the cohort.
    if (entry.final === false) {
      this.lastIntermediate = entry
      this.#armEmulatedTimer()
      this.#dispatchDropped(entry, 'intermediate_paint')
      return
    }

    // Terminal paint: cancel the fallback and emit normally.
    this.#clearEmulatedTimer()
    this.reportedTerminal = true
    this.#emitReport(entry, false)
  }

  /**
   * Emit a Container Timing entry to Datadog + Hydro + devtools + the
   * `web-vitals:container-timing` DOM event. Shared between the regular
   * terminal-paint path and the emulated-timeout fallback so the schema
   * stays identical; the only difference is the `emulated` tag/flag.
   */
  #emitReport(entry: PerformanceContainerTiming, emulated: boolean) {
    // Strict: `firstRenderTime` is the timestamp of the first sub-element
    // paint, which is what we want to compare against HPC. Older code fell
    // back to `entry.startTime`, but on terminal Container Timing entries
    // `startTime` is the entry-queued timestamp — effectively `lastPaintTime`
    // — so the fallback silently reported the *last* paint and inflated the
    // metric for any UA that didn't expose `firstRenderTime`. Drop the entry
    // with an explicit reason instead, and emit a Datadog suppression counter
    // so we can see drop-rate next to the metric in the same series.
    const rawTime = entry.firstRenderTime
    if (!Number.isFinite(rawTime) || rawTime <= 0) {
      shouldReportContainerTiming(0, 'missing_first_render_time')
      this.#dispatchDropped(entry, 'missing_first_render_time')
      return
    }
    const value = rawTime - this.softNavStart
    // Same ceiling and suppression telemetry as HPC's `shouldReportWebVital`.
    if (!shouldReportContainerTiming(value, 'value_exceeded')) {
      this.#dispatchDropped(entry, 'value_exceeded', value)
      return
    }

    // Refresh + snapshot the per-report metadata bundle before any
    // further work: entries can arrive between SOFT_NAV_STATE.START and
    // RENDER, and `getReportContext` re-reads the current `<react-app>`
    // so the report carries the correct app on slow soft navs.
    const ctx = getReportContext()

    const identifier = entry.identifier || 'unknown'
    const elementSelector = getSelector(entry.element)
    const lastPaintedSubElementSelector = getSelector(entry.lastPaintedSubElement)
    // Emulated entries are technically intermediate (`final: false`) but
    // we treat them as terminal for reporting since no further paint is
    // expected within the navigation.
    const final = emulated ? true : (entry.final ?? true)
    const lastPaintTime = entry.lastPaintTime ?? rawTime
    // Stabilisation delta between the first and last sub-element paint
    // within the container. Bucketed so Datadog dashboards can split the
    // HPC↔CT gap into "first paint is later" vs "container kept painting"
    // without needing a separate metric. Sent on both reported and
    // dropped paths so terminal-vs-emulated comparison stays apples-to-apples.
    const paintSpread = Math.max(0, lastPaintTime - rawTime)
    const paintSpreadBucket = getPaintSpreadBucket(paintSpread)
    const domNodeCounts = getDomNodes()
    const domNodesBucket = domNodeCounts.current !== undefined ? getDomNodesBucket(domNodeCounts.current) : undefined
    const previousDomNodesBucket =
      domNodeCounts.previous !== undefined ? getDomNodesBucket(domNodeCounts.previous) : undefined

    const ddTags: Record<string, string | number> = {
      // Convention: the `containertiming` attribute value is set to
      // `"hpc"` for elements that are the page's primary content
      // container — these are the entries we compare against the HPC
      // metric. Distinct identifiers are reserved for future
      // non-HPC containers (e.g., sidebars or metadata panels that
      // paint independently).
      identifier,
      size: entry.size ?? 0,
      cpu: this.cpuBucket,
      soft: String(this.soft),
      mechanism: this.mechanism,
      app: ctx.app,
      ssr: String(ctx.ssr),
      lazy: String(ctx.lazy),
      alternate: String(ctx.alternate),
      gqlFetched: String(ctx.gqlFetched),
      jsFetched: String(ctx.jsFetched),
      emulated: String(emulated),
    }
    if (paintSpreadBucket) ddTags.paintSpreadBucket = paintSpreadBucket
    if (domNodesBucket) ddTags.domNodesBucket = domNodesBucket
    if (previousDomNodesBucket) ddTags.previousDomNodesBucket = previousDomNodesBucket

    sendCustomMetric({
      name: 'BROWSER_VITALS_DIST_CONTAINER_TIMING',
      value,
      tags: ddTags,
      requestUrl: this.url,
    })

    // Hydro emits one event per pageview, batched alongside HPC and the
    // standard web vitals. Sending Container Timing through the same
    // batch means Kusto sees both metrics on the same row, and the diff
    // `containerTiming.value - hpc.value` is a row-wise subtraction.
    sendContainerTimingToHydro(
      {
        name: 'ContainerTiming',
        value,
        identifier,
        element: elementSelector,
        lastPaintedSubElement: lastPaintedSubElementSelector,
        size: entry.size ?? 0,
        soft: this.soft,
        final,
        firstRenderTime: entry.firstRenderTime,
        lastPaintTime,
        mechanism: this.mechanism,
        ...ctx,
        domNodes: domNodeCounts.current,
        previousDomNodes: domNodeCounts.previous,
        emulated,
      },
      ctx.ssr,
    )

    // Mirror HPC's devtools track entry so Container Timing is visible in
    // the Performance panel alongside HPC for visual comparison.
    // Use the raw (page-load-relative) timestamp for the devtools end
    // marker so it lines up with the actual paint in the timeline.
    recordDevtoolsTrackEntry({
      name: emulated ? 'ContainerTiming (emulated)' : 'ContainerTiming',
      track: 'ContainerTiming',
      color: 'tertiary-dark',
      tooltipText: `ContainerTiming${emulated ? ' (emulated)' : ''} (${identifier})`,
      end: rawTime,
    })

    // Expose a DOM event so feature owners can subscribe with
    // useWebVitals-style hooks. The event surfaces the selector for the
    // container element to aid in attribution debugging.
    ssrSafeDocument?.dispatchEvent(
      new CustomEvent('web-vitals:container-timing', {
        detail: {
          identifier: entry.identifier,
          value,
          target: elementSelector,
          lastPaintedSubElement: lastPaintedSubElementSelector,
          final,
          size: entry.size ?? 0,
          dropReason: null,
          emulated,
        },
      }),
    )
  }

  /**
   * Arm (or reset) the emulated-timeout fallback. Called on every
   * intermediate paint so the timer always counts from the most recent
   * activity, matching HPC's "10s after the last DOM insertion" model.
   */
  #armEmulatedTimer() {
    this.#clearEmulatedTimer()
    this.emulatedTimer = setTimeout(() => {
      this.emulatedTimer = undefined
      if (this.reportedTerminal || this.tabHidden || this.interacted) return
      if (!this.lastIntermediate) return
      this.#emitReport(this.lastIntermediate, true)
    }, EMULATED_TIMEOUT)
  }

  #clearEmulatedTimer() {
    if (this.emulatedTimer !== undefined) {
      clearTimeout(this.emulatedTimer)
      this.emulatedTimer = undefined
    }
  }

  /**
   * Emit a `web-vitals:container-timing` event with `dropReason` set,
   * giving local debuggers and the staff bar a way to see why an entry
   * didn't make it to Datadog/Hydro. The event is the only path: we
   * deliberately don't add a Datadog counter for every drop because the
   * volume of intermediate-paint drops alone would dwarf the actual
   * metric.
   */
  #dispatchDropped(entry: PerformanceContainerTiming, dropReason: ContainerTimingDropReason, value?: number) {
    // Normalize dropped-event `value` to the same soft-nav-adjusted basis
    // the report path uses, so consumers (staff bar, local debug tooling)
    // see a consistent value across dropped vs reported events on soft navs.
    const rawTime = entry.firstRenderTime ?? entry.startTime
    const adjustedValue = value ?? rawTime - this.softNavStart
    ssrSafeDocument?.dispatchEvent(
      new CustomEvent('web-vitals:container-timing', {
        detail: {
          identifier: entry.identifier,
          value: adjustedValue,
          target: getSelector(entry.element),
          lastPaintedSubElement: getSelector(entry.lastPaintedSubElement),
          final: entry.final ?? true,
          size: entry.size ?? 0,
          dropReason,
        },
      }),
    )
  }

  teardown() {
    // Flush any buffered entries through the normal report pipeline before
    // disconnecting so a terminal paint that the browser queued but hadn't
    // yet delivered isn't silently dropped on page unload. Previously the
    // result of `takeRecords()` was thrown away.
    //
    // Intermediates are skipped: their only role is to arm the emulated
    // fallback timer, which we're about to clear. Replaying them would arm
    // a stray setTimeout that the trailing `#clearEmulatedTimer()` then
    // immediately cancels — correct, but ordering-dependent. Skipping makes
    // the teardown sequence independent of the order of these steps.
    const pending = this.observer?.takeRecords() as unknown as PerformanceContainerTiming[] | undefined
    if (pending) {
      for (const entry of pending) {
        if (entry.final === false) continue
        this.report(entry)
      }
    }
    this.observer?.disconnect()
    this.observer = undefined
    this.interactionGate?.teardown()
    this.interactionGate = undefined
    this.#clearEmulatedTimer()
  }

  /**
   * Soft-nav reset. Clears per-nav state (gates, intermediate tracking,
   * emulated timer, URL) but keeps the underlying `PerformanceObserver`
   * alive so records the browser had queued for the previous nav are
   * still delivered. Stale entries (`firstRenderTime` before the new
   * `softNavStart`) will yield a negative value and be suppressed by
   * `shouldReportContainerTiming`, which is the correct outcome.
   */
  reset() {
    this.#resetNavState()
  }
}

export type ContainerTimingDropReason =
  | 'intermediate_paint'
  | 'interacted'
  | 'tab_hidden'
  | 'value_exceeded'
  | 'missing_first_render_time'

/**
 * Low-cardinality bucket labels for the gap between the container's first
 * and last sub-element paint. Matches the dom-nodes-bucket style so all
 * web-vitals bucket tags share a shape Datadog dashboards can render the
 * same way. Ordered highest-to-lowest; first match wins.
 */
const PAINT_SPREAD_BUCKETS: ReadonlyArray<readonly [label: string, minMs: number]> = [
  ['5001+', 5000],
  ['2001 - 5000', 2000],
  ['1001 - 2000', 1000],
  ['501 - 1000', 500],
  ['251 - 500', 250],
  ['101 - 250', 100],
  ['51 - 100', 50],
  ['17 - 50', 16],
  ['1 - 16', 0],
]

export function getPaintSpreadBucket(spreadMs: number): string | undefined {
  if (!Number.isFinite(spreadMs) || spreadMs < 0) return undefined
  if (spreadMs === 0) return '0'
  for (const [label, min] of PAINT_SPREAD_BUCKETS) {
    if (spreadMs > min) return label
  }
  return undefined
}
