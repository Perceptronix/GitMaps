import {onLCP} from 'web-vitals/attribution'
import type {SoftNavMechanism} from '@github-ui/soft-nav/events'
import {HPCDomInsertionEvent, HPCTimingEvent, type HPCEventTarget, type HPCTimingData} from './hpc-events'
import {getSoftNavFailOverhead, hasSoftNavFailure} from '@github-ui/soft-nav/utils'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {getSelector} from './get-selector'
import {InteractionGate} from './utils/interaction-gate'
import {recordDevtoolsTrackEntry} from './utils/devtools-track-entry'
import {getReportContext} from './utils/report-context'
import {softNavSession} from './utils/soft-nav-session'

const INSERTION_TIMEOUT = 10000
const ELEMENTS_TO_IGNORE = ['meta', 'script', 'link']

function isVisible(element: HTMLElement) {
  // github/browser-support polyfills element#checkVisibility, which checks for visibility based on the CSSOM spec.
  return element.checkVisibility()
}

type CallbackFunction = (metric: HPCTimingData) => void

interface HPCObserverAttributes {
  latestHPCElement: Element | null
  callback: CallbackFunction
}

export class HPCObserver {
  abortController = new AbortController()
  insertionFound = false
  hpcElement: Element | null = null

  latestHPCElement: Element | null
  /**
   * HPC-specific mechanism override. Captured at construction time when
   * `hasSoftNavFailure()` is true so a soft-nav-failure session keeps
   * tagging as `'turbo.error'` even if `softNavSession.mechanism` is
   * later replaced. Reads of `mechanism` prefer this override.
   */
  mechanismOverride?: SoftNavMechanism | 'hard'
  hpcTarget: HPCEventTarget = new EventTarget() as HPCEventTarget
  animationFrame?: number
  dataHPCanimationFrame?: number
  emulatedHPCTimer?: ReturnType<typeof setTimeout>
  overhead: number = 0
  /** Interaction + visibility gate. Tear-down triggers `stop()` so a
   *  post-interaction or backgrounded session stops emitting HPC. */
  interactionGate?: InteractionGate
  hpcDOMInsertionObserver: MutationObserver | null = null
  ssrPaintObserver: PerformanceObserver | null = null
  callback: CallbackFunction

  constructor({latestHPCElement, callback}: HPCObserverAttributes) {
    // Wires the soft-nav listeners on first observer construction so that
    // importing this module is side-effect-free.
    softNavSession.ensure()

    if (hasSoftNavFailure()) {
      this.mechanismOverride = 'turbo.error'
      this.overhead = getSoftNavFailOverhead() ?? 0
    }

    this.latestHPCElement = latestHPCElement
    this.callback = callback
  }

  /**
   * Soft-nav status comes from the shared session so HPC and Container
   * Timing agree on whether the current navigation is soft.
   */
  get soft(): boolean {
    return softNavSession.soft
  }

  /**
   * Navigation origin in `performance.now()` space. `0` on hard load,
   * `performance.now()` snapshot at SOFT_NAV_STATE.START. Reads from the
   * shared session so HPC and Container Timing subtract the same origin.
   */
  get hpcStart(): number {
    return softNavSession.navStart
  }

  /**
   * Effective mechanism for emitted HPC events. Prefers the local
   * `turbo.error` override (captured at construction when
   * `hasSoftNavFailure()` flagged the session) so that a degraded
   * soft nav keeps reporting `turbo.error` even if downstream
   * REPLACE_MECHANISM events upgrade the session mechanism.
   */
  get mechanism(): SoftNavMechanism | 'hard' {
    return this.mechanismOverride ?? softNavSession.mechanism
  }

  /** `tabHidden` is consulted by `onHPCTiming` to drop timings from
   *  backgrounded sessions. Delegates to the gate so all visibility
   *  state lives in one place. */
  get tabHidden(): boolean {
    return this.interactionGate?.tabHidden ?? false
  }

  connect() {
    if (!this.soft) {
      // In a hard-load, if the script is evaluated after the `data-hpc` element is rendered,
      // find the earliest paint time for content within data-hpc.
      const hpcElement = document.querySelector('[data-hpc]')
      if (hpcElement) {
        this.hpcElement = hpcElement
        this.#findSSRPaintTime(hpcElement)
        return
      }

      // if the element is not in the page yet, listen for mutations.
      setTimeout(() => {
        // if no mutations happen after INSERTION_TIMEOUT, default to LCP again
        if (!this.insertionFound) this.setLCPasHPC(this.soft, false, this.callback)
      }, INSERTION_TIMEOUT)
    }

    this.#setupListeners()
    this.hpcDOMInsertionObserver = this.#buildMutationObserver()
    this.hpcDOMInsertionObserver.observe(document, {childList: true, subtree: true})
  }

  disconnect() {
    this.ssrPaintObserver?.disconnect()
    this.ssrPaintObserver = null
    this.#cleanupListeners()
    this.hpcDOMInsertionObserver?.disconnect()
  }

  // Observer to listen to ALL mutations to the DOM. We need to check all added nodes
  // for the `data-hpc` attribue. If none are found, we keep listening until all mutations are done.
  #buildMutationObserver() {
    return new MutationObserver(mutations => {
      let hasDataHPC = false
      let hpcElement: Element | null = null

      const validMutations = mutations.filter(
        mutation => mutation.type === 'childList' && mutation.addedNodes.length > 0,
      )

      // if the mutation didn't add any nodes, we don't track its HPC
      if (validMutations.length === 0) return

      const addedNodes = validMutations
        .flatMap(mutation => Array.from(mutation.addedNodes))
        .filter(node => node instanceof Element && !ELEMENTS_TO_IGNORE.includes(node.tagName.toLowerCase()))

      if (addedNodes.length === 0) return

      for (const node of addedNodes) {
        const el = node as Element
        hpcElement = el.hasAttribute('data-hpc') ? el : el.querySelector('[data-hpc]')
        if (hpcElement) {
          this.hpcElement = hpcElement
          if (this.animationFrame) cancelAnimationFrame(this.animationFrame)
          hasDataHPC = true
          break
        }
      }

      if (hasDataHPC && hpcElement) {
        this.#reportHPC(hpcElement)
        return
      }

      // Pre-filter to only HTMLElement nodes for visibility checking
      const candidateElements = addedNodes.filter((node): node is HTMLElement => node instanceof HTMLElement)
      if (candidateElements.length === 0) return

      // Defer visibility check to rAF to avoid forced reflow inside MutationObserver
      if (this.animationFrame) cancelAnimationFrame(this.animationFrame)
      this.animationFrame = requestAnimationFrame(() => {
        for (const el of candidateElements) {
          if (isVisible(el)) {
            this.hpcTarget.dispatchEvent(new HPCDomInsertionEvent(el))
            return
          }
        }
      })
    })
  }

  #reportHPC(element: Element) {
    // Refresh + snapshot report metadata before any further work: a
    // report can fire between SOFT_NAV_STATE.START and RENDER, and
    // `getReportContext` re-reads the current `<react-app>` so the
    // event carries the correct app on slow soft navs.
    const ctx = getReportContext()
    recordDevtoolsTrackEntry({
      name: 'HPC',
      track: 'HPC',
      color: 'primary-dark',
      tooltipText: 'HPC (DOM insertion)',
    })
    // data-hpc found, we can stop listening to mutations.
    this.hpcDOMInsertionObserver?.disconnect()
    // only cancel the animation frame if the controller aborts.
    const timingEvent = new HPCTimingEvent(
      this.soft,
      ctx.ssr,
      ctx.lazy,
      ctx.alternate,
      this.mechanism,
      true,
      ctx.gqlFetched,
      ctx.jsFetched,
      ctx.app,
      this.hpcStart,
      element,
      this.overhead,
    )

    this.dataHPCanimationFrame = requestAnimationFrame(() => {
      this.hpcTarget.dispatchEvent(timingEvent)
    })
  }

  #cleanupListeners() {
    this.interactionGate?.teardown()
    this.interactionGate = undefined
    document.removeEventListener(SOFT_NAV_STATE.RENDER, this.onSoftNavRender)

    this.hpcTarget.removeEventListener('hpc:dom-insertion', this.onDOMInsertion)
    this.hpcTarget.removeEventListener('hpc:timing', this.onHPCTiming)

    this.abortController.signal.removeEventListener('abort', this.onAbort)
  }

  #setupListeners() {
    // Stop listening for HPC events if the user has interacted, as interactions
    // can cause DOM mutations, which we want to avoid capturing for HPC.
    // The gate also flips `tabHidden` and calls `stop()` on visibility/pagehide
    // so backgrounded sessions don't emit garbage timings.
    this.interactionGate = new InteractionGate({
      onInteracted: this.stop,
      onHidden: this.stop,
    })

    // Process HPC events
    this.hpcTarget.addEventListener('hpc:dom-insertion', this.onDOMInsertion, {
      signal: this.abortController.signal,
    })
    this.hpcTarget.addEventListener('hpc:timing', this.onHPCTiming, {signal: this.abortController.signal})
    document.addEventListener(SOFT_NAV_STATE.RENDER, this.onSoftNavRender)

    // If the stop event is triggered, we want to stop listening to DOM mutations.
    this.abortController.signal.addEventListener('abort', this.onAbort)
  }

  stop = () => {
    this.abortController.abort()
  }

  onDOMInsertion = (e: HPCDomInsertionEvent) => {
    this.insertionFound = true
    clearTimeout(this.emulatedHPCTimer)
    // Whenever we see a DOM insertion, we keep track of when it happened.
    const ctx = getReportContext()
    const event = new HPCTimingEvent(
      this.soft,
      ctx.ssr,
      ctx.lazy,
      ctx.alternate,
      this.mechanism,
      false,
      ctx.gqlFetched,
      ctx.jsFetched,
      ctx.app,
      this.hpcStart,
      e.element,
      this.overhead,
    )

    // If no mutations happen after the timeout, we assume that the DOM is fully loaded, so we send the
    // last seen mutation values.
    this.emulatedHPCTimer = setTimeout(() => this.hpcTarget.dispatchEvent(event), INSERTION_TIMEOUT)
  }

  onHPCTiming = (e: HPCTimingEvent) => {
    if (!this.tabHidden && e.value < 60_000) this.callback(e)

    this.abortController.abort()
  }

  onSoftNavRender = () => {
    const currentHPCElement = document.querySelector('[data-hpc]')
    this.hpcElement = currentHPCElement

    // In case the soft navigation doesn't change the root data-hpc element, the MutationObserver
    // won't catch it, so we use the soft navigation timing as HPC.
    if (!currentHPCElement || currentHPCElement !== this.latestHPCElement) return

    this.#reportHPC(currentHPCElement)
  }

  onAbort = () => {
    if (this.dataHPCanimationFrame) cancelAnimationFrame(this.dataHPCanimationFrame)
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame)
    clearTimeout(this.emulatedHPCTimer)
    this.disconnect()
  }

  // On SSR, data-hpc is already in the DOM before JS runs. Use buffered LCP entries
  // to find when content within data-hpc was first painted, avoiding inflated times
  // from late-loading images, videos, or syntax-highlighted code blocks.
  #findSSRPaintTime(hpcElement: Element) {
    if (
      typeof PerformanceObserver === 'undefined' ||
      !PerformanceObserver.supportedEntryTypes?.includes('largest-contentful-paint')
    ) {
      this.setLCPasHPC(this.soft, true, this.callback)
      return
    }

    try {
      const observer = new PerformanceObserver(list => {
        observer.disconnect()
        this.ssrPaintObserver = null

        const entries = list.getEntries()
        // Entries are chronologically ordered. The first match is the earliest paint
        // of content within data-hpc — typically text before images inflate LCP.
        const match = entries.find(entry => {
          const el = (entry as PerformanceEntry & {element?: Element | null}).element
          return el && (hpcElement === el || hpcElement.contains(el))
        })

        if (match) {
          const matchedElement = (match as PerformanceEntry & {element?: Element | null}).element ?? hpcElement
          const ssrValue = match.startTime
          // Gate on LCP finalization so the SSR path only reports for sessions
          // that finalize (interaction or visibilitychange), preventing p99
          // inflation from abandoned sessions that onLCP would silently drop.
          onLCP(() => {
            this.#emitSSRHPC(ssrValue, matchedElement)
          })
        } else {
          this.setLCPasHPC(this.soft, true, this.callback)
        }
      })

      this.ssrPaintObserver = observer
      observer.observe({type: 'largest-contentful-paint', buffered: true})
    } catch {
      this.setLCPasHPC(this.soft, true, this.callback)
    }
  }

  #emitSSRHPC(value: number, element: Element) {
    const ctx = getReportContext()
    recordDevtoolsTrackEntry({
      name: 'HPC',
      track: 'HPC',
      color: 'primary-dark',
      tooltipText: 'HPC (SSR)',
      start: 0,
      end: value,
    })

    const mechanism = this.mechanism === 'turbo.error' ? this.mechanism : 'hard'

    if (document.visibilityState !== 'hidden' && value < 60_000) {
      this.callback({
        name: 'HPC',
        value: value + this.overhead,
        soft: false,
        found: true,
        ...ctx,
        mechanism,
        attribution: {
          element: getSelector(element),
        },
      })
    }
  }

  setLCPasHPC(soft: boolean, found: boolean, cb: CallbackFunction) {
    const mechanism = this.mechanism === 'turbo.error' ? this.mechanism : 'hard'

    onLCP(({value, attribution}) => {
      const ctx = getReportContext()
      recordDevtoolsTrackEntry({
        name: 'HPC',
        track: 'HPC',
        color: 'primary-dark',
        tooltipText: 'HPC (LCP fallback)',
        end: value,
      })
      cb({
        name: 'HPC',
        value: value + this.overhead,
        soft,
        found,
        ...ctx,
        mechanism,
        attribution: {
          element: attribution?.target,
        },
      })
    })
  }
}
