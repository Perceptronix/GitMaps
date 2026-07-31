import {isHeaderRedesign} from './web-vitals'
import type {MetricOrHPC} from './web-vitals'
import {loaded} from '@github-ui/document-ready'
import {ssrSafeDocument} from '@github-ui/ssr-utils'
import {sendStats, sendCustomMetric} from '@github-ui/stats'
import {sendEvent, stringifyObjectValues} from '@github-ui/hydro-analytics'
import {sendToHydro} from './hydro-stats'
import {isFeatureEnabled} from '@github-ui/feature-flags'
import {MECHANISM_MAPPING} from '@github-ui/soft-nav/stats'
import {getSoftNavReferrer} from '@github-ui/soft-nav/utils'
import {getCPUBucket} from '@github-ui/cpu-bucket'
import type {HPCTimingData} from './hpc-events'
import type {ICVTimingEvent} from './icv/types'
import {getDomNodes, getDomNodesBucket} from './dom-nodes'
import type {INPAttribution} from './inp/metric'
import type {LCPMetricWithAttribution} from 'web-vitals/attribution'
import {getLCPBreakdown} from './utils/lcp-breakdown'
import {shouldReportWebVital} from './utils/suppression'
import {softNavSession} from './utils/soft-nav-session'

type INPBottleneck = 'input_delay' | 'processing' | 'presentation'

/**
 * Determines the primary bottleneck phase for an INP interaction.
 * When phases have equal duration, precedence is: processing > input_delay > presentation
 * @returns The bottleneck phase identifier, or undefined if attribution data is incomplete
 */
function getBottleneck(attribution: INPAttribution | undefined): INPBottleneck | undefined {
  if (!attribution) return undefined
  const {inputDelay, processingDuration, presentationDelay} = attribution
  if (inputDelay === undefined || processingDuration === undefined || presentationDelay === undefined) {
    return undefined
  }

  if (processingDuration >= inputDelay && processingDuration >= presentationDelay) return 'processing'
  if (inputDelay >= presentationDelay) return 'input_delay'
  return 'presentation'
}

interface NetworkInformation extends EventTarget {
  readonly effectiveType: string
}

interface SendVitalsOptions {
  url?: string
}

export function sendVitals(metric: MetricOrHPC, opts: SendVitalsOptions = {}) {
  // Check if this metric should be reported based on execution conditions and thresholds
  // This suppresses metrics collected during non-representative execution (debugger pauses,
  // page backgrounding, extreme outliers) to protect Datadog percentile accuracy.
  // Suppression telemetry is sent via BROWSER_VITALS_SUPPRESSED custom metric.
  if (!shouldReportWebVital(metric)) {
    return
  }

  const {name, value} = metric
  const stat: PlatformBrowserPerformanceWebVitalTiming = {
    name: opts.url || window.location.href,
    cpu: getCPUBucket(),
  }
  stat[name.toLowerCase() as Lowercase<typeof name>] = value

  if (isFeatureEnabled('sample_network_conn_type')) {
    stat.networkConnType = getConnectionType()
  }

  if (name === 'ElementTiming') {
    stat.identifier = metric.identifier
  }

  if (name === 'HPC') {
    addHPCStats(stat, metric)
  } else if (name === 'LCP') {
    addLCPBreakdown(stat, metric)
  } else if (name === 'CLS') {
    stat.soft = softNavSession.soft
    stat.mechanism = MECHANISM_MAPPING[softNavSession.mechanism]
  }

  // Only set custom fields if they exist (from our custom INPMetric class)
  if (name === 'INP' && 'interactionType' in (metric.attribution || {})) {
    const attribution = metric.attribution as INPAttribution | undefined
    stat.inpInteractionType = attribution?.interactionType
    stat.inpEventType = attribution?.eventType
    stat.inpBottleneck = getBottleneck(attribution)

    // Get DOM node counts once for both stat and phase custom metrics
    const domNodeCounts = getDomNodes()

    if (domNodeCounts.current !== undefined) {
      stat.domNodes = domNodeCounts.current
    }
    if (domNodeCounts.previous !== undefined) {
      stat.previousDomNodes = domNodeCounts.previous
    }

    // Send separate INP phase duration metrics as custom metrics.
    // Tags become Datadog dimensions, so DOM node counts are bucketed to
    // keep cardinality low. A new tag key (`domNodesBucket`) is used so the
    // legacy high-cardinality `domNodes` tag can be phased out in Datadog
    // without colliding with historical series. Raw counts are still
    // emitted on the stat payload above for server-side aggregation.
    const phaseTags: Record<string, string | number> = {
      cpu: getCPUBucket(),
    }
    const currentBucket = domNodeCounts.current !== undefined ? getDomNodesBucket(domNodeCounts.current) : undefined
    const previousBucket = domNodeCounts.previous !== undefined ? getDomNodesBucket(domNodeCounts.previous) : undefined
    if (currentBucket !== undefined) {
      phaseTags.domNodesBucket = currentBucket
    }
    if (previousBucket !== undefined) {
      phaseTags.previousDomNodesBucket = previousBucket
    }

    if (attribution?.inputDelay !== undefined) {
      sendCustomMetric({
        name: 'BROWSER_VITALS_DIST_INP_INPUT_DELAY',
        value: attribution.inputDelay,
        tags: phaseTags,
        requestUrl: opts.url,
      })
    }
    if (attribution?.processingDuration !== undefined) {
      sendCustomMetric({
        name: 'BROWSER_VITALS_DIST_INP_PROCESSING',
        value: attribution.processingDuration,
        tags: phaseTags,
        requestUrl: opts.url,
      })
    }
    if (attribution?.presentationDelay !== undefined) {
      sendCustomMetric({
        name: 'BROWSER_VITALS_DIST_INP_PRESENTATION',
        value: attribution.presentationDelay,
        tags: phaseTags,
        requestUrl: opts.url,
      })
    }
  }

  // Only get domNodes for HPC here, INP already handled above
  if (name === 'HPC') {
    // The server handles creating 'buckets' for Datadog.
    const domNodeCounts = getDomNodes()
    stat.domNodes = domNodeCounts.current
    stat.previousDomNodes = domNodeCounts.previous
  }

  const syntheticTest = document.querySelector('meta[name="synthetic-test"]')
  if (syntheticTest) {
    stat.synthetic = true
  }

  // Always emit DOM events, Hydro, and staff bar with the full stat
  emitEvent(name, stat)

  const requestId = getHardNavigationRequestId()

  // Datadog: session sampling is handled inside sendStats
  sendStats({
    webVitalTimings: [stat],
    // Carry the request/referrer URLs so Rails' BrowserStatsHelper can tag
    // these stats with controller/action (and referred_controller/action).
    requestUrl: opts.url || window.location.href,
    referredRequestUrl: getSoftNavReferrer(),
    ...(requestId ? {requestId} : {}),
  })

  sendToHydro({metric, ssr: !!stat.ssr, domNodes: stat.domNodes, previousDomNodes: stat.previousDomNodes})

  updateStaffBar(name, value)
}

function getHardNavigationRequestId(): string | undefined {
  if (softNavSession.soft) return undefined

  return ssrSafeDocument?.querySelector<HTMLMetaElement>('meta[name="request-id"]')?.content || undefined
}

function emitEvent(name: string, stat: PlatformBrowserPerformanceWebVitalTiming) {
  const eventName = `web-vitals:${name.toLowerCase()}`
  ssrSafeDocument?.dispatchEvent(new CustomEvent(eventName, {detail: stat}))
}

const addLCPBreakdown = (stat: PlatformBrowserPerformanceWebVitalTiming, metric: LCPMetricWithAttribution) => {
  const lcpBreakdown = getLCPBreakdown(metric)
  stat.lcpBreakdown = lcpBreakdown
}

const addHPCStats = (stat: PlatformBrowserPerformanceWebVitalTiming, metric: HPCTimingData) => {
  stat.soft = metric.soft
  stat.ssr = metric.ssr
  stat.mechanism = MECHANISM_MAPPING[metric.mechanism]
  stat.lazy = metric.lazy
  stat.alternate = metric.alternate
  stat.hpcFound = metric.found
  stat.hpcGqlFetched = metric.gqlFetched
  stat.hpcJsFetched = metric.jsFetched
  stat.headerRedesign = isHeaderRedesign()
  stat.app = metric.app
}

function updateStaffBar(name: string, value: number) {
  const staffBarContainer = document.querySelector('#staff-bar-web-vitals')
  const metricContainer = staffBarContainer?.querySelector(`[data-metric=${name.toLowerCase()}]`)

  if (!metricContainer) {
    return
  }

  metricContainer.textContent = value.toPrecision(6)
}

function isTimingSuppported(): boolean {
  return !!(window.performance && window.performance.timing && window.performance.getEntriesByType)
}

function getConnectionType() {
  if (
    'connection' in navigator &&
    navigator.connection &&
    'effectiveType' in (navigator.connection as NetworkInformation)
  ) {
    return (navigator.connection as NetworkInformation).effectiveType
  }

  return 'N/A'
}

export async function sendTimingResults() {
  if (!isTimingSuppported()) return

  await loaded
  await new Promise(resolve => setTimeout(resolve))

  sendResourceTimings()
  sendNavigationTimings()
}

const sendResourceTimings = () => {
  const resourceTimings = window.performance.getEntriesByType('resource').map(
    (timing): PlatformBrowserPerformanceNavigationTiming => ({
      name: timing.name,
      entryType: timing.entryType,
      startTime: timing.startTime,
      duration: timing.duration,
      initiatorType: timing.initiatorType,
      nextHopProtocol: timing.nextHopProtocol,
      workerStart: timing.workerStart,
      redirectStart: timing.redirectStart,
      redirectEnd: timing.redirectEnd,
      fetchStart: timing.fetchStart,
      domainLookupStart: timing.domainLookupStart,
      domainLookupEnd: timing.domainLookupEnd,
      connectStart: timing.connectStart,
      connectEnd: timing.connectEnd,
      secureConnectionStart: timing.secureConnectionStart,
      requestStart: timing.requestStart,
      responseStart: timing.responseStart,
      responseEnd: timing.responseEnd,
      transferSize: timing.transferSize,
      encodedBodySize: timing.encodedBodySize,
      decodedBodySize: timing.decodedBodySize,
    }),
  )

  if (resourceTimings.length) {
    sendStats({resourceTimings}, false, 0.05)
  }
}

const sendNavigationTimings = () => {
  const navigationTimings = window.performance.getEntriesByType('navigation').map(
    (timing): PlatformBrowserPerformanceNavigationTiming => ({
      activationStart: timing.activationStart,
      name: timing.name,
      entryType: timing.entryType,
      startTime: timing.startTime,
      duration: timing.duration,
      initiatorType: timing.initiatorType,
      nextHopProtocol: timing.nextHopProtocol,
      workerStart: timing.workerStart,
      redirectStart: timing.redirectStart,
      redirectEnd: timing.redirectEnd,
      fetchStart: timing.fetchStart,
      domainLookupStart: timing.domainLookupStart,
      domainLookupEnd: timing.domainLookupEnd,
      connectStart: timing.connectStart,
      connectEnd: timing.connectEnd,
      secureConnectionStart: timing.secureConnectionStart,
      requestStart: timing.requestStart,
      responseStart: timing.responseStart,
      responseEnd: timing.responseEnd,
      transferSize: timing.transferSize,
      encodedBodySize: timing.encodedBodySize,
      decodedBodySize: timing.decodedBodySize,
      unloadEventStart: timing.unloadEventStart,
      unloadEventEnd: timing.unloadEventEnd,
      domInteractive: timing.domInteractive,
      domContentLoadedEventStart: timing.domContentLoadedEventStart,
      domContentLoadedEventEnd: timing.domContentLoadedEventEnd,
      domComplete: timing.domComplete,
      loadEventStart: timing.loadEventStart,
      loadEventEnd: timing.loadEventEnd,
      type: timing.type,
      redirectCount: timing.redirectCount,
    }),
  )

  if (navigationTimings.length) {
    sendStats({navigationTimings}, false, isDevelopment() ? 1 : 0.05)
  }
}

function isDevelopment() {
  return process?.env?.NODE_ENV === 'development'
}

/**
 * Send an ICV (Interaction Content Visible) timing event.
 * Sends each event individually via sendEvent to avoid batching issues —
 * unlike other web vitals that fire once per page, ICV fires on every
 * qualifying interaction.
 */
export function sendICV(metric: ICVTimingEvent) {
  // Skip if tab is hidden (data quality)
  if (document.visibilityState === 'hidden') return
  sendEvent('icv', stringifyObjectValues(metric))

  // Send a small subset to tags to Datadog for alerting and dashboards.
  // Only low-cardinality tags are included. Only including action name when
  // it was manually tagged by an engineer
  sendCustomMetric({
    name: 'BROWSER_VITALS_ICV',
    value: metric.value,
    tags: {
      actionName: metric.nameFoundBy === 'data-icv-name' ? metric.actionName : 'missing [data-icv-name] attribute',
      endpoints: metric.endpoints.length,
    },
  })
}
