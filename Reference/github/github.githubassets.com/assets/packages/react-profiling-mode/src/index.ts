import safeStorage from '@github-ui/safe-storage'
import {isStaff} from '@github-ui/stats'

const {getItem, setItem, removeItem} = safeStorage('localStorage')
const REACT_PROFILING_DISABLED_UNTIL = 'REACT_PROFILING_DISABLED_UNTIL'

// Opt-out duration: 24 hours
const OPT_OUT_DURATION_MS = 24 * 60 * 60 * 1000

// Enablement rate for non-staff users in production
const PRODUCTION_ENABLEMENT_RATE = 0.02 // 2%

// Cached decision for the session (undefined = not yet decided)
let cachedEnabled: boolean | undefined

/**
 * Checks if the user has opted out of profiling (localStorage-based).
 * Returns true if NOT opted out (or opt-out expired).
 */
function isNotOptedOut(): boolean {
  const disabledUntil = getItem(REACT_PROFILING_DISABLED_UNTIL)
  if (!disabledUntil) {
    return true
  }
  const expiresAt = Number(disabledUntil)
  if (Number.isNaN(expiresAt) || Date.now() >= expiresAt) {
    // Expired or invalid - clean up and enable
    removeItem(REACT_PROFILING_DISABLED_UNTIL)
    return true
  }
  return false
}

interface ReactProfilingModeMethods {
  enable: () => void
  disable: () => void
  isEnabled: () => boolean
  resetCache: () => void
}

/**
 * Controls React profiling for users.
 *
 * Enablement rules:
 * - Staff users: Enabled by default (can opt-out for 24 hours via `disable()`)
 * - Production users: Enabled for 2% randomly (session-stable)
 *
 * - `enable()`: Removes the opt-out, restoring default profiling behavior immediately
 * - `disable()`: Opts out of profiling for 24 hours (staff only)
 * - `isEnabled()`: Returns true if profiling is enabled for this session
 * - `resetCache()`: Resets the cached decision (for testing only)
 */
const ReactProfilingMode: ReactProfilingModeMethods = {
  enable: () => {
    removeItem(REACT_PROFILING_DISABLED_UNTIL)
    cachedEnabled = undefined // Reset cache so next isEnabled() re-evaluates
  },
  disable: () => {
    setItem(REACT_PROFILING_DISABLED_UNTIL, String(Date.now() + OPT_OUT_DURATION_MS))
    cachedEnabled = false
  },
  isEnabled: () => {
    // No-op on server - profiling only makes sense in the browser
    if (typeof window === 'undefined') {
      return false
    }

    // Return cached value if already decided (session-stable)
    if (cachedEnabled !== undefined) {
      return cachedEnabled
    }

    // Staff users: enabled by default unless opted out
    if (isStaff()) {
      cachedEnabled = isNotOptedOut()
      return cachedEnabled
    }

    // Non-staff: enable for a percentage of production users
    cachedEnabled = Math.random() < PRODUCTION_ENABLEMENT_RATE
    return cachedEnabled
  },
  resetCache: () => {
    cachedEnabled = undefined
  },
}

export default ReactProfilingMode
