import {isFeatureEnabled} from '@github-ui/feature-flags'

const SYNTHETIC_PERF_UA_REGEX = /GitHubSyntheticPerf/i

let _isSyntheticPerfTest: boolean | undefined
/**
 * Detects if the current session is a GitHub synthetic performance test.
 * Requires BOTH conditions to prevent spoofing from regular browsers:
 *   1. `navigator.webdriver === true` — only set by real automation frameworks
 *   2. User-agent contains 'GitHubSyntheticPerf' — our specific benchmark signature
 *
 * The actual `<meta name="synthetic-test">` injection is handled by
 * `web-vitals/setup.ts` — this function only performs detection.
 *
 * Feature flag: synthetic_perf_vitals (kill switch — disable to stop bypass)
 */
export function isSyntheticPerfTest(): boolean {
  if (_isSyntheticPerfTest !== undefined) return _isSyntheticPerfTest

  if (typeof navigator === 'undefined') {
    _isSyntheticPerfTest = false
  } else if (!isFeatureEnabled('synthetic_perf_vitals')) {
    _isSyntheticPerfTest = false
  } else {
    _isSyntheticPerfTest = navigator.webdriver === true && SYNTHETIC_PERF_UA_REGEX.test(navigator.userAgent)
  }

  return _isSyntheticPerfTest
}

/** @internal Reset memoized value — for tests only */
export function resetIsSyntheticPerfTest(): void {
  _isSyntheticPerfTest = undefined
}
