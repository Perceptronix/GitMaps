import {type HistoryRouterProps, type Location, Router, useRoutes} from '@github-ui/react-router'
import {useLayoutEffect} from 'react'

import {type AppComponentType, AppWrapper} from './AppWrapper'
import {BaseProviders} from './BaseProviders'
import {CommonElements} from './CommonElements'
import type {EmbeddedData} from './embedded-data-types'
import {ErrorBoundary} from './ErrorBoundary'
import type {NavigatorAppRegistration} from './navigator-app-registry'
import {NavigatorRouter} from './NavigatorRouter'
import {RouterDevTools} from './RouterDevTools'
import {useNavigationFocus} from './use-navigation-focus'
import {useNavigator} from './use-navigator'
import {installScrollRestoration, useScrollRestoration} from './use-scroll-restoration'
import {useSoftNavLifecycle} from './use-soft-nav-lifecycle'
import {useTitleManager} from './use-title-manager'

installScrollRestoration()

interface Props {
  appName: string
  initialLocation: Location<unknown>
  embeddedData: EmbeddedData
  routes: NavigatorAppRegistration['routes']
  App?: AppComponentType
  ssrError?: HTMLScriptElement
  history: HistoryRouterProps['history']
  onError?: (error: Error) => void
}

export function NavigatorClientEntry({
  appName,
  initialLocation,
  history,
  embeddedData,
  routes,
  App,
  ssrError,
  onError,
}: Props) {
  // We create our "app" here. The app is a state machine that lets you dispatch a history update
  // and gives you a resolved location (after e.g., loading, redirects, etc.)
  const [{location, error, routeStateMap, appPayload, navigateOnError, isLoading}, {handleHistoryUpdate}] =
    useNavigator({
      initialLocation,
      appName,
      embeddedData,
      routes,
    })

  useNavigationFocus(isLoading, location)
  useSoftNavLifecycle(location, isLoading, error)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  useTitleManager(routeStateMap[location.key]!, error, location)
  useScrollRestoration()

  // When we get a history update, we send it to our app via handleHistoryUpdate
  // Note, we only want this to run in the browser to avoid SSR warnings about useLayoutEffect
  useLayoutEffect(() => {
    const unlisten = history.listen(handleHistoryUpdate)
    return unlisten
  }, [history, handleHistoryUpdate])

  return (
    <BaseProviders appName={appName} dataRouterEnabled={false}>
      <ErrorBoundary onError={onError} critical>
        <NavigatorRouter
          appPayload={appPayload}
          error={error}
          navigateOnError={navigateOnError}
          routes={routes}
          routeStateMap={routeStateMap}
        >
          <Router location={location} navigator={history}>
            <AppRoutes routes={routes} App={App} />
          </Router>
          <CommonElements ssrError={ssrError} />
        </NavigatorRouter>
      </ErrorBoundary>
    </BaseProviders>
  )
}

function AppRoutes({App, routes}: Pick<Props, 'routes' | 'App'>) {
  return useRoutes([
    {
      element: (
        <>
          <AppWrapper App={App} />
          <RouterDevTools routes={routes} />
        </>
      ),
      children: routes,
    },
  ])
}
