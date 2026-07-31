import {sendEvent, stringifyObjectValues} from '@github-ui/hydro-analytics'
import {loaded} from '@github-ui/document-ready'
import {getFeatureFlags} from './get-feature-flags'
import {isAutomatedSession} from '@github-ui/stats'
import type {WebVitalMetric, MetricOrHPC} from './web-vitals'
import type {HPCTimingData} from './hpc-events'
import {getCPUBucket} from '@github-ui/cpu-bucket'
import type {INPAttribution} from './inp/metric'
import {getLCPBreakdown} from './utils/lcp-breakdown'

interface WebVitalInformation {
  name: string
  value: number
  element?: string
  events?: string
  interactionType?: string
  eventType?: string
  elementType?: string
  inputDelay?: number
  processingDuration?: number
  presentationDelay?: number
  breakdown?: PlatformLCPBreakdown
}

interface HPCInformation extends WebVitalInformation {
  mechanism: HPCTimingData['mechanism']
  soft: boolean
}

/**
 * Container Timing companion to `hpc` on the same Hydro row. Mirrors the
 * HPC field shape (mechanism, gqlFetched, jsFetched, lazy, alternate)
 * so the two metrics can be diffed and faceted with the same Kusto
 * queries. The delta to HPC isn't precomputed on the client \u2014 Container
 * Timing usually fires earlier than HPC's LCP-finalised reporter, so
 * the precomputed value would be undefined in the common case. Kusto
 * subtracts `containerTiming.value - hpc.value` row-wise instead.
 */
interface ContainerTimingInformation {
  name: 'ContainerTiming'
  value: number
  identifier: string
  element?: string
  lastPaintedSubElement?: string
  size: number
  soft: boolean
  final: boolean
  firstRenderTime?: number
  lastPaintTime?: number
  app?: string
  mechanism?: HPCTimingData['mechanism']
  gqlFetched?: boolean
  jsFetched?: boolean
  lazy?: boolean
  alternate?: boolean
  domNodes?: number
  previousDomNodes?: number
  /**
   * True when the value was reported by the emulated-timeout fallback
   * (no terminal paint within `EMULATED_TIMEOUT` of the last
   * intermediate). Mirrors HPC's "emulated HPC" semantic so Kusto can
   * separate real-terminal vs fallback samples.
   */
  emulated?: boolean
}

interface HydroStat {
  react?: boolean
  reactApp?: string | null
  reactPartials?: string[]
  featureFlags?: string[]
  ssr?: boolean
  automated?: boolean
  hpc?: HPCInformation
  containerTiming?: ContainerTimingInformation
  ttfb?: WebVitalInformation
  fcp?: WebVitalInformation
  lcp?: WebVitalInformation
  fid?: WebVitalInformation
  inp?: WebVitalInformation
  cls?: WebVitalInformation
  elementtiming?: WebVitalInformation
  longTasks?: PerformanceEntryList
  longAnimationFrames?: PerformanceEntryList
  controller?: string
  action?: string
  routePattern?: string
  cpu?: string
  domNodes?: number
  previousDomNodes?: number
  navigationId?: string
}

let queued: HydroStat | undefined

/**
 * Lazily initialise the per-pageview batch with route + session metadata.
 * Called by every Hydro-bound reporter (HPC, web vitals, long tasks,
 * Container Timing). The first call seeds the shared metadata; later
 * calls reuse the same `queued` object so all per-pageview signals
 * land on a single Hydro event row.
 */
function ensureHydroStat({
  ssr,
  domNodes,
  previousDomNodes,
}: {
  ssr: boolean
  domNodes?: number
  previousDomNodes?: number
}): HydroStat {
  const hydroStat = queueStat()
  if (hydroStat.react === undefined) {
    const reactApp = document.querySelector('react-app')
    hydroStat.react = !!reactApp
    hydroStat.reactApp = reactApp?.getAttribute('app-name')
    // Convert to Set and back to Array to remove duplicates.
    hydroStat.reactPartials = [
      ...new Set(
        Array.from(document.querySelectorAll('react-partial')).map(
          partial => partial.getAttribute('partial-name') || '',
        ),
      ),
    ]
    hydroStat.featureFlags = getFeatureFlags()
    hydroStat.ssr = ssr
    hydroStat.controller = document.querySelector<HTMLMetaElement>('meta[name="route-controller"]')?.content
    hydroStat.action = document.querySelector<HTMLMetaElement>('meta[name="route-action"]')?.content
    hydroStat.routePattern = document.querySelector<HTMLMetaElement>('meta[name="route-pattern"]')?.content
    hydroStat.cpu = getCPUBucket()
    hydroStat.automated = isAutomatedSession()
    hydroStat.navigationId = getCurrentNavigationId()
  }

  if (domNodes) hydroStat.domNodes = domNodes
  if (previousDomNodes) hydroStat.previousDomNodes = previousDomNodes
  return hydroStat
}

/**
 * Batched report of vital to hydro
 */
export function sendToHydro({
  metric,
  ssr,
  domNodes,
  previousDomNodes,
  longTasks,
  longAnimationFrames,
}: {
  metric?: MetricOrHPC
  ssr: boolean
  domNodes?: number
  previousDomNodes?: number
  longTasks?: PerformanceEntryList
  longAnimationFrames?: PerformanceEntryList
}) {
  const hydroStat = ensureHydroStat({ssr, domNodes, previousDomNodes})

  if (metric) {
    return sendWebVital(hydroStat, metric)
  }

  hydroStat.longTasks = longTasks
  hydroStat.longAnimationFrames = longAnimationFrames
}

/**
 * Same-page companion to `sendToHydro` for Container Timing. Reuses the
 * shared per-pageview batch so HPC and Container Timing end up on the
 * same Hydro event row, joined implicitly. Kusto computes the diff
 * `containerTiming.value - hpc.value` row-wise.
 *
 * First-wins by `identifier`: the first `'hpc'`-identified container is
 * authoritative for that pageview. Subsequent reports (a nested misuse,
 * or a sub-container that also paints) are silently dropped here so a
 * stray inner container can't overwrite the page's primary signal. The
 * dupes are still visible in Datadog under the same `identifier: hpc`
 * tag if drift needs investigating. Non-`'hpc'` identifiers skip Hydro
 * entirely — they're not directly comparable to HPC and shouldn't
 * pollute the primary row.
 */
export function sendContainerTimingToHydro(info: ContainerTimingInformation, ssr: boolean) {
  if (info.identifier !== 'hpc') return

  const hydroStat = ensureHydroStat({ssr})
  if (hydroStat.containerTiming) return
  hydroStat.containerTiming = info
}

function getCurrentNavigationId(): string {
  if (typeof navigation === 'undefined' || !('currentEntry' in navigation)) {
    return ''
  }

  // eslint-disable-next-line compat/compat -- we check just above this line
  return navigation.currentEntry?.id ?? ''
}

function sendWebVital(hydroStat: HydroStat, metric: MetricOrHPC) {
  if (metric.value < 60_000) {
    if (metric.name === 'HPC') {
      hydroStat[metric.name.toLocaleLowerCase() as Lowercase<typeof metric.name>] = buildHPCInformation(metric)
    } else {
      hydroStat[metric.name.toLocaleLowerCase() as Lowercase<typeof metric.name>] = buildWebVitalInformation(metric)
    }
  }
}

function buildHPCInformation(metric: HPCTimingData): HPCInformation {
  return {
    name: metric.name,
    value: metric.value,
    element: metric.attribution?.element,
    soft: !!metric.soft,
    mechanism: metric.mechanism,
  }
}

function buildWebVitalInformation(metric: WebVitalMetric): WebVitalInformation {
  const vitalInformation: WebVitalInformation = {
    name: metric.name,
    value: metric.value,
  }

  switch (metric.name) {
    case 'LCP':
      vitalInformation.breakdown = getLCPBreakdown(metric)
      vitalInformation.element = metric.attribution?.target
      break
    case 'ElementTiming':
      vitalInformation.element = metric.attribution?.target
      break
    case 'INP':
      vitalInformation.element = metric.attribution?.interactionTarget
      // Only include custom fields if they exist (from our custom INPMetric class)
      if (metric.attribution && 'interactionType' in metric.attribution) {
        const customAttribution = metric.attribution as INPAttribution
        vitalInformation.interactionType = customAttribution.interactionType
        vitalInformation.eventType = customAttribution.eventType
        vitalInformation.inputDelay = customAttribution.inputDelay
        vitalInformation.processingDuration = customAttribution.processingDuration
        vitalInformation.presentationDelay = customAttribution.presentationDelay
      }
      if (metric.entries?.length) vitalInformation.events = metric.entries.map(entry => entry.name).join(',')
      break
    case 'CLS':
      vitalInformation.element = metric.attribution?.largestShiftTarget
      break
  }

  return vitalInformation
}

/**
 * Create a new stat object and schedule it to be sent to hydro
 */
function queueStat(): HydroStat {
  if (!queued) {
    queued = {}
    scheduleSend()
  }
  return queued
}

/**
 * Schedule a send to hydro
 */
async function scheduleSend() {
  await loaded
  window.requestIdleCallback(send)
}

/**
 * Send the queued event to hydro
 */
function send() {
  if (!queued) return

  sendEvent('web-vital', stringifyObjectValues(queued))
  queued = undefined
}
