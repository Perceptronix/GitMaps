import {onFCP, onLCP, onTTFB} from 'web-vitals/attribution'
import {sendTimingResults, sendVitals, sendICV} from './timing-stats'
import {ssrSafeDocument} from '@github-ui/ssr-utils'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {HPCObserver} from './hpc'
import {INPObserver} from './inp/observer'
import {ElementTimingObserver} from './element-timing/observer'
import {ContainerTimingObserver} from './container-timing/observer'
import {observeLongTasks} from './long-tasks'
import {observeLongAnimationFrames} from './long-animation-frames'
import {CLSObserver} from './cls/observer'
import {setGlobalINPObserver} from './web-vitals'
import {initMemorySampling} from './memory-sampling'
import {observeICV} from './icv/observe-icv'
import {isSyntheticPerfTest} from '@github-ui/browser-detection/is-synthetic-perf-test'
import {isAutomatedSession, isSessionSampledForDatadog, isStaff, sendCustomMetric} from '@github-ui/stats'
import {observeRageClicks} from './rage-clicks'
import {observeTypingLatency} from './typing-latency'
import {observeDeadClicks} from './dead-clicks'
import {isFeatureEnabled} from '@github-ui/feature-flags'

/**
 * Inject the synthetic-test meta tag if this page is loaded by the
 * synthetic perf benchmark runner (Playwright + GitHubSyntheticPerf UA).
 *
 * Must run before any web-vitals observer fires so that the first
 * vital (FCP) gets tagged with synthetic:true in sendVitals().
 */
function injectSyntheticPerfMetaIfNecessary(): void {
  if (isSyntheticPerfTest() && !document.querySelector('meta[name="synthetic-test"]')) {
    const meta = document.createElement('meta')
    meta.name = 'synthetic-test'
    meta.content = 'true'
    document.head.appendChild(meta)
  }
}
let isSetUp = false

export function __resetForTesting() {
  isSetUp = false
}

export function setupWebVitals() {
  if (isSetUp) return
  isSetUp = true
  injectSyntheticPerfMetaIfNecessary()

  // Emit a session-type counter so we can monitor the ratio of sampled/unsampled/automated/staff sessions in Datadog.
  const sessionType = isAutomatedSession()
    ? 'automated'
    : isStaff()
      ? 'staff'
      : isSessionSampledForDatadog()
        ? 'sampled'
        : 'unsampled'
  sendCustomMetric({name: 'BROWSER_VITALS_SESSION', value: 1, tags: {type: sessionType}}, false, 1)

  sendTimingResults()
  onFCP(sendVitals)
  onLCP(sendVitals)
  onTTFB(sendVitals)
  observeLongTasks()
  observeLongAnimationFrames()

  observeRageClicks()
  observeTypingLatency()
  observeDeadClicks()

  // Initialize memory sampling (10% of sessions, Chrome only)
  const memorySamplingCleanup = initMemorySampling(0.1)

  const inpObserver = new INPObserver(sendVitals)
  setGlobalINPObserver(inpObserver)
  inpObserver.observe()

  const clsObserver = new CLSObserver(sendVitals)
  clsObserver.observe()

  const etObserver = new ElementTimingObserver(sendVitals)
  etObserver.observe()

  // Container Timing is a trial that runs in parallel to HPC for surfaces
  // that opt in via the `containertiming` attribute (currently issues-react
  // + issue-viewer). The observer no-ops on UAs that don't support the
  // `'container'` PerformanceObserver entry type, so it's safe to
  // construct unconditionally.
  const containerTimingObserver = new ContainerTimingObserver()
  containerTimingObserver.observe()

  // Start HPC at page load. `soft`, `mechanism`, and `hpcStart` come from
  // the shared `softNavSession`, which owns the SOFT_NAV_STATE.START /
  // REPLACE_MECHANISM listeners. HPC just needs to be torn down and
  // re-created per nav so its mutation observer + insertion state reset.
  let hpcObserver = new HPCObserver({latestHPCElement: null, callback: sendVitals})
  hpcObserver.connect()
  ssrSafeDocument?.addEventListener(SOFT_NAV_STATE.START, () => {
    hpcObserver.disconnect()
    hpcObserver = new HPCObserver({
      latestHPCElement: document.querySelector('[data-hpc]'),
      callback: sendVitals,
    })
    hpcObserver.connect()
  })

  // Clean up memory sampling on page unload
  ssrSafeDocument?.addEventListener('pagehide', () => {
    memorySamplingCleanup()
  })

  // ICV: Track interaction-content-visible for in-page interactions.
  // Runs continuously, measuring every click that triggers a network fetch + DOM update.
  if (isFeatureEnabled('icv_observer')) {
    observeICV(sendICV)
  }
}
