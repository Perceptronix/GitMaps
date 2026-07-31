import {wasServerRendered} from '@github-ui/ssr-utils'
import {updateCurrentApp} from '@github-ui/stats'
import {getCurrentReactAppName} from '@github-ui/stats-metadata'
import {hasFetchedGQL, hasFetchedJS, isReactAlternate, isReactLazyPayload} from '../web-vitals'

export interface ReportContext {
  app: string
  ssr: boolean
  lazy: boolean
  alternate: boolean
  gqlFetched: boolean
  jsFetched: boolean
}

/**
 * Snapshot the per-report metadata bundle shared by HPC and Container
 * Timing. Refreshes the cached app first via `updateCurrentApp()`: a
 * report can fire between SOFT_NAV_STATE.START and RENDER, and without
 * the refresh it would otherwise carry the prior page's `<react-app>`
 * metadata.
 *
 * Field names intentionally match `HPCTimingData` so SSR/LCP callback
 * payloads can splat the context directly.
 */
export function getReportContext(): ReportContext {
  updateCurrentApp()
  return {
    app: getCurrentReactAppName() || 'rails',
    ssr: wasServerRendered(),
    lazy: isReactLazyPayload(),
    alternate: isReactAlternate(),
    gqlFetched: hasFetchedGQL(),
    jsFetched: hasFetchedJS(),
  }
}
