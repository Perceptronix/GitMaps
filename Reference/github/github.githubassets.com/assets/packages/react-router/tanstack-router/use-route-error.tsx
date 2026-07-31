import type {
  ErrorComponentProps,
  ErrorRouteComponent,
  NotFoundRouteComponent,
  NotFoundRouteProps,
} from '@tanstack/react-router'
import type {ComponentType, ReactNode} from 'react'
import {createContext, use} from 'react'

const MISSING_ROUTE_ERROR = Symbol('missing-route-error')

const RouteErrorContext = createContext<unknown>(MISSING_ROUTE_ERROR)

function RouteErrorProvider({error, children}: {error: unknown; children: ReactNode}) {
  return <RouteErrorContext value={error}>{children}</RouteErrorContext>
}

export function useRouteError() {
  const routeError = use(RouteErrorContext)

  if (routeError === MISSING_ROUTE_ERROR) {
    throw new Error(
      'useRouteError() was called in a TanStack Router context without an adapted error boundary. ' +
        'Wrap the route ErrorBoundary or errorElement with wrapTanStackErrorComponent(), or adapt ' +
        'the full route via routeOptionsAdapter()/createTanStackRouter().',
    )
  }

  return routeError
}

type ErrorContent = {ErrorBoundary: ComponentType} | {errorElement: ReactNode}

export function wrapTanStackErrorComponent(content: ErrorContent): ErrorRouteComponent {
  function WrappedTanStackErrorComponent({error}: ErrorComponentProps) {
    const renderedContent = 'ErrorBoundary' in content ? <content.ErrorBoundary /> : content.errorElement

    // React Router route error boundaries read the route error from context via useRouteError(),
    // rather than receiving it as a prop. Mirror that contract here so adapted TanStack error
    // components expose route errors to existing React Router-style boundaries the same way.
    return <RouteErrorProvider error={error}>{renderedContent}</RouteErrorProvider>
  }

  WrappedTanStackErrorComponent.displayName = 'WrappedTanStackErrorComponent'
  return WrappedTanStackErrorComponent
}

/**
 * Wraps a React Router ErrorBoundary/errorElement as a TanStack Router `notFoundComponent`.
 *
 * In React Router, unmatched child routes surface as a 404 ErrorResponse caught by the
 * parent's ErrorBoundary. TanStack Router handles not-found via a separate rendering path
 * (`notFoundComponent`). This adapter bridges the two: it synthesizes a 404 ErrorResponse
 * and provides it via RouteErrorContext so `useRouteError()` works identically in both modes.
 */
export function wrapTanStackNotFoundComponent(content: ErrorContent): NotFoundRouteComponent {
  function WrappedTanStackNotFoundComponent({data}: NotFoundRouteProps) {
    const renderedContent = 'ErrorBoundary' in content ? <content.ErrorBoundary /> : content.errorElement

    // Synthesize a 404 ErrorResponse matching React Router's shape for unmatched routes.
    const notFoundError = {status: 404, statusText: 'Not Found', internal: true, data}
    return <RouteErrorProvider error={notFoundError}>{renderedContent}</RouteErrorProvider>
  }

  WrappedTanStackNotFoundComponent.displayName = 'WrappedTanStackNotFoundComponent'
  return WrappedTanStackNotFoundComponent
}
