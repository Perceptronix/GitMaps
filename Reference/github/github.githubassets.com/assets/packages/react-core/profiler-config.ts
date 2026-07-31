import ReactProfilingMode from '@github-ui/react-profiling-mode'

/**
 * Determines if React Profiler should be enabled for this user session.
 *
 * Delegates to ReactProfilingMode which handles:
 * - Staff users: enabled by default (can opt-out for 24 hours)
 * - Production users: enabled for 2% randomly (session-stable)
 *
 * @returns true if profiling should be enabled, false otherwise
 */
export function isReactProfilerEnabled(): boolean {
  return ReactProfilingMode.isEnabled()
}

/**
 * Resets the cached enablement decision.
 * Only intended for testing purposes.
 */
export function resetProfilerEnabledCache(): void {
  ReactProfilingMode.resetCache()
}
