import {ssrSafeDocument} from '@github-ui/ssr-utils'

export interface InteractionGateOptions {
  /** Invoked the first time any of touchstart/mousedown/keydown/pointerdown fires. */
  onInteracted?: () => void
  /** Invoked when the tab becomes hidden or the page is being unloaded. */
  onHidden?: () => void
}

/**
 * Listens for first-user-interaction (touch/mouse/key/pointer) and
 * tab-visibility/pagehide signals. Used by HPC and Container Timing to
 * drop paint timings that don't represent "time to ready" (post-
 * interaction paints) or foreground UX (backgrounded tabs).
 *
 * The gate doesn't decide what to do with these signals — it only
 * exposes flags and invokes optional callbacks. Each observer wires
 * the callbacks to its own teardown semantics (HPC aborts the
 * observer; Container Timing keeps observing but drops entries).
 */
export class InteractionGate {
  interacted = false
  tabHidden = false
  #abort = new AbortController()

  constructor(opts: InteractionGateOptions = {}) {
    if (!ssrSafeDocument) return

    this.tabHidden = ssrSafeDocument.visibilityState === 'hidden'

    const interactionOpts: AddEventListenerOptions = {
      capture: true,
      passive: true,
      once: true,
      signal: this.#abort.signal,
    }
    const markInteracted = () => {
      this.interacted = true
      opts.onInteracted?.()
    }
    // eslint-disable-next-line github/require-passive-events
    ssrSafeDocument.addEventListener('touchstart', markInteracted, interactionOpts)
    ssrSafeDocument.addEventListener('mousedown', markInteracted, interactionOpts)
    ssrSafeDocument.addEventListener('keydown', markInteracted, interactionOpts)
    ssrSafeDocument.addEventListener('pointerdown', markInteracted, interactionOpts)

    const visibilityOpts: AddEventListenerOptions = {
      capture: true,
      passive: true,
      signal: this.#abort.signal,
    }
    const markHidden = () => {
      // `visibilitychange` fires for both directions; only flip when actually hidden.
      if (ssrSafeDocument?.visibilityState === 'hidden') {
        this.tabHidden = true
        opts.onHidden?.()
      }
    }
    ssrSafeDocument.addEventListener('visibilitychange', markHidden, visibilityOpts)
    // `pagehide` doesn't reset — once we leave, the metric for this nav is dead.
    ssrSafeDocument.addEventListener(
      'pagehide',
      () => {
        this.tabHidden = true
        opts.onHidden?.()
      },
      {...visibilityOpts, once: true},
    )
  }

  /** Tear down all gate listeners. Safe to call multiple times. */
  teardown() {
    this.#abort.abort()
  }
}
