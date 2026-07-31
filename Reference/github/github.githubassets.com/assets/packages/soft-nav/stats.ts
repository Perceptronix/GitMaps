import {sendStats} from '@github-ui/stats'
import {getSoftNavMechanism, getSoftNavReactAppName, getSoftNavReferrer} from './utils'
import type {SoftNavMechanism} from './events'
import {getCurrentReactAppName} from '@github-ui/stats-metadata'

export const SOFT_NAV_DURATION_MARK = 'stats:soft-nav-duration'
export const MECHANISM_MAPPING: Record<SoftNavMechanism | 'hard', PlatformBrowserSoftNavigationMechanism> = {
  react: 'REACT',
  'turbo.frame': 'FRAME',
  'turbo.error': 'TURBO.ERROR',
  ui: 'UI',
  hard: 'HARD',
  unknown: 'UNKNOWN',
}
export function markStart() {
  // browswers only record the first ~150 resources
  // clearing it here provides room to track additional resources loaded during the soft-nav
  window.performance.clearResourceTimings()
  window.performance.mark(SOFT_NAV_DURATION_MARK)
}

function getDurationSinceLastSoftNav() {
  if (performance.getEntriesByName(SOFT_NAV_DURATION_MARK).length === 0) {
    return null
  }

  performance.measure(SOFT_NAV_DURATION_MARK, {
    start: SOFT_NAV_DURATION_MARK,
    detail: {
      devtools: {
        dataType: 'track-entry',
        track: 'Navigation',
        trackGroup: 'Performance Timeline',
        color: 'secondary',
        tooltipText: 'Soft nav duration',
      },
    },
  })
  const measures = performance.getEntriesByName(SOFT_NAV_DURATION_MARK)
  const measure = measures.pop()
  return measure ? measure.duration : null
}

export function sendFailureStats(turboFailureReason: string) {
  sendStats({
    turboFailureReason,
    turboStartUrl: getSoftNavReferrer(),
    turboEndUrl: window.location.href,
  })
}

export function sendRenderStats() {
  const duration = getDurationSinceLastSoftNav()

  if (!duration) return

  const mechanism = MECHANISM_MAPPING[getSoftNavMechanism()]
  const roundedDuration = Math.round(duration)

  if (mechanism === MECHANISM_MAPPING.react)
    document.dispatchEvent(new CustomEvent('staffbar-update', {detail: {duration: roundedDuration}}))

  sendStats({
    requestUrl: window.location.href,
    referredRequestUrl: getSoftNavReferrer(),
    softNavigationTiming: {
      mechanism,
      destination: getCurrentReactAppName() || 'rails',
      duration: roundedDuration,
      initiator: getSoftNavReactAppName() || 'rails',
    },
  })
}
