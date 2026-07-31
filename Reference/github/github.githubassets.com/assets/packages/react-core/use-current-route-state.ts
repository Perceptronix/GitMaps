import {useLocation} from '@github-ui/react-router'
import {use} from 'react'

import {RouteStateMapContext} from './route-state-map-context'

export function useCurrentRouteState<T>() {
  const routeStateMap = use(RouteStateMapContext)
  const location = useLocation()

  return routeStateMap[location.key] as T
}
