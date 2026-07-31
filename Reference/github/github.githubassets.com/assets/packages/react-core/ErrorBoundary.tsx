import {AnalyticsContext} from '@github-ui/analytics-provider/context'
import type {ErrorContext} from '@github-ui/failbot'
import React from 'react'

import {ErrorPage} from './ErrorPage'

// NOTE(jon, 2022-02-28): I copied 99% of this from memex's error-boundary

/**
 * Symbol used to attach error boundary metadata to errors.
 * This metadata is read by React 19's onCaughtError callback in ReactBaseElement.
 */
export const ERROR_BOUNDARY_METADATA = Symbol.for('errorBoundaryMetadata')

export interface ErrorBoundaryMetadata {
  critical?: boolean
  boundaryName?: string
  /** If true, skip reporting to Sentry (handled by custom onError) */
  hasCustomHandler?: boolean
}

export interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  /**
   * Provide a callback to be invoked when an error is thrown (can be used for logging errors).
   * When provided, the default Sentry reporting is skipped - the callback is responsible for reporting.
   */
  onError?: (error: Error, context?: ErrorContext) => void
  /**
   * Mark errors from this boundary as critical. Critical errors indicate
   * a significant feature failure that should be prioritized.
   */
  critical?: boolean
  appName?: string
  /**
   * An optional name for the error boundary, useful for identifying in logs
   */
  boundaryName?: string
}

interface ErrorBoundaryState {
  error: Error | null
}

class BasicErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)

    this.state = {
      error: null,
    }
  }

  /**
   * Invoked when an error is thrown in the child component,
   * and used to update state in a concurrent friendly manner
   */
  static getDerivedStateFromError(error: Error) {
    return {error}
  }

  /**
   * Called _after_ the re-render, used for performing side-effects such as logging.
   *
   * Error reporting is handled centrally via React 19's `onCaughtError` callback
   * on `hydrateRoot`/`createRoot` in ReactBaseElement.
   * This method attaches metadata to the error so the root can read critical/boundaryName info.
   */
  override componentDidCatch(error: Error) {
    const context = {
      critical: this.props.critical || false,
      reactAppName: this.props.appName,
      reactErrorBoundaryName: this.props.boundaryName,
    }

    // Attach boundary metadata to the error so onCaughtError can read it
    const metadata: ErrorBoundaryMetadata = {
      critical: this.props.critical,
      boundaryName: this.props.boundaryName,
      hasCustomHandler: typeof this.props.onError === 'function',
    }
    ;(error as Error & {[ERROR_BOUNDARY_METADATA]?: ErrorBoundaryMetadata})[ERROR_BOUNDARY_METADATA] = metadata

    // Call custom onError if provided - this boundary handles its own reporting
    if (typeof this.props.onError === 'function') {
      this.props.onError(error, context)
    }
    // Default reporting is handled by React 19's onCaughtError at the root level
  }

  override render() {
    if (!this.state.error) return this.props.children

    return this.props.fallback === undefined ? <ErrorPage type="httpError" /> : this.props.fallback
  }
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  const context = React.use(AnalyticsContext)
  const appName = props.appName || context?.appName
  return <BasicErrorBoundary {...props} appName={appName} />
}
