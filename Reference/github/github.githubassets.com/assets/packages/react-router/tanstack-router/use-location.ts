import {useRouterState, type ParsedLocation} from '@tanstack/react-router'

interface ReactRouterLocation {
  search: string
  pathname: string
  hash: string
  state: Record<string, never> | null
  key: string
}

/**
 * Strip internal TanStack Router state keys and return the remaining user state,
 * or `null` if there is no user-defined state — matching React Router's behaviour
 * where `location.state` defaults to `null`.
 */
function stripInternalState(state: ParsedLocation['state']): ReactRouterLocation['state'] {
  if (state == null || typeof state !== 'object') return null

  const {
    key: _key,
    __TSR_key: _tsrKey,
    __TSR_index: _tsrIndex,
    __hashScrollIntoViewOptions: _tsrHashScrollIntoViewOptions,
    ...userState
  } = state as unknown as Record<string, unknown>

  return Object.keys(userState).length > 0 ? (userState as Record<string, never>) : null
}

export const toReactRouterLocation = (location: ParsedLocation): ReactRouterLocation => ({
  search: location.searchStr,
  pathname: location.pathname,
  hash: location.hash,
  state: stripInternalState(location.state),
  key: location.state?.__TSR_key ?? 'default',
})

/**
 * React Router holds off updating `useLocation()` until a navigation fully commits, so it
 * always returns the resolved (current) location. TanStack Router is different: `state.location`
 * is set to the pending target as soon as a navigation begins, while `state.resolvedLocation`
 * only updates once the transition completes.
 *
 * For same-route navigations (e.g. `/repos?q=foo` → `/repos?q=bar`) the pending location is useful:
 * components can immediately derive the new query key and show stale cached data while the fetch runs
 * (stale-while-revalidate). Locking to `resolvedLocation` would delay that cache hit until the
 * navigation commits, making those navigations feel slower.
 *
 * Since existing components are designed on the assumption that `useLocation()` returns the resolved location,
 * we split on pathname: if the pathname hasn't changed we're navigating within the same route
 * and use the pending location for SWR; if the pathname changed we're leaving the route entirely
 * and use `resolvedLocation` to prevent the still-mounted component from picking up the
 * in-flight URL and flashing unrelated cached data.
 */
export const useLocation = () => {
  return useRouterState({
    select: s => {
      const resolved = s.resolvedLocation ?? s.location
      const effective = s.location.pathname === resolved.pathname ? s.location : resolved
      return toReactRouterLocation(effective)
    },
    structuralSharing: true,
  })
}
