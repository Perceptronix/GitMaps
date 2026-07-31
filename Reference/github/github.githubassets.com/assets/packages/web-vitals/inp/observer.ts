import {ssrSafeDocument, ssrSafeWindow} from '@github-ui/ssr-utils'
import type {INPMetric} from './metric'
import {InteractionProcessor, type CallbackRegistration} from './interaction-processor'
import {BaseObserver, type ReportOptions} from '../base/observer'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {whenIdleOrHidden} from '../utils/when-idle-or-hidden'

const supportsINP =
  // eslint-disable-next-line compat/compat
  ssrSafeWindow && 'PerformanceEventTiming' in ssrSafeWindow && 'interactionId' in PerformanceEventTiming.prototype

/*
 * The INPObserver is responsible for listening to Performance events and routing them to the InteractionProcessor.
 * It also manages resetting INP and reporting it when navigating or hiding a page.
 */
export class INPObserver extends BaseObserver<INPMetric, PerformanceEventTiming> {
  /** Set when a hard navigation is initiated (beforeunload). Distinguishes hard-nav departure from tab switch. */
  hardNavPending = false

  /**
   * Timestamp (via performance.now()) recorded at each reset() — i.e. when a
   * soft navigation starts. Entries whose startTime predates this value belong
   * to the previous page and are discarded, preventing the nav-triggering
   * click (or any other stale interaction) from inflating the new page's INP.
   *
   * Initialized to 0 so that all entries pass through on the initial page load.
   */
  #resetTimestamp = 0

  get softNavEventToListen() {
    return SOFT_NAV_STATE.START
  }

  initializeProcessor() {
    return new InteractionProcessor()
  }

  override get supported(): boolean {
    return !!supportsINP
  }

  override setupListeners() {
    super.setupListeners()

    // Track when the page is actually being destroyed (hard navigation or tab close).
    // beforeunload fires for hard navigations and tab/window close, but NOT for
    // tab switches — letting report() distinguish the two and only skip
    // takeRecords() when the entries would have unreliable durations.
    ssrSafeWindow?.addEventListener('beforeunload', () => {
      this.hardNavPending = true
    })
  }

  observe(initialLoad = true) {
    if (!supportsINP) return

    this.observer = new PerformanceObserver(list => {
      whenIdleOrHidden(() => {
        // Discard entries whose interaction started before the most recent
        // soft-nav reset. This covers two contamination paths:
        //
        // 1. The nav-triggering click is finalized after paint and delivered
        //    to the NEW observer created during reset().
        //
        // 2. A deferred callback from the OLD observer fires after reset.
        //
        // In both cases the entry's startTime predates #resetTimestamp.
        const entries = (list.getEntries() as PerformanceEventTiming[]).filter(e => e.startTime >= this.#resetTimestamp)
        if (entries.length) {
          this.entryProcessor.processEntries(entries)
        }
      })
    })

    if (initialLoad) {
      this.url = ssrSafeWindow?.location.href
      return this.observeEvents(initialLoad)
    }

    // SOFT_NAV_STATE.RENDER is dispatched when the soft navigation finished rendering.
    // That means that the previous page is fully hidden so we can start listening for new events.
    //
    // URL is captured here — not at soft-nav:start — because pushState hasn't
    // updated the URL yet at START time. Without this, interactions on the new
    // page are attributed to the old page's URL, which causes cross-page INP
    // contamination (especially visible with hot cache where transitions are fast).
    ssrSafeDocument?.addEventListener(
      SOFT_NAV_STATE.RENDER,
      () => {
        this.url = ssrSafeWindow?.location.href
        this.observeEvents(initialLoad)
      },
      {once: true},
    )
  }

  observeEvents(initialLoad: boolean) {
    if (!this.observer) return

    this.observer.observe({type: 'first-input', buffered: initialLoad})
    this.observer.observe({
      type: 'event',
      durationThreshold: 40,
      // buffered events are important on first page load since we may have missed
      // a few until the observer was set up.
      buffered: initialLoad,
    })
  }

  registerCallback(callback: CallbackRegistration) {
    this.interactionProcessor.registeredCallbacks.add(callback)
  }

  override report(options?: ReportOptions) {
    // Skip takeRecords() only during actual departure from the current page.
    //
    // When a hard navigation is triggered (e.g. clicking an UnderlineNav tab
    // to another page), the browser fires visibilitychange before the page is
    // destroyed. takeRecords() at that point forces the browser to flush the
    // PerformanceEventTiming for the navigation click, but its duration is
    // unreliable — the "next paint" never arrives on this page, so the timing
    // reflects teardown overhead rather than genuine page responsiveness.
    //
    // We must NOT skip takeRecords() on tab switches (visibilitychange without
    // navigation), because those entries are valid in-page interactions that
    // may not have been delivered to the PerformanceObserver callback yet.
    // The hardNavPending flag (set via beforeunload) distinguishes most cases.
    // Safari may fire pagehide without beforeunload, so pagehide is treated as
    // departure even if hardNavPending is false.
    //
    // During soft-nav:start, takeRecords() is always called (isPageHide=false)
    // to capture the last in-page interaction before resetting.
    const isPageDeparture = options?.source === 'pagehide' || (options?.isPageHide && this.hardNavPending)

    if (!isPageDeparture) {
      const entries = this.observer?.takeRecords()

      if (entries && entries.length) {
        this.entryProcessor.processEntries(entries as PerformanceEventTiming[])
      }
    }

    super.report(options)
  }

  override reset() {
    this.#resetTimestamp = performance.now()
    super.reset()
  }

  get interactionProcessor(): InteractionProcessor {
    return this.entryProcessor as InteractionProcessor
  }
}
