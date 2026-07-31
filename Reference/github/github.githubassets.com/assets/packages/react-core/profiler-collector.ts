import type {CustomMetricKey} from '@github-ui/stats'
import {sendCustomMetric} from '@github-ui/stats'
import {getCurrentReactAppName} from '@github-ui/stats-metadata'
import {type ProfilerOnRenderCallback, useMemo, version} from 'react'

import {isReactProfilerEnabled} from './profiler-config'

interface BaseProfileMetricsParams {
  actualDuration: number
  baseDuration: number
  commitLag: number
  phase: string
  appName: string
  isDataRouterEnabled: boolean
}

interface RouteProfileMetricsParams extends BaseProfileMetricsParams {
  routeId: string
}

type MetricKeys = {
  actualDuration: CustomMetricKey
  baseDuration: CustomMetricKey
  commitLag: CustomMetricKey
  renderEfficiency: CustomMetricKey
}

const APP_METRIC_KEYS: MetricKeys = {
  actualDuration: 'BROWSER_REACT_PROFILER_APP_ACTUAL_DURATION',
  baseDuration: 'BROWSER_REACT_PROFILER_APP_BASE_DURATION',
  commitLag: 'BROWSER_REACT_PROFILER_APP_COMMIT_LAG',
  renderEfficiency: 'BROWSER_REACT_PROFILER_APP_RENDER_EFFICIENCY',
}

const ROUTE_METRIC_KEYS: MetricKeys = {
  actualDuration: 'BROWSER_REACT_PROFILER_ROUTE_ACTUAL_DURATION',
  baseDuration: 'BROWSER_REACT_PROFILER_ROUTE_BASE_DURATION',
  commitLag: 'BROWSER_REACT_PROFILER_ROUTE_COMMIT_LAG',
  renderEfficiency: 'BROWSER_REACT_PROFILER_ROUTE_RENDER_EFFICIENCY',
}

// Phase-specific sampling rates (applied AFTER user enablement)
// These rates control per-render sampling for enabled users
const PHASE_SAMPLE_RATES = {
  mount: 0.2, // 20% - important but still frequent at scale
  update: 0.02, // 2% - extremely high volume, aggressive sampling
  'nested-update': 0.2, // 20% - important signal for perf issues
} as const satisfies Record<string, number>

// Always capture slow renders regardless of sampling
// These thresholds ensure we never miss performance problems
const SLOW_THRESHOLDS = {
  mount: 50, // 50ms mount is slow
  update: 32, // 32ms update (2 frames) - avoid noise from single-frame jank
  'nested-update': 16, // nested updates are already suspicious
} as const satisfies Record<string, number>
// Commit lag threshold - always capture high commit lag
const COMMIT_LAG_THRESHOLD = 50 // ms - main thread blocked for 50ms+

// Maximum time (ms) to wait before forcing requestIdleCallback to execute.
// This ensures metrics are sent even on busy pages, while still deferring
// to idle time when possible. 2 seconds balances "not urgent" telemetry
// with avoiding data loss on quick navigations.
const IDLE_CALLBACK_TIMEOUT = 2000

function shouldSample(
  phase: 'mount' | 'update' | 'nested-update',
  actualDuration: number,
  commitLag: number,
  sessionSampleKey: number,
): boolean {
  // Always capture slow renders
  const slowThreshold = SLOW_THRESHOLDS[phase] ?? 50
  if (actualDuration > slowThreshold) {
    return true
  }

  // Always capture high commit lag (main thread contention)
  if (commitLag > COMMIT_LAG_THRESHOLD) {
    return true
  }

  // Phase-based sampling for normal renders
  const sampleRate = PHASE_SAMPLE_RATES[phase]
  return sessionSampleKey < sampleRate
}

function sendAllProfilerMetrics(
  keys: MetricKeys,
  tags: Record<string, string>,
  actualDuration: number,
  baseDuration: number,
  commitLag: number,
): void {
  const requestUrl = window.location.href

  sendCustomMetric({name: keys.actualDuration, value: actualDuration, tags, requestUrl}, false, 1)
  sendCustomMetric({name: keys.baseDuration, value: baseDuration, tags, requestUrl}, false, 1)
  sendCustomMetric({name: keys.commitLag, value: commitLag, tags, requestUrl}, false, 1)
  // Render efficiency: actualDuration / baseDuration
  if (baseDuration > 0) {
    sendCustomMetric({name: keys.renderEfficiency, value: actualDuration / baseDuration, tags, requestUrl}, false, 1)
  }
}

function sendAppProfileMetrics({
  actualDuration,
  baseDuration,
  commitLag,
  phase,
  appName,
  isDataRouterEnabled,
}: BaseProfileMetricsParams): void {
  const tags = {
    phase,
    appName,
    isDataRouterEnabled: String(isDataRouterEnabled),
    reactVersion: version,
    subAppName: getCurrentReactAppName() ?? appName,
  }
  sendAllProfilerMetrics(APP_METRIC_KEYS, tags, actualDuration, baseDuration, commitLag)
}

function sendRouteProfileMetrics({
  actualDuration,
  baseDuration,
  commitLag,
  phase,
  appName,
  isDataRouterEnabled,
  routeId,
}: RouteProfileMetricsParams): void {
  const tags = {
    phase,
    appName,
    routeId,
    isDataRouterEnabled: String(isDataRouterEnabled),
    reactVersion: version,
    subAppName: getCurrentReactAppName() ?? appName,
  }
  sendAllProfilerMetrics(ROUTE_METRIC_KEYS, tags, actualDuration, baseDuration, commitLag)
}

// Session-stable sample key - generated once per session (client-side only)
let sessionSampleKey: number | null = null
function getSessionSampleKey(): number {
  // Don't generate sample key on server - return value that skips sampling
  if (typeof window === 'undefined') {
    return 1
  }
  if (sessionSampleKey === null) {
    sessionSampleKey = Math.random()
  }
  return sessionSampleKey
}

/**
 * Resets the session sample key.
 * Only intended for testing purposes.
 */
export function resetSessionSampleKey(): void {
  sessionSampleKey = null
}

// No-op callback for when profiling is disabled
const noopCallback: ProfilerOnRenderCallback = () => {}

// Memoized no-op result to avoid creating new objects
const DISABLED_RESULT = {
  onAppRender: noopCallback,
  onRouteRender: noopCallback,
  isEnabled: false,
} as const

export function useAppScopedProfilerCollector({
  appName,
  isDataRouterEnabled,
}: {
  appName: string
  isDataRouterEnabled: boolean
}) {
  return useMemo(() => {
    // Check enablement inside useMemo to avoid module-level evaluation.
    // isProfilerEnabled() accesses window, feature flags, and client env which
    // aren't available during SSR or when the module is imported before client
    // environment is initialized.
    if (!isReactProfilerEnabled()) {
      return DISABLED_RESULT
    }

    const onAppRender: ProfilerOnRenderCallback = (_id, phase, actualDuration, baseDuration, startTime, commitTime) => {
      // Defer all profiler work to idle time to avoid blocking the render path
      requestIdleCallback(
        () => {
          const commitLag = commitTime - startTime

          if (!shouldSample(phase, actualDuration, commitLag, getSessionSampleKey())) {
            return
          }

          sendAppProfileMetrics({
            actualDuration,
            baseDuration,
            commitLag,
            phase,
            appName,
            isDataRouterEnabled,
          })
        },
        {timeout: IDLE_CALLBACK_TIMEOUT},
      )
    }

    const onRouteRender: ProfilerOnRenderCallback = (
      id,
      phase,
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
    ) => {
      // Defer all profiler work to idle time to avoid blocking the render path
      requestIdleCallback(
        () => {
          const commitLag = commitTime - startTime

          if (!shouldSample(phase, actualDuration, commitLag, getSessionSampleKey())) {
            return
          }

          sendRouteProfileMetrics({
            actualDuration,
            baseDuration,
            commitLag,
            phase,
            appName,
            isDataRouterEnabled,
            routeId: id,
          })
        },
        {timeout: IDLE_CALLBACK_TIMEOUT},
      )
    }

    return {
      onAppRender,
      onRouteRender,
      isEnabled: true,
    }
  }, [appName, isDataRouterEnabled])
}
