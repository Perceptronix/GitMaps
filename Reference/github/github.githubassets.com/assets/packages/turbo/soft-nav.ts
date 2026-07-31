import {setDocumentAttributesCache} from './cache'
import {markTurboHasLoaded} from './utils'
import {beginProgressBar, completeProgressBar} from './progress-bar'
import {ssrSafeDocument} from '@github-ui/ssr-utils'
import {
  hasSoftNavFailure,
  inSoftNav,
  setSoftNavFailOverhead,
  setSoftNavFailReason,
  setSoftNavMechanism,
} from '@github-ui/soft-nav/utils'
import {endSoftNav, failSoftNav, initSoftNav, renderedSoftNav, succeedSoftNav} from '@github-ui/soft-nav/state'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {softNavSession} from '@github-ui/web-vitals/soft-nav-session'
import {sendCustomMetric} from '@github-ui/stats'

// In case this event is triggered, it means we are in a Frame navigation, so we update the mechanism (if needed).
ssrSafeDocument?.addEventListener('turbo:frame-load', event => {
  // When going to a React page, there is a chance that the soft-nav end event finishes before the frame-load event.
  // In that case, we don't want to start a new soft-nav event here, so we'll skip this if the soft-nav has already ended.
  if (inSoftNav()) setSoftNavMechanism('turbo.frame')
  // When navigating using frames, we either render here, or wait for the react-app to render.
  renderedSoftNav({skipIfGoingToReactApp: true, allowedMechanisms: ['turbo.frame']})

  if (!(event.target instanceof HTMLElement)) return

  if (event.target.getAttribute('data-turbo-action') !== 'advance') {
    // If we are not navigating to a new page, Turbo won't fire a `turbo:load` event, so we need to end the soft-nav here.
    succeedSoftNav({skipIfGoingToReactApp: true, allowedMechanisms: ['turbo.frame']})
  }
})

// Turbo navigations should end here, unless we are navigating to a React app. In that case, React itself will
// end the navigation, since Turbo doesn't know when React is done rendering.
ssrSafeDocument?.addEventListener('turbo:load', event => {
  markTurboHasLoaded()
  const isHardLoad = Object.keys(event.detail.timing ?? {}).length === 0

  if (inSoftNav() && !isHardLoad && !hasSoftNavFailure()) {
    // If going to a react app, we let React succeed the soft-nav.
    succeedSoftNav({skipIfGoingToReactApp: true, allowedMechanisms: ['turbo.frame']})
  } else if (isHardLoad && hasSoftNavFailure()) {
    // A turbo error caused a hard reload. Report the failure unconditionally — React won't
    // know about the turbo-level failure reason, so we can't defer to it.
    failSoftNav({allowedMechanisms: ['turbo.frame']})
    // If failSoftNav couldn't execute (e.g. soft-nav mark was already cleared by beforeunload),
    // clear stale failure state so it doesn't leak into subsequent navigations.
    if (hasSoftNavFailure()) {
      initSoftNav()
    }
  } else if (isHardLoad && inSoftNav()) {
    // Soft-nav is in progress but no failure recorded — let React handle it if going to a React app.
    failSoftNav({skipIfGoingToReactApp: true, allowedMechanisms: ['turbo.frame']})
  } else if (isHardLoad) {
    initSoftNav()
  }
})

ssrSafeDocument?.addEventListener('beforeunload', () => endSoftNav())

// Set the failure reason when we get a reload
ssrSafeDocument?.addEventListener('turbo:reload', function (event) {
  const overhead = softNavSession.soft ? performance.now() - softNavSession.navStart : 0
  sendErrorStat({
    reason: event.detail.reason,
    overhead,
    frame: event.detail.frame,
    url: event.detail.url || location.href,
  })

  setSoftNavFailReason(event.detail.reason)
  if (overhead > 0) {
    setSoftNavFailOverhead(overhead)
  }
})

ssrSafeDocument?.addEventListener(SOFT_NAV_STATE.END, setDocumentAttributesCache)

ssrSafeDocument?.addEventListener(SOFT_NAV_STATE.PROGRESS_BAR.START, beginProgressBar)
ssrSafeDocument?.addEventListener(SOFT_NAV_STATE.PROGRESS_BAR.END, completeProgressBar)

function sendErrorStat({
  reason,
  overhead,
  frame,
  url,
}: {
  reason: string
  overhead: number
  frame?: boolean
  url: string
}) {
  const tags: Record<string, string> = {
    frame: String(frame ?? false),
  }

  if (reason.startsWith('tracked_element_mismatch')) {
    tags['reason'] = 'tracked_element_mismatch'

    sendCustomMetric({
      name: 'BROWSER_TURBO_ERROR_MISMATCH',
      value: 1,
      tags: {
        frame: String(frame ?? false),
        csp: String(reason.includes('pjax_csp_version')),
        js: String(reason.includes('pjax_js_version')),
        css: String(reason.includes('pjax_css_version')),
        pjax: String(reason.includes('pjax_version')),
      },
      requestUrl: url,
    })
  } else {
    tags['reason'] = reason
  }

  sendCustomMetric({
    name: 'BROWSER_TURBO_ERROR',
    value: 1,
    tags,
    requestUrl: url,
  })

  if (overhead > 0) {
    sendCustomMetric({
      name: 'BROWSER_TURBO_ERROR_OVERHEAD',
      value: overhead,
      tags,
      requestUrl: url,
    })
  }
}
