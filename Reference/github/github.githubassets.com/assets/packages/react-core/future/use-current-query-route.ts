import type {AnyQueryRoute} from './query-route'
import {useRouteMatches} from './query-route'

/**
 * Returns the {@link AnyQueryRoute} for the deepest currently-mounted
 * `QueryRoute` match. Throws if no `QueryRoute` is in the match tree.
 *
 * The route instance is read from `match.handle.queryRoute`, which is attached
 * by `QueryRoute.toRoute()`. This avoids reading the route from loader data,
 * which is being migrated away from in favor of fully JSON-serializable
 * loader output.
 *
 * Use this in layout/shared components that don't know statically which
 * child route they're rendering under. Components that *do* know their route
 * should import the route module directly.
 */
export function useCurrentQueryRoute(): AnyQueryRoute {
  const matches = useRouteMatches()
  for (let i = matches.length - 1; i >= 0; i--) {
    const queryRoute = matches[i]?.handle?.queryRoute
    if (queryRoute) return queryRoute
  }
  throw new Error('useCurrentQueryRoute: no QueryRoute is currently mounted in the match tree.')
}
