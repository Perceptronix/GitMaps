import {ssrSafeDocument, ssrSafeWindow} from '@github-ui/ssr-utils'
import type {CLSMetric} from './metric'
import {LayoutShiftProcessor} from './layout-shift-processor'
import {BaseObserver} from '../base/observer'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {onFCP} from 'web-vitals/attribution'

const supportsCLS = ssrSafeWindow && 'LayoutShift' in ssrSafeWindow

/*
 * The CLSObserver is responsible for listening to Performance events and routing them to the entryProcessor.
 * It also manages resetting CLS and reporting it when navigating or hiding a page.
 *
 * CLS observation is gated on FCP to match CrUX behavior — layout shifts before
 * first contentful paint are not counted.
 */
export class CLSObserver extends BaseObserver<CLSMetric, LayoutShift> {
  // Scopes the pending soft-nav RENDER listener (and its queued animation
  // frame). Aborted whenever a new soft navigation starts so that listeners
  // and observers cannot accumulate across a soft nav that never renders
  // (e.g. a failed soft nav dispatches ERROR, not RENDER).
  private softNavRenderController?: AbortController

  get softNavEventToListen() {
    return SOFT_NAV_STATE.START
  }

  initializeProcessor() {
    return new LayoutShiftProcessor()
  }

  override get supported(): boolean {
    return !!supportsCLS
  }

  observe(initialLoad = true) {
    if (initialLoad) {
      this.url = ssrSafeWindow?.location.href

      // Gate on FCP to match CrUX: only count layout shifts after first contentful paint
      let started = false
      onFCP(() => {
        if (started) return
        started = true
        this.startObserving(true)
      })
      return
    }

    // Soft navigation: defer CLS observation until the destination page has
    // rendered so that layout shifts caused by the navigation teardown /
    // transition are not attributed to the destination page.
    //
    //   1. Wait for SOFT_NAV_STATE.RENDER (pushState has updated the URL).
    //   2. Capture the destination URL for attribution.
    //   3. Wait for the next paint (requestAnimationFrame) so we are past the
    //      render boundary.
    //   4. Start the layout-shift observer with buffered: false so we don't
    //      pick up shifts that were queued during the transition.
    //
    // Abort any RENDER listener / queued frame left over from a previous soft
    // nav that never rendered (e.g. a failed soft nav). Without this, {once:
    // true} listeners would accumulate and each fire a startObserving() on the
    // next RENDER, creating concurrent PerformanceObservers that double-count
    // CLS and leak.
    this.softNavRenderController?.abort()
    const controller = new AbortController()
    this.softNavRenderController = controller
    const {signal} = controller

    ssrSafeDocument?.addEventListener(
      SOFT_NAV_STATE.RENDER,
      () => {
        this.url = ssrSafeWindow?.location.href

        if (typeof ssrSafeWindow?.requestAnimationFrame === 'function') {
          ssrSafeWindow.requestAnimationFrame(() => {
            // A newer soft nav may have started between RENDER and this frame.
            if (signal.aborted) return
            this.startObserving(false)
          })
        } else {
          // Fallback for non-browser/test environments without rAF.
          this.startObserving(false)
        }
      },
      {once: true, signal},
    )
  }

  startObserving(buffered: boolean) {
    // Guarantee a single active observer: disconnect any existing one before
    // creating a replacement so entries are never processed twice.
    this.observer?.disconnect()

    this.observer = new PerformanceObserver(list => {
      // Microtask delay to work around a Safari bug where the callback
      // is invoked immediately rather than in a separate task.
      // Matches web-vitals v5's observe() implementation.
      const entries = list.getEntries() as LayoutShift[]
      queueMicrotask(() => {
        this.entryProcessor.processEntries(entries)
      })
    })

    this.observer.observe({type: 'layout-shift', buffered})
  }
}
