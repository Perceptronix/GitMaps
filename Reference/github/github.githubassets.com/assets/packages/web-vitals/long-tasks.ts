import {sendStats} from '@github-ui/stats'
import {sendToHydro} from './hydro-stats'
import {ssrSafeDocument, wasServerRendered} from '@github-ui/ssr-utils'
import {shouldReportLongTask} from './utils/suppression'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'

function processLongTaskEntries(entries: PerformanceEntryList, url: string) {
  const filteredEntries = entries.filter(entry => shouldReportLongTask(entry))
  const longTasks = filteredEntries.map(({name, duration}) => ({name, duration, url}))

  if (longTasks.length > 0) {
    sendStats({longTasks})
    sendToHydro({longTasks: filteredEntries, ssr: wasServerRendered()})
  }
}

// Observers run for all sessions. Hydro receives all data; Datadog is gated on session sampling.
export const observeLongTasks = () => {
  if (
    typeof PerformanceObserver !== 'undefined' &&
    (PerformanceObserver.supportedEntryTypes || []).includes('longtask')
  ) {
    let observer = new PerformanceObserver(list => {
      processLongTaskEntries(list.getEntries(), window.location.href)
    })
    observer.observe({type: 'longtask', buffered: true})

    // On soft nav START, the URL has NOT yet changed (pushState happens after).
    // Flush remaining entries from the old page with the current (old) URL,
    // then reconnect. The new observer reads window.location.href at callback
    // time, which reflects the actual page the user is on when the task ran.
    ssrSafeDocument?.addEventListener(SOFT_NAV_STATE.START, () => {
      processLongTaskEntries(observer.takeRecords(), window.location.href)
      observer.disconnect()
      observer = new PerformanceObserver(list => {
        processLongTaskEntries(list.getEntries(), window.location.href)
      })
      observer.observe({type: 'longtask', buffered: false})
    })
  }
}
