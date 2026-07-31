import type {SoftNavMechanism} from '@github-ui/soft-nav/events'
import {ssrSafeDocument} from '@github-ui/ssr-utils'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'

/**
 * Single source of truth for soft-nav lifecycle state shared by every
 * web-vital observer that needs to attribute timings to a navigation.
 *
 * Why a singleton: HPC and Container Timing both need the same three
 * facts — whether the current navigation is soft, what mechanism started
 * it, and where (in `performance.now()` time) it began — so they can
 * subtract from raw entry timestamps and tag emitted vitals consistently.
 * Previously each observer wired its own `SOFT_NAV_STATE.START` and
 * `SOFT_NAV_STATE.REPLACE_MECHANISM` listeners and tracked its own
 * `soft` / `mechanism` / `navStart` state. That worked, but every new
 * observer added the same three-field copy and an opportunity to drift
 * (one observer fixing a START semantic without the other catching up).
 *
 * The session owns the listeners and the state. Observers read from it.
 *
 * Listeners are wired lazily by `ensure()` on first observer construction
 * rather than at module import time so that importing this file is a pure
 * side-effect-free operation (no global `document.addEventListener` until
 * someone actually intends to observe a vital).
 */
class SoftNavSession {
  /** True between SOFT_NAV_STATE.START and the next hard load. */
  soft = false

  /**
   * Hard load defaults to `'hard'`; SOFT_NAV_STATE.START provides the
   * navigation mechanism; SOFT_NAV_STATE.REPLACE_MECHANISM upgrades it
   * mid-flight (e.g. turbo → react route change).
   */
  mechanism: SoftNavMechanism | 'hard' = 'hard'

  /**
   * Origin for observer-relative timing math. `0` on hard load (entry
   * timestamps are already page-load-relative); `performance.now()` at
   * SOFT_NAV_STATE.START so observers can compute "time since this
   * navigation began" rather than "time since page load".
   */
  navStart = 0

  #listenersWired = false

  /**
   * Idempotently register the soft-nav listeners. Called by each
   * observer constructor so that:
   *  - Importing this module has no side effects (no `addEventListener`).
   *  - The listeners are wired exactly once across all observers.
   *  - Tests that construct an observer get the same wiring as production
   *    without needing a separate bootstrap step.
   */
  ensure() {
    if (this.#listenersWired) return
    this.#listenersWired = true
    ssrSafeDocument?.addEventListener(SOFT_NAV_STATE.START, ({mechanism}) => {
      this.soft = true
      this.mechanism = mechanism
      this.navStart = performance.now()
    })
    ssrSafeDocument?.addEventListener(SOFT_NAV_STATE.REPLACE_MECHANISM, ({mechanism}) => {
      this.mechanism = mechanism
    })
  }

  /** Reset to hard-load defaults. Tests call this between cases. */
  __resetForTesting() {
    this.soft = false
    this.mechanism = 'hard'
    this.navStart = 0
  }
}

export const softNavSession = new SoftNavSession()
