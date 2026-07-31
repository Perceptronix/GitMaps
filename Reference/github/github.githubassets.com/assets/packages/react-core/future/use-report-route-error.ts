import {AnalyticsContext} from '@github-ui/analytics-provider/context'
// eslint-disable-next-line no-restricted-imports
import {reportError} from '@github-ui/failbot'
import {isRouteErrorResponse} from '@github-ui/react-router'
import {use, useEffect, useEffectEvent} from 'react'

const reportedErrors = new WeakSet<object>()

/**
 * Dedupes error reporting for a single error *object*. React StrictMode (and router
 * rerenders) can invoke a boundary's reporting effect more than once for the same caught
 * error; the shared WeakSet ensures failbot only hears about it once — including across the
 * root boundary and any route-level boundary, since they all consult this same set.
 *
 * Only objects/functions can live in a `WeakSet`, so primitive throws are handled by the
 * caller (see {@link useReportRouteError}).
 */
export function handleIfNotReported<T extends object>(error: T, report: (err: T) => void) {
  if (!reportedErrors.has(error)) {
    reportedErrors.add(error)
    report(error)
  }
}

/**
 * Whether an error is a routine 404 "not found" rather than an app failure worth reporting.
 *
 * A 404 `ErrorResponse` reaches a boundary two ways: the router synthesizes one for an
 * unmatched URL (the TanStack adapter mints a fresh `{status: 404}` on every render of
 * `notFoundComponent`), or a loader throws one deliberately for a missing resource
 * (`throw new Response(null, {status: 404})`). Both are expected user-facing states rather than
 * crashes — reporting them floods failbot with noise, and the synthesized ones re-report on
 * every rerender since each has a new identity that defeats the WeakSet dedup.
 *
 * This is deliberately broad: it suppresses *all* 404 `ErrorResponse`s. A route that genuinely
 * needs a 404 reported should throw a real error rather than an `ErrorResponse`.
 */
function isExpectedRouterNotFound(error: unknown): boolean {
  return isRouteErrorResponse(error) && error.status === 404
}

export interface ReportRouteErrorOptions {
  /**
   * Mark the caught error as a critical failbot failure. Defaults to `true`: a route- or
   * router-level boundary firing means the page/route failed to render.
   */
  critical?: boolean
  /** Reported to failbot as `reactErrorBoundaryName` so failures are attributable. */
  boundaryName?: string
  /**
   * Reported to failbot as `reactAppName`. Defaults to the active `AnalyticsContext` app,
   * matching the component-level `ErrorBoundary`.
   */
  reactAppName?: string
  /** Label used for the development-only `console.error`. Defaults to a generic route label. */
  devLogLabel?: string
  /**
   * Optional predicate called after the built-in 404 and `shouldSkipReport` checks. When
   * provided, reporting is suppressed when the predicate returns `false`. Use to gate known
   * non-critical errors that should render the fallback without emitting a failbot report.
   * When omitted, all non-404, non-skipped errors are reported.
   */
  shouldReport?: (error: unknown) => boolean
}

/**
 * Shared reporting wiring for route-level and router-level error boundaries.
 *
 * Route boundaries (React Router `errorElement` / TanStack `errorComponent`) are caught by
 * the router, not the React tree, so React 19's root `onCaughtError` never runs for them and
 * the base failbot report — plus its `critical` / `boundaryName` / `reactAppName` metadata —
 * is silently dropped. This hook restores that consistently for every boundary:
 *
 * - dedupes object throws via the shared {@link handleIfNotReported} WeakSet, so it never
 *   double-reports with the root boundary or across StrictMode rerenders,
 * - reports primitive throws (`throw 'boom'`, `throw 0`) directly, since a WeakSet can't hold
 *   them,
 * - suppresses 404 "not found" responses (whether the router synthesized one for an unmatched
 *   URL or a loader threw one), which are expected states rather than app failures,
 * - honors an error's `shouldSkipReport` opt-out (e.g. a known-degraded backend),
 * - and logs to the console in development.
 *
 * It intentionally does **not** reuse `useReportErrorContext`: that hook is an *imperative*
 * reporter for async/event-handler errors and requires a `ReportErrorContextProvider`
 * ancestor, whereas boundaries render at the router seam (often outside such a provider),
 * report *declaratively* when the caught error changes, and need to attach
 * `reactErrorBoundaryName`. Both paths still funnel through the same `handleIfNotReported`
 * WeakSet, so a report can never be double-counted between them.
 *
 * @param error The caught route error (from `useRouteError()` or an `errorComponent` prop).
 */
export function useReportRouteError(error: unknown, options: ReportRouteErrorOptions = {}): void {
  const {critical = true, boundaryName, devLogLabel, shouldReport} = options
  const analytics = use(AnalyticsContext)
  const reactAppName = options.reactAppName ?? analytics?.appName

  // The reporting decision lives in this effect event (the "event handler" for a caught error),
  // so it reads the latest options/app name without the effect reacting to them — the effect only
  // reacts to a newly-caught error.
  const report = useEffectEvent((caught: unknown) => {
    if (caught == null) return
    // A 404 response — whether the router synthesized it for an unmatched URL or a loader threw
    // it for a missing resource — is an expected "not found" state, not a crash worth reporting.
    if (isExpectedRouterNotFound(caught)) return
    // Respect errors that opt out of reporting (e.g. a known-degraded backend).
    if (typeof caught === 'object' && 'shouldSkipReport' in caught && caught.shouldSkipReport) return
    // Apply the caller-provided shouldReport gate, if any.
    if (shouldReport !== undefined && !shouldReport(caught)) return

    const send = (err: unknown) => {
      reportError(err, {critical, reactAppName, reactErrorBoundaryName: boundaryName})
      if (process.env.NODE_ENV === 'development') {
        const label = devLogLabel ?? (boundaryName ? `route error boundary (${boundaryName})` : 'route error boundary')
        // eslint-disable-next-line no-console
        console.error(`Error in ${label}`, err)
      }
    }

    // A WeakSet can only dedupe object/function identities; report primitives directly.
    if (typeof caught === 'object' || typeof caught === 'function') {
      handleIfNotReported(caught, send)
    } else {
      send(caught)
    }
  })

  useEffect(() => {
    report(error)
  }, [error])
}
