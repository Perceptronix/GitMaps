import {ssrSafeDocument, IS_SERVER, wasServerRendered} from '@github-ui/ssr-utils'
import {loaded} from '@github-ui/document-ready'
import {bundler} from '@github-ui/runtime-environment'
import {isFeatureEnabled} from '@github-ui/feature-flags'
import {isSyntheticPerfTest} from '@github-ui/browser-detection/is-synthetic-perf-test'
import {isAutomatedBrowser as detectAutomatedBrowser} from '@github-ui/browser-detection/is-automated-browser'
import {isLoggedIn} from '@github-ui/client-env'
import {throttle} from '@github/mini-throttle'
import {CUSTOM_METRIC_REGISTRY, type CustomMetricKey} from './registry'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {getCurrentReactAppName} from '@github-ui/stats-metadata'
import {logSendStats} from './dev-logger'

// eslint-disable-next-line no-barrel-files/no-barrel-files
export type {CustomMetricKey}

// Session-level decisions: evaluated lazily on first access and cached for
// the session lifetime. Lazy evaluation is intentional — calling
// isFeatureEnabled() at module scope breaks SSR where the client feature-flag
// environment isn't loaded yet. Math.random() is similarly deferred so the
// coin-flip only happens in the browser.
let _automatedSession: boolean | undefined
let _sessionSampledForDatadog: boolean | undefined

/**
 * Detects if the current browser is automated (bot, crawler, or testing framework).
 * Automated browsers produce non-representative metrics.
 *
 * Feature flag: suppress_automated_browser_vitals
 */
export function isAutomatedBrowser(): boolean {
  if (!isFeatureEnabled('suppress_automated_browser_vitals')) {
    return false
  }
  return detectAutomatedBrowser()
}

export function isAutomatedSession(): boolean {
  if (_automatedSession === undefined) {
    _automatedSession = isAutomatedBrowser()
  }
  return _automatedSession
}

export function isSessionSampledForDatadog(): boolean {
  if (_sessionSampledForDatadog === undefined) {
    // Synthetic performance tests always report to Datadog — they need
    // 100% sampling to produce reliable aggregate metrics.
    if (isSyntheticPerfTest()) {
      _sessionSampledForDatadog = true
    } else {
      _sessionSampledForDatadog = !isAutomatedSession() && (isStaff() || Math.random() < 0.5)
    }
  }
  return _sessionSampledForDatadog
}

let stats: PlatformBrowserStat[] = []
const chunkSize = 64 * 1024

function currentReactAppName(override?: string): string {
  return override || getCurrentReactAppName() || 'rails'
}

// Load app state when hard navigating
let appName = currentReactAppName()
let renderIsSSR = wasServerRendered()

// At this point the new page/app is already present in the DOM
ssrSafeDocument?.addEventListener(SOFT_NAV_STATE.RENDER, () => {
  appName = currentReactAppName()
  renderIsSSR = wasServerRendered()
})

// Allow react apps to update the app name and SSR status before navigation finishes
export function updateCurrentApp(name?: string, ssr?: boolean) {
  appName = currentReactAppName(name)
  renderIsSSR = ssr ?? wasServerRendered()
}

export function sendCustomMetric(
  {
    name,
    value,
    tags,
    requestUrl,
  }: {
    name: CustomMetricKey
    value: number
    tags?: PlatformBrowserCustomMetricTags
    requestUrl?: string
  },
  flushImmediately?: boolean,
  samplingProbability?: number,
): void {
  const customMetric = CUSTOM_METRIC_REGISTRY[name]
  sendStats(
    {
      requestUrl,
      customMetric: {
        ...customMetric,
        value,
        tags,
      },
      ui: bundler === 'vite-tss' ? true : false,
    },
    flushImmediately,
    samplingProbability,
  )
}

export function sendStats(stat: PlatformBrowserStat, flushImmediately = false, samplingProbability?: number): void {
  if (IS_SERVER || isFeatureEnabled('browser_stats_disabled') === true) {
    return
  }
  const effectiveProbability = samplingProbability ?? (isSessionSampledForDatadog() ? 1 : 0)
  if (effectiveProbability < 0 || effectiveProbability > 1) {
    throw new RangeError('Sampling probability must be between 0 and 1')
  }

  if (stat.timestamp === undefined) stat.timestamp = Date.now()
  stat.loggedIn = isLoggedIn()
  stat.staff = isStaff()
  stat.bundler = bundler
  stat.ui = bundler === 'vite-tss' ? true : false
  stat.app = appName
  stat.ssr = String(renderIsSSR)
  if (isPassThrough()) {
    stat.passThrough = true
  }

  if (isDevLoggerEnabled()) {
    logSendStats(stat)
  }

  if (Math.random() < effectiveProbability) {
    stats.push(stat)
  }

  if (flushImmediately) {
    flushStats()
  } else {
    throttledScheduleSendStats()
  }
}

let queued: number | null = null

const throttledScheduleSendStats = throttle(async function scheduleSendStats() {
  await loaded
  if (queued == null) {
    queued = window.requestIdleCallback(flushStats)
  }
}, 5000)

function flushStats() {
  queued = null
  if (!stats.length) {
    return
  }

  const url = ssrSafeDocument?.head?.querySelector<HTMLMetaElement>('meta[name="browser-stats-url"]')?.content
  if (!url) {
    return
  }

  const batches = getBatches(stats)

  for (const batch of batches) {
    safeSend(url, `{"stats": [${batch.join(',')}], "target": "${getUITarget()}"}`)
  }

  stats = []
}

// getBatches breaks up the list of stats into smaller batches
// that are less than 64kb in size. This is to avoid hitting the
// size limit of the beacon API.
function getBatches(items: PlatformBrowserStat[]): string[][] {
  const batches: string[][] = []
  const itemStrings = items.map(item => JSON.stringify(item))

  while (itemStrings.length > 0) {
    batches.push(makeBatch(itemStrings))
  }

  return batches
}

// makeBatch walks the items and collects batches of items that are within
// the 64kb limit. If an item is too big to fit in a batch, it is sent alone.
function makeBatch(itemStrings: string[]): string[] {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const firstItem = itemStrings.shift()!
  const batch: string[] = [firstItem]
  let size = firstItem.length

  while (itemStrings.length > 0 && size <= chunkSize) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const nextItemSize = itemStrings[0]!.length

    if (size + nextItemSize <= chunkSize) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const itemString = itemStrings.shift()!
      batch.push(itemString)
      size += nextItemSize
    } else {
      break
    }
  }

  return batch
}

function safeSend(url: string, data: string) {
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, data)
    }
  } catch {
    // Silently ignore errors: https://github.com/github/github/issues/178088#issuecomment-829936461
  }
}

export function isStaff(): boolean {
  return !!ssrSafeDocument?.head?.querySelector<HTMLMetaElement>('meta[name="user-staff"]')?.content
}

// Pages rendered by dotcom but proxied ("passed through") by the UI Service set
// this meta tag (see app/views/layouts/_head.html.erb in dotcom). It lets us
// measure the cost of pass-through traffic separately from pages the UI Service
// renders itself.
export function isPassThrough(): boolean {
  return ssrSafeDocument?.head?.querySelector<HTMLMetaElement>('meta[name="ui-pass-through"]')?.content === 'true'
}

function getUITarget() {
  return ssrSafeDocument?.head?.querySelector<HTMLMetaElement>('meta[name="ui-target"]')?.content || 'full'
}

// Read the dev-logger flag directly from localStorage to avoid a circular dependency: safe-storage imports
// stats for metrics, so stats cannot import safe-storage.
function isDevLoggerEnabled(): boolean {
  try {
    return globalThis.localStorage?.getItem('stats-dev-logger') === 'true'
  } catch {
    return false
  }
}

// Flush stats before users navigate away from the page
ssrSafeDocument?.addEventListener('pagehide', flushStats)
ssrSafeDocument?.addEventListener('visibilitychange', flushStats)
