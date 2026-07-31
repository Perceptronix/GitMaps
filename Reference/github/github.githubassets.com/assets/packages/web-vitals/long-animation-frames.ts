import {sendStats} from '@github-ui/stats'
import {sendToHydro} from './hydro-stats'
import {ssrSafeDocument, wasServerRendered} from '@github-ui/ssr-utils'
import {shouldReportLongAnimationFrame} from './utils/suppression'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'

function processLoAFEntries(entries: PerformanceEntryList, url: string) {
  const filteredEntries = entries.filter(entry => shouldReportLongAnimationFrame(entry))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const longAnimationFrames = filteredEntries.map(({name, duration, blockingDuration}: any) => ({
    name,
    duration,
    blockingDuration,
    url,
  }))

  if (longAnimationFrames.length > 0) {
    sendToHydro({longAnimationFrames: filteredEntries, ssr: wasServerRendered()})
    sendStats({longAnimationFrames})
  }
}

// Observers run for all sessions. Hydro receives all data; Datadog is gated on session sampling.
export const observeLongAnimationFrames = () => {
  if (
    typeof PerformanceObserver !== 'undefined' &&
    (PerformanceObserver.supportedEntryTypes || []).includes('long-animation-frame')
  ) {
    let observer = new PerformanceObserver(list => {
      processLoAFEntries(list.getEntries(), window.location.href)
    })
    observer.observe({type: 'long-animation-frame', buffered: true})

    // On soft nav START, the URL has NOT yet changed (pushState happens after).
    // Flush remaining entries from the old page with the current (old) URL,
    // then reconnect. The new observer reads window.location.href at callback
    // time, which reflects the actual page the user is on when the task ran.
    ssrSafeDocument?.addEventListener(SOFT_NAV_STATE.START, () => {
      processLoAFEntries(observer.takeRecords(), window.location.href)
      observer.disconnect()
      observer = new PerformanceObserver(list => {
        processLoAFEntries(list.getEntries(), window.location.href)
      })
      observer.observe({type: 'long-animation-frame', buffered: false})
    })
  }
}
