import {AnalyticsClient, getOptionsFromMeta} from '@github/hydro-analytics-client'
import type {Context} from '@github/hydro-analytics-client'
import safeStorage from '@github-ui/safe-storage'
import {ssrSafeDocument} from '@github-ui/ssr-utils'
import {isStaff} from '@github-ui/stats'
import {logSendEvent} from './dev-logger'
const {getItem} = safeStorage('localStorage')

declare const process: {
  env: {
    NODE_ENV: string
  }
}

const dimensionPrefix = 'dimension_'
let hydroAnalyticsClient: AnalyticsClient | undefined

const MARKETING_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'scid']

function safeGetOptionsFromMeta(prefix: string) {
  try {
    return getOptionsFromMeta(prefix)
  } catch {
    return undefined
  }
}

const initOptions = safeGetOptionsFromMeta('octolytics')
if (initOptions) {
  // Remove the base context because meta tags can change as the user navigates with Turbo
  // These will be folded in for each event & page view
  delete initOptions.baseContext
  initOptions.idleTimeout = 5000
  initOptions.maxBatchSize = 50

  hydroAnalyticsClient = new AnalyticsClient(initOptions)
}

function extendBaseContext(context?: Context) {
  const baseContext = safeGetOptionsFromMeta('octolytics')?.baseContext ?? {}

  if (baseContext) {
    delete baseContext.app_id
    delete baseContext.event_url
    delete baseContext.host

    for (const [key, value] of Object.entries(baseContext)) {
      // some octolytics meta tags are prefixed with dimension-, which we don't need with the new hydro-analytics-client
      if (key.startsWith(dimensionPrefix)) {
        baseContext[key.replace(dimensionPrefix, '')] = value
        delete baseContext[key]
      }
    }
  }

  const visitorMeta = ssrSafeDocument?.querySelector<HTMLMetaElement>('meta[name=visitor-payload]')
  if (visitorMeta) {
    const visitorHash = JSON.parse(atob(visitorMeta.content))
    Object.assign(baseContext, visitorHash)
  }

  const urlParams = new URLSearchParams(window.location.search)
  for (const [key, value] of urlParams) {
    if (MARKETING_PARAMS.includes(key.toLowerCase())) {
      baseContext[key] = value
    }
  }

  // Include additional context from the page
  baseContext.staff = isStaff().toString()

  return Object.assign(baseContext, context)
}

export function sendPageView(context?: Context) {
  hydroAnalyticsClient?.sendPageView(extendBaseContext(context))
}

export type SendEventContext = Record<string, string | number | boolean | undefined | null>
type SendEventOptions = {batched?: boolean; page?: string}
type HydroEventPayload = {
  events: Array<{
    page: string
    title: string
    context: Context
    type: string
  }>
}
type HydroPayloadSender = {
  send: (payload: HydroEventPayload) => void
}

export function currentCatalogService() {
  return ssrSafeDocument?.head?.querySelector<HTMLMetaElement>('meta[name="current-catalog-service"]')?.content
}

export function sendEvent(
  type: string,
  context: SendEventContext = {},
  {batched = false, page}: SendEventOptions = {},
) {
  const service = currentCatalogService()

  const cleanContext: Context = service ? {service} : {}

  for (const [key, value] of Object.entries(context)) {
    if (value !== undefined && value !== null) {
      cleanContext[key] = `${value}`
    }
  }

  if (hydroAnalyticsClient) {
    const typeWithFallback = type || 'unknown'
    const fullContext = extendBaseContext(cleanContext)
    if (page) {
      sendEventWithPage(typeWithFallback, fullContext, page)
    } else if (batched) {
      hydroAnalyticsClient.sendBatchedEvent(typeWithFallback, fullContext)
    } else {
      hydroAnalyticsClient.sendEvent(typeWithFallback, fullContext)
    }

    if (process.env.NODE_ENV === 'development') {
      debugSendEvent(typeWithFallback, fullContext)
    }

    if (getItem('stats-dev-logger') === 'true') {
      logSendEvent(typeWithFallback, fullContext)
    }
  }
}

function sendEventWithPage(eventType: string, eventContext: Context, eventPage: string) {
  if (!hydroAnalyticsClient) return

  const normalizedPage =
    typeof window === 'undefined' ? eventPage : new URL(eventPage, window.location.origin).toString()
  const event = {
    page: normalizedPage,
    title: ssrSafeDocument?.title ?? '',
    context: eventContext,
    type: eventType,
  }

  // The underlying client otherwise reads `location.href` into the top-level page field.
  ;(hydroAnalyticsClient as unknown as HydroPayloadSender).send({events: [event]})
}

export function stringifyObjectValues(obj: object) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, JSON.stringify(v)]))
}

function debugSendEvent(type: string, context: Context) {
  if (getItem('hydro-debug.send-event') === 'true') {
    // eslint-disable-next-line no-console
    console.group('[hydro-debug.send-event]')
    // eslint-disable-next-line no-console
    console.log({type, context})
    performance.mark('hydroAnalytics#sendEvent', {detail: {type, context}})
    // eslint-disable-next-line no-console
    console.groupEnd()
  }
}
