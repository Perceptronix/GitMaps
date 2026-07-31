import type {RegisteredRouter} from '@tanstack/react-router'

/**
 * Check if a path is external to the app (not defined in our route tree).
 * Returns true if the path should be handled by a full page reload,
 * false if it can be handled by TanStack Router client-side navigation.
 */
export function isExternalToApp(router: RegisteredRouter, path: string): boolean {
  try {
    // Remove query string and hash from path for matching
    const cleanPathParts = path.split('?')
    const cleanPath = cleanPathParts[0]?.split('#')[0]

    if (!cleanPath) {
      return true
    }

    // Try to match the route using the router's matchRoutes method
    const matches = router.matchRoutes(cleanPath, {})

    if (!matches || matches.length === 0) {
      return true
    }

    // Check if any of the matched routes has a defined fullPath or path
    // Layout and root routes typically have empty paths, so we're looking for
    // a match with an actual path segment that matches our cleanPath
    const normalizedCleanPath = cleanPath.length > 1 ? cleanPath.replace(/\/$/, '') : cleanPath
    const hasKnownRoute = matches.some(match => {
      const routeId = match.routeId
      // Exclude root route, but include actual page routes even if they're under layout routes
      // A route is considered a "page route" if it matches the pathname we're navigating to
      // This includes routes like '/_nav/_repos_layout/repos' which are actual pages,
      // while excluding pure layout routes like '/_nav' or '/_nav/_repos_layout'
      // Normalize trailing slashes: index routes under parent routes get a trailing slash
      // (e.g., '/pulls/') but navigation targets may omit it (e.g., '/pulls').
      const normalizedMatchPath = match.pathname.length > 1 ? match.pathname.replace(/\/$/, '') : match.pathname
      return routeId !== '__root__' && normalizedMatchPath === normalizedCleanPath
    })

    // If we found a known route, it's NOT external
    return !hasKnownRoute
  } catch {
    // If matching fails, assume it's external
    return true
  }
}
