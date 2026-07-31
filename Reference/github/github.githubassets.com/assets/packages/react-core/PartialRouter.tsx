// eslint-disable-next-line no-restricted-imports
import {reportError} from '@github-ui/failbot'
import {BrowserRouter, useInRouterContext} from '@github-ui/react-router'
import {type PropsWithChildren, useEffect} from 'react'

/**
 * A router component for React partials that provides routing context
 * without controlling browser history.
 *
 * This component:
 * - Provides router context so hooks like useLocation, useSearchParams work
 * - Reads the current URL from the browser (stays in sync via popstate events)
 * - Does NOT push/replace to browser history (navigation is handled by Turbo)
 * - Is nested-router-safe: if already inside a Router, it just renders children
 *
 * This allows partials to:
 * - Use React Router hooks to read the current URL
 * - Render content based on URL parameters
 * - Not interfere with the main page's navigation handling
 */
export function PartialRouter({children, partialName}: PropsWithChildren<{partialName: string}>) {
  // Check if we're already inside a Router context
  // This avoids "nested router" errors when a partial is rendered inside an existing router
  const isInsideRouter = useInRouterContext()

  // we can remove this later - I'm curious if we can see where this was happening
  useEffect(() => {
    if (isInsideRouter) {
      reportError(new Error(`PartialRouter used inside another Router in partial "${partialName}"`))
    }
  }, [isInsideRouter, partialName])

  // If we're already inside a router, just render children without adding another Router
  if (isInsideRouter) {
    return <>{children}</>
  }

  return <BrowserRouter>{children}</BrowserRouter>
}
