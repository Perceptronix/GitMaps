import {createContext} from 'react'

import type {PageError} from './app-routing-types'
import {ErrorPage} from './ErrorPage'
import type {NavigatorAppRegistration} from './navigator-app-registry'
import {RouteStateMapContext} from './route-state-map-context'
import {RoutesContextProvider} from './RoutesContextProvider'
import {AppPayloadContext} from './use-app-payload'
import type {RouteStateMap} from './use-navigator'

export const NavigationErrorContext = createContext<PageError | null>(null)

interface Props {
  appPayload: unknown

  /**
   * Children will be included within the router context, but outside and after any routes.
   */
  children?: React.ReactNode
  error: PageError | null
  navigateOnError: boolean
  routes: NavigatorAppRegistration['routes']
  routeStateMap: RouteStateMap
}

/**
 * Given a list of React core routes and routing state, render the app. The implementation of this component should be
 * client/server agnostic, and differences probably should live in the appropriate Entry instead.
 */
export function NavigatorRouter({appPayload, children, error, navigateOnError, routes, routeStateMap}: Props) {
  return (
    <RoutesContextProvider routes={routes}>
      {error && !navigateOnError ? (
        <ErrorPage {...error} />
      ) : (
        <AppPayloadContext value={appPayload}>
          <NavigationErrorContext value={error}>
            <RouteStateMapContext value={routeStateMap}>{children}</RouteStateMapContext>
          </NavigationErrorContext>
        </AppPayloadContext>
      )}
    </RoutesContextProvider>
  )
}
