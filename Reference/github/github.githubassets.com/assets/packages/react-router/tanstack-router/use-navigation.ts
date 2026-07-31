import {useMatch, useRouterState} from '@tanstack/react-router'
import {toReactRouterLocation} from './use-location'

export const useNavigation = () => {
  const {routerIsLoading, location} = useRouterState({
    select: s => ({
      routerIsLoading: s.isLoading,
      // `location` is the in-flight target location;
      // use `resolvedLocation` to access the last settled location.
      location: toReactRouterLocation(s.location),
    }),
  })
  const match = useMatch({strict: false})
  const routeMatchIsFetching = match.isFetching
  const isLoading = routerIsLoading || routeMatchIsFetching

  // React Router contract reference:
  // - useNavigation: https://reactrouter.com/api/hooks/useNavigation
  // - Location is undefined when state is 'idle':
  // https://api.reactrouter.com/v7/types/react-router.NavigationStates.html
  return {
    state: isLoading ? 'loading' : 'idle',
    location: isLoading ? location : undefined,
  } as const
}
