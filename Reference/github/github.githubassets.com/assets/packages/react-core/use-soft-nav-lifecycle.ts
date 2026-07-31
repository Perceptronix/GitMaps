import type {Location} from '@github-ui/react-router'
import {failSoftNav, renderedSoftNav, succeedSoftNav} from '@github-ui/soft-nav/state'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {getSoftNavReferrer, inSoftNav} from '@github-ui/soft-nav/utils'
import {ssrSafeDocument} from '@github-ui/ssr-utils'
import {sendStats} from '@github-ui/stats'
import {useEffect, useRef} from 'react'

import type {PageError} from './app-routing-types'

function updateVisitorPayload() {
  const visitorMeta = ssrSafeDocument?.querySelector<HTMLMetaElement>('meta[name=visitor-payload]')

  if (!visitorMeta) return

  const payload = JSON.parse(atob(visitorMeta.content))
  // Use the page the user navigated FROM (captured at the start of the soft
  // nav by setSoftNavReferrer), not the page they just arrived at — otherwise
  // this page's own Hydro events end up reporting themselves as their referrer.
  payload.referrer = getSoftNavReferrer()

  visitorMeta.content = btoa(JSON.stringify(payload))
}

export const useSoftNavLifecycle = (location: Location, isLoading: boolean, error: PageError | null) => {
  const lastRecordedKeyRef = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (!isLoading && (lastRecordedKeyRef.current === undefined || lastRecordedKeyRef.current !== location.key)) {
      // At this point, React is done rendering, so we can end the navigation
      if (inSoftNav()) {
        finishSoftNav(error)
        updateVisitorPayload()
      } else {
        finishHardNav(error)
      }

      document.dispatchEvent(new CustomEvent(SOFT_NAV_STATE.REACT_DONE, {detail: {error}}))

      lastRecordedKeyRef.current = location.key
    }
  }, [location.key, location.pathname, isLoading, error])
}

const finishSoftNav = (error: PageError | null) => {
  if (error) {
    failSoftNav()
  } else {
    renderedSoftNav()
    succeedSoftNav()
  }
}

const finishHardNav = (error: PageError | null) => {
  // We don't want to measure pages with errors.
  if (error) return

  const navDuration = getReactNavDuration()

  if (!navDuration) return

  sendStats({
    requestUrl: window.location.href,
    distributionKey: 'REACT_NAV_DURATION',
    distributionValue: Math.round(navDuration),
    distributionTags: ['REACT_NAV_HARD'],
  })
}

const reactNavDurationStat = 'react_nav_duration'
function getReactNavDuration() {
  window.performance.measure(reactNavDurationStat, {
    start: 0,
    detail: {
      devtools: {
        dataType: 'track-entry',
        track: 'Navigation',
        trackGroup: 'Performance Timeline',
        color: 'secondary-light',
        tooltipText: 'React nav duration',
      },
    },
  })
  const measures = window.performance.getEntriesByName(reactNavDurationStat)
  const measure = measures.pop()
  return measure ? measure.duration : null
}
