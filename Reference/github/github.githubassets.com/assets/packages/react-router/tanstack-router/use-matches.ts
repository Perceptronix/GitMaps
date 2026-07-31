import {useMatches as useMatchesTanStack} from '@tanstack/react-router'

export function useMatches() {
  const matches = useMatchesTanStack()
  // Convert TanStack matches to React Router UIMatch format
  return matches.map(match => {
    return {
      id: match.staticData.dataRouterId ?? match.routeId,
      pathname: match.pathname,
      params: match.params,
      handle: match.staticData,
      loaderData: match.loaderData, // Value may be undefined, but property must be present in react-router
    }
  })
}
