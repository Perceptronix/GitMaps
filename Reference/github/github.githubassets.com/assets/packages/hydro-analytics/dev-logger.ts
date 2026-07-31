// Dev-only console logger for sendEvent (Hydro) calls.
// Uses styled console groups so events are easy to scan, filter, and expand in browser DevTools.

const EVENT_BADGE_STYLE =
  'background: #8957e5; color: #fff; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 11px;'
const LABEL_STYLE = 'font-weight: bold; font-size: 12px;'

// Base context fields injected by extendBaseContext — noisy at dev time
const BASE_CONTEXT_KEYS = new Set([
  'actor_id',
  'actor_login',
  'actor_hash',
  'referrer',
  'request_id',
  'visitor_id',
  'region_edge',
  'region_render',
  'staff',
  'service',
  'react',
  'app_name',
  'page',
  'title',
])

// Web vital metric keys that contain JSON-encoded objects
const WEB_VITAL_KEYS = new Set([
  'hpc',
  'ttfb',
  'fcp',
  'lcp',
  'fid',
  'inp',
  'cls',
  'elementtiming',
  'longTasks',
  'longAnimationFrames',
])

// Web vital context keys that are scalar (not JSON objects) but still part of web-vital events
const WEB_VITAL_META_KEYS = new Set([
  'react',
  'reactApp',
  'reactPartials',
  'featureFlags',
  'ssr',
  'controller',
  'action',
  'routePattern',
  'cpu',
  'domNodes',
  'previousDomNodes',
  'navigationId',
])

function tryParseJSON(str: string): unknown {
  try {
    return JSON.parse(str)
  } catch {
    return str
  }
}

function formatHeaderValue(value: string): string {
  const parsed = tryParseJSON(value)
  return typeof parsed === 'number' ? String(Math.round(parsed)) : String(parsed)
}

/**
 * Log a sendEvent (Hydro) call with a styled collapsed console group.
 * Shows target and custom fields prominently; base context is hidden in a sub-group.
 */
export function logSendEvent(type: string, context: Record<string, string> = {}): void {
  const customEntries: Array<[string, unknown]> = []

  for (const [key, value] of Object.entries(context)) {
    if (!BASE_CONTEXT_KEYS.has(key)) {
      customEntries.push([key, tryParseJSON(value)])
    }
  }

  const headerValue = context.value !== undefined ? ` ${formatHeaderValue(context.value)}` : ''
  // eslint-disable-next-line no-console
  console.groupCollapsed(`%cevent%c ${type}${headerValue}`, EVENT_BADGE_STYLE, LABEL_STYLE)

  if (type === 'web-vital') {
    logWebVitalEvent(customEntries)
  } else {
    // eslint-disable-next-line no-console -- table format needs a single value column
    console.table(Object.fromEntries(customEntries.map(([k, v]) => [k, {value: v}])))

    // eslint-disable-next-line no-console -- log it again so engineers can dive deep into objects and arrays
    console.log(Object.fromEntries(customEntries))
  }

  // eslint-disable-next-line no-console
  console.groupEnd()
}

function logWebVitalEvent(entries: Array<[string, unknown]>): void {
  for (const [key, value] of entries) {
    if (WEB_VITAL_KEYS.has(key)) {
      // eslint-disable-next-line no-console
      console.log(`%c${key}`, LABEL_STYLE)
      // eslint-disable-next-line no-console
      console.table(value)
    } else if (!WEB_VITAL_META_KEYS.has(key)) {
      // eslint-disable-next-line no-console
      console.log(`${key}:`, value)
    }
  }
}
