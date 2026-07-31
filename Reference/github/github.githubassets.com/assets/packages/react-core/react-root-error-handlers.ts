import {getCookie} from '@github-ui/cookies'
import type {ErrorContext} from '@github-ui/failbot'
// eslint-disable-next-line no-restricted-imports
import {reportError} from '@github-ui/failbot'
import {sendStats} from '@github-ui/stats'
import type {ErrorInfo} from 'react'
import type {HydrationOptions, RootOptions} from 'react-dom/client'

import {ERROR_BOUNDARY_METADATA, type ErrorBoundaryMetadata} from './ErrorBoundary'
import {isDevelopmentOrStaffUser} from './is-development-or-is-staff-user'

/**
 * Options for creating React root error handlers.
 */
export interface ReactRootErrorHandlerOptions {
  /**
   * The name of the React application, used for error reporting context.
   *
   * Pass a string for static apps that mount one shell. Pass a function for apps
   * (such as the TanStack Start UI service) where the active app changes per route;
   * the function will be called at error time so the most current name is reported.
   */
  appName: string | (() => string | undefined)
  /**
   * Optional callback invoked when a recoverable hydration error occurs that should
   * be tracked as a hydration failure (i.e. unexpected invariants or non-Error values).
   * Expected hydration mismatches (React invariants 419 and 421) do not trigger this callback.
   */
  onHydrationError?: () => void
}

function resolveAppName(appName: ReactRootErrorHandlerOptions['appName']): string | undefined {
  return typeof appName === 'function' ? appName() : appName
}

/**
 * Props that may be present on an error boundary component.
 * This is a subset of ErrorBoundaryProps that doesn't require children,
 * since React's errorInfo.errorBoundary.props type doesn't include children.
 */
interface ErrorBoundaryLikeProps {
  critical?: boolean
  boundaryName?: string
  onError?: (error: Error, context?: ErrorContext) => void
  /** TanStack Router CatchBoundary has an onCatch instead of onError */
  onCatch?: (error: Error, context?: ErrorInfo) => void
}

/**
 * The error info object passed to React 19's error callbacks.
 * This type is compatible with React's internal typing while allowing
 * access to our ErrorBoundary-specific props.
 */
export interface ReactErrorInfo {
  componentStack?: string
  errorBoundary?: {
    props?: ErrorBoundaryLikeProps
    constructor?: {
      name?: string
    }
  }
}

const REACT_INVARIANT_ERROR_REGEX = /Minified React error #(?<invariant>\d+)/
const EXPECTED_INVARIANTS = [
  '419', // See https://react.dev/errors/419
  '421', // See https://react.dev/errors/421
]

/**
 * Creates the `onCaughtError` callback for React 19's `createRoot`/`hydrateRoot`.
 *
 * This callback is invoked when an error is caught by an Error Boundary.
 * It handles reporting to Sentry while respecting:
 * - Errors with `shouldSkipReport` flag (e.g., ES being down)
 * - Error Boundaries with custom `onError` handlers (they handle their own reporting)
 * - Critical vs non-critical error classification
 *
 * @param options - Configuration for the error handler
 * @returns A callback suitable for React 19's `onCaughtError` option
 *
 * @example
 * ```ts
 * import { createOnCaughtError, createOnUncaughtError } from '@github-ui/react-core/react-root-error-handlers'
 *
 * const root = createRoot(container, {
 *   onCaughtError: createOnCaughtError({ appName: 'my-app' }),
 *   onUncaughtError: createOnUncaughtError({ appName: 'my-app' }),
 * })
 * ```
 */
export function createOnCaughtError(options: ReactRootErrorHandlerOptions) {
  return (error: unknown, errorInfo: ReactErrorInfo) => {
    const appName = resolveAppName(options.appName)

    // Try to read props from the error boundary instance
    // Note: errorInfo.errorBoundary is the React component instance
    const boundaryProps = errorInfo.errorBoundary?.props

    // Also check for metadata attached to the error (fallback for componentDidCatch)
    const errorMetadata = (error as Error & {[ERROR_BOUNDARY_METADATA]?: ErrorBoundaryMetadata})[
      ERROR_BOUNDARY_METADATA
    ]

    // Prefer props from boundary instance, fall back to error metadata
    const critical = boundaryProps?.critical ?? errorMetadata?.critical ?? false
    const boundaryName =
      boundaryProps?.boundaryName ?? errorMetadata?.boundaryName ?? errorInfo.errorBoundary?.constructor?.name
    const hasOnError = typeof boundaryProps?.onError === 'function'
    const hasOnCatch = typeof boundaryProps?.onCatch === 'function'

    // Log in development or production for a staff user so caught errors are
    // still visible even when we skip Sentry reporting.
    if (isDevelopmentOrStaffUser()) {
      // eslint-disable-next-line no-console
      console.error('Error caught by boundary:', error)
      if (errorInfo.componentStack) {
        // eslint-disable-next-line no-console
        console.warn('componentStack', errorInfo.componentStack)
      }
    }

    // Skip reporting if:
    // 1. Error has shouldSkipReport flag (e.g., ES being down)
    // 2. Boundary has a custom onError handler (it handles reporting)
    // 3. Boundary has a custom onCatch handler (for TanStack Router — it handles its own reporting)
    if (error && typeof error === 'object' && 'shouldSkipReport' in error && error.shouldSkipReport) {
      return
    }
    if (hasOnError || hasOnCatch) {
      return
    }

    reportError(error, {
      critical,
      reactAppName: appName,
      reactErrorBoundaryName: boundaryName,
    })
  }
}

/**
 * Creates the `onUncaughtError` callback for React 19's `createRoot`/`hydrateRoot`.
 *
 * This callback is invoked when an error is thrown and NOT caught by any Error Boundary.
 * These are critical errors that will crash the app.
 *
 * @param options - Configuration for the error handler
 * @returns A callback suitable for React 19's `onUncaughtError` option
 *
 * @example
 * ```ts
 * import { createOnCaughtError, createOnUncaughtError } from '@github-ui/react-core/react-root-error-handlers'
 *
 * const root = createRoot(container, {
 *   onCaughtError: createOnCaughtError({ appName: 'my-app' }),
 *   onUncaughtError: createOnUncaughtError({ appName: 'my-app' }),
 * })
 * ```
 */
export function createOnUncaughtError(options: ReactRootErrorHandlerOptions) {
  return (error: unknown, errorInfo: ReactErrorInfo) => {
    const appName = resolveAppName(options.appName)

    // This is called when an error is thrown and NOT caught by any Error Boundary.
    // These are critical errors that will crash the app.
    reportError(error, {
      critical: true,
      reactAppName: appName,
    })

    // Log in development or production for a staff user
    if (isDevelopmentOrStaffUser()) {
      // eslint-disable-next-line no-console
      console.error('Error not caught by boundary:', error)
      if (errorInfo.componentStack) {
        // eslint-disable-next-line no-console
        console.warn('componentStack', errorInfo.componentStack)
      }
    }
  }
}

function createOnRecoverableError(options: ReactRootErrorHandlerOptions) {
  return (error: unknown, errorInfo: ReactErrorInfo) => {
    const appName = resolveAppName(options.appName)

    if (!(error instanceof Error)) {
      sendStats({
        incrementKey: 'REACT_HYDRATION_ERROR',
        incrementTags: {
          appName,
          invariant: 'non-error',
        },
        requestUrl: window.location.href,
      })
      if (isDevelopmentOrStaffUser()) {
        // eslint-disable-next-line no-console
        console.warn(`⚠️ Recoverable hydration error (non-Error value) - ${appName}:`, error)
      }
      options.onHydrationError?.()
      return
    }

    const match = REACT_INVARIANT_ERROR_REGEX.exec(error.message)
    const invariant = String(match?.groups?.invariant)
    const isExpected = EXPECTED_INVARIANTS.includes(invariant)
    if (!isExpected) {
      options.onHydrationError?.()
    }
    sendStats({
      incrementKey: 'REACT_HYDRATION_ERROR',
      incrementTags: {
        appName,
        invariant,
      },
      requestUrl: window.location.href,
    })

    /** Log hydration errors in development or production for a staff user */
    if (!isDevelopmentOrStaffUser()) return
    // eslint-disable-next-line no-console
    console.groupCollapsed(
      `%c${isExpected ? 'ℹ️' : '⚠️'} Recoverable hydration error - ${appName} - ${error.message}`,
      isExpected
        ? 'background: rgba(100, 149, 237, 0.2); font-weight: bold; padding: 4px; border: 1px solid rgba(100, 149, 237, 0.5); border-radius: 4px;'
        : 'background: rgba(255, 193, 7, 0.2); font-weight: bold; padding: 4px; border: 1px solid rgba(255, 193, 7, 0.5); border-radius: 4px;',
      isExpected
        ? 'This is an expected hydration mismatch and will not be reported as an error.'
        : 'This is only visible to staff users and is safe to ignore. Reach out to #react for help understanding and fixing these hydration errors',
    )
    if (process.env.NODE_ENV === 'development') {
      const isHydrationScanningEnabled = getCookie('hydrationScan')?.value !== 'false'
      if (isHydrationScanningEnabled) {
        const errorContainer = document.querySelector<HTMLElement>('#hydration-error-notice')
        const errorCounter = errorContainer?.querySelector<HTMLElement>('.js-hydration-error-count')
        if (errorContainer && errorCounter) {
          errorCounter.textContent = (parseInt(errorCounter.textContent || '0', 10) + 1).toString()
          errorContainer.hidden = false
        }
      }
    }
    if (error.cause) {
      // eslint-disable-next-line no-console
      console.warn('cause', error.cause)
    }
    if (errorInfo.componentStack) {
      // eslint-disable-next-line no-console
      console.warn('componentStack', errorInfo.componentStack)
    }
    // eslint-disable-next-line no-console
    console.groupEnd()
  }
}

/**
 * Creates both error callbacks for React 19's `createRoot`/`hydrateRoot`.
 *
 * This is a convenience function that returns both `onCaughtError` and `onUncaughtError`
 * callbacks configured for the given app name.
 *
 * @param options - Configuration for the error handlers
 * @returns An object containing both `onCaughtError` and `onUncaughtError` callbacks
 *
 * @example
 * ```ts
 * import { createReactRootErrorHandlers } from '@github-ui/react-core/react-root-error-handlers'
 *
 * const errorHandlers = createReactRootErrorHandlers({ appName: 'my-app' })
 * const root = createRoot(container, errorHandlers)
 * ```
 */
export function createReactRootErrorHandlers(options: ReactRootErrorHandlerOptions) {
  return {
    onCaughtError: createOnCaughtError(options),
    onUncaughtError: createOnUncaughtError(options),
    onRecoverableError: createOnRecoverableError(options),
  } satisfies HydrationOptions & RootOptions
}
