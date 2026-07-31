import {useRouteError} from '@github-ui/react-router'
import {type ComponentType, isValidElement, type ReactNode} from 'react'

import type {ResponseError} from './response-error'
import {isResponseError} from './response-error'
import {useReportRouteError} from './use-report-route-error'
import {useSetTitleOnResponseError} from './use-set-title-on-response-error'

/**
 * Props passed to a fallback component rendered by a boundary created with
 * {@link createRouteErrorBoundary}. Lets a fallback tailor its messaging to the
 * caught error (e.g. by HTTP status) without re-reading the route error itself.
 */
export interface RouteErrorBoundaryFallbackProps {
  /** The route error caught by the boundary. */
  error: unknown
  /** The caught error narrowed to a `ResponseError`, or `null` when it isn't one. */
  responseError: ResponseError | null
}

export interface CreateRouteErrorBoundaryOptions {
  /**
   * Presentational UI rendered when the boundary catches an error. Pass an
   * element for static fallbacks, or a component to receive the caught error
   * via {@link RouteErrorBoundaryFallbackProps}.
   */
  fallback: ReactNode | ComponentType<RouteErrorBoundaryFallbackProps>
  /**
   * Mark caught errors as critical failures in failbot. Critical errors signal
   * a significant feature failure that should be prioritized. Defaults to `true`,
   * since a route-level boundary catching an error means the route failed to render.
   */
  critical?: boolean
  /**
   * Name reported to failbot as `reactErrorBoundaryName`, used to identify which
   * boundary caught the error in logs. Recommended so route failures are
   * attributable to a feature/route.
   */
  boundaryName?: string
  /**
   * App name reported to failbot as `reactAppName`. Defaults to the active
   * `AnalyticsContext` app, matching the component-level `ErrorBoundary`.
   */
  reactAppName?: string
  /**
   * Optional predicate: when provided, gates failbot reporting after the built-in
   * 404 skip and `shouldSkipReport` checks. Use to suppress known non-critical
   * errors that should render the fallback without emitting a failbot report.
   * When omitted, all non-404, non-skipped errors are reported.
   */
  shouldReport?: (error: unknown) => boolean
  /**
   * When `true`, a caught `ResponseError` updates the browser tab title via
   * `useSetTitleOnResponseError` (e.g. "404 Page not found", "500 Internal server
   * error"). Defaults to `false` so nested subroute boundaries do not clobber the
   * page title — only a boundary that owns the full page (e.g. a top-level layout
   * boundary) should opt in.
   */
  setDocumentTitleOnResponseError?: boolean
}

function isComponentFallback(
  fallback: CreateRouteErrorBoundaryOptions['fallback'],
): fallback is ComponentType<RouteErrorBoundaryFallbackProps> {
  // Plain functions are components. `memo`/`lazy`/`forwardRef` are exotic *objects* that are
  // still valid component types, so a bare `typeof === 'function'` check would misrender them
  // as a child. A `ReactNode` element is caught by `isValidElement`, and strings/numbers/arrays
  // lack a React `$$typeof`, so both fall through to render as-is.
  if (typeof fallback === 'function') return true
  return typeof fallback === 'object' && fallback !== null && !isValidElement(fallback) && '$$typeof' in fallback
}

function FallbackContent({
  fallback,
  ...props
}: RouteErrorBoundaryFallbackProps & {fallback: CreateRouteErrorBoundaryOptions['fallback']}) {
  if (isComponentFallback(fallback)) {
    const Fallback = fallback
    return <Fallback {...props} />
  }
  return fallback
}

function ResponseErrorTitleEffect({responseError}: {responseError: ResponseError}) {
  useSetTitleOnResponseError(responseError)
  return null
}

/**
 * Builds a route-level error boundary that restores the reporting affordances
 * lost when a bare presentational component is used as a route `ErrorBoundary`.
 *
 * Route boundaries (React Router `errorElement` / TanStack Router `errorComponent`)
 * are caught by the router rather than the React tree, so React 19's root
 * `onCaughtError` never runs for them — meaning `critical`, `boundaryName`, and
 * even the base failbot report are dropped. This factory re-adds them: it reads
 * the caught error via `useRouteError()` (native in React Router, provided by the
 * TanStack adapter's `RouteErrorContext`), reports it through the shared
 * dedup WeakSet, sets the document title for `ResponseError`s, and renders the
 * supplied presentational fallback. The returned component works unchanged in
 * both the React Router and TanStack Router paths.
 *
 * Most routes should reach for `QueryRoute#toRoute`'s `errorBoundary` option, which
 * calls this factory and defaults `boundaryName` to the route id. Call this directly
 * when you need the boundary outside of `toRoute` (e.g. a hand-built `RouteObject`).
 *
 * @example
 * ```tsx
 * // Preferred: let `toRoute` build and name the boundary from the route id.
 * route.toRoute({Component, errorBoundary: {fallback: <MyErrorState />, critical: true}})
 *
 * // Escape hatch: render a fully custom boundary directly via `toRoute`.
 * route.toRoute({Component, errorBoundary: {override: MyCustomBoundary}})
 *
 * // Direct: construct the boundary yourself when not going through `toRoute`.
 * const RouteErrorBoundary = createRouteErrorBoundary({
 *   fallback: <MyErrorState />,
 *   critical: true,
 *   boundaryName: 'my-feature',
 * })
 * ```
 */
export function createRouteErrorBoundary({
  fallback,
  critical = true,
  boundaryName,
  reactAppName,
  shouldReport,
  setDocumentTitleOnResponseError = false,
}: CreateRouteErrorBoundaryOptions): ComponentType {
  function RouteErrorBoundary() {
    const routeError = useRouteError()
    useReportRouteError(routeError, {critical, boundaryName, reactAppName, shouldReport})

    const responseError = isResponseError(routeError) ? routeError : null

    return (
      <>
        {setDocumentTitleOnResponseError && responseError ? (
          <ResponseErrorTitleEffect responseError={responseError} />
        ) : null}
        <FallbackContent fallback={fallback} error={routeError} responseError={responseError} />
      </>
    )
  }

  RouteErrorBoundary.displayName = boundaryName ? `RouteErrorBoundary(${boundaryName})` : 'RouteErrorBoundary'
  return RouteErrorBoundary
}
