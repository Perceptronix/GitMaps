import {isFeatureEnabled} from '@github-ui/feature-flags'
import {noop} from '@github-ui/noop'
import {createTanStackRouter, Outlet, type RouteObject, type TanStackRouterHistory} from '@github-ui/react-router'
import {IS_SERVER} from '@github-ui/ssr-utils'
import type {ComponentType, ReactNode} from 'react'

import {BaseProviders} from '../BaseProviders'
import {CommonElements} from '../CommonElements'
import {RouterDevTools} from '../RouterDevTools'
import {RoutesContextProvider} from '../RoutesContextProvider'
import {AppPayloadContext} from '../use-app-payload'
import {LegacyNavigationFocusListener, NavigationFocusListener} from './NavigationFocusListener'
import {PublishPayload} from './PublishPayload'
import {getRouteOptionsForQueryRoute} from './query-route-tanstack-adapters'
import {
  RootAppRouteErrorElement,
  RootAppRouteErrorInner,
  RootNotFoundComponent,
  UnhandledRouteError,
  UnhandledRouteErrorInner,
} from './RouterErrorBoundary'
import {CombinedScrollRestoration} from './ScrollRestoration'
import {SoftNavLifecycleListener} from './SoftNavLifecycleListener'
import {TANSTACK_ROUTER_OPTIONS} from './tanstack-router-options'
import {TitleManager} from './TitleManager'

export function routesWithProviders(
  routes: RouteObject[],
  options: Omit<SharedProviderOptions, 'tanstackRouterEnabled'> & {
    HydrateFallback?: ComponentType
  },
): RouteObject[] {
  const {HydrateFallback, ...rest} = options
  return [
    {
      id: `__DATA_ROUTER_ROOT__`,
      errorElement: <UnhandledRouteError appName={rest.appName} />,
      HydrateFallback,
      element: <SharedProviders routes={routes} options={rest} />,
      children: [
        {
          id: `__DATA_ROUTER_APPLICATION_ROUTES__`,
          errorElement: <RootAppRouteErrorElement appName={rest.appName} />,
          children: routes,
        },
      ],
    },
  ]
}

export function tanStackRouterWithProviders<TContext extends {}>(
  routes: RouteObject[],
  options: Omit<SharedProviderOptions, 'tanstackRouterEnabled' | 'dataRouterEnabled'> & {
    context: TContext
    history?: TanStackRouterHistory
    HydrateFallback?: ComponentType
  },
) {
  const {history, context, HydrateFallback, ...rest} = options
  const rootOptions = {...rest, dataRouterEnabled: true, tanstackRouterEnabled: true}

  const RootComponent = () => <SharedProviders routes={routes} options={rootOptions} />

  const RootErrorComponent = ({error}: {error: unknown}) => (
    <UnhandledRouteErrorInner routeError={error} appName={rest.appName} />
  )

  const AppRoutesErrorComponent = ({error}: {error: unknown}) => (
    <RootAppRouteErrorInner routeError={error} appName={rest.appName} />
  )

  return createTanStackRouter({
    ...TANSTACK_ROUTER_OPTIONS,
    context,
    rootComponent: RootComponent,
    rootPendingComponent: HydrateFallback ? () => <HydrateFallback /> : undefined,
    rootErrorComponent: RootErrorComponent,
    appErrorComponent: AppRoutesErrorComponent,
    // Equivalent to isNoRouteFoundError branch of UnhandledRouteErrorInner in React Router context.
    // In TSR, not found responses are handled separately from regular errors.
    defaultNotFoundComponent: RootNotFoundComponent,
    routeObjects: routes,
    history,
    // Errors are already reported by error components.
    // Providing a defaultOnCatch suppresses duplicate reporting in createOnCaughtError.
    defaultOnCatch: noop,
    getRouteOptions: getRouteOptionsForQueryRoute,
    // Disable scroll restoration script during SSR where CSP blocks it
    scrollRestoration: !IS_SERVER,
  })
}

type SharedProviderOptions = {
  appPayload?: Record<string, unknown>
  appName: string
  ssrError: HTMLScriptElement | undefined
  dataRouterEnabled: boolean
  tanstackRouterEnabled?: boolean
  children?: ReactNode
}

/**
 * Shared provider tree used by both `routesWithProviders` (React Router) and
 * `tanStackRouterWithProviders` (TanStack Router).
 *
 * When `tanstackRouterEnabled` is true, `RoutesContextProvider` is omitted
 * (TSR manages its own route context) and hooks that lack TSR shims are suppressed.
 */
function SharedProviders({
  routes,
  options: {appPayload, appName, ssrError, children, dataRouterEnabled, tanstackRouterEnabled},
}: {
  routes: RouteObject[]
  options: SharedProviderOptions
}) {
  // This listener is compatible with both React Router and TanStack Router,
  // but it adds an extra dependency on navigation state, so its introduction
  // is gated by a feature flag.
  const tsrCompatibleNavigationFocusEnabled = isFeatureEnabled('react_navigation_focus_tanstack')
  const sharedInternals = (
    <>
      <Outlet />
      {children}
      <CommonElements ssrError={ssrError} />
      <SoftNavLifecycleListener />
      {tsrCompatibleNavigationFocusEnabled ? <NavigationFocusListener /> : <LegacyNavigationFocusListener />}
      <CombinedScrollRestoration />
      <PublishPayload />
      <TitleManager />
      <RouterDevTools routes={routes} />
    </>
  )
  return (
    <BaseProviders appName={appName} dataRouterEnabled={dataRouterEnabled}>
      <AppPayloadContext value={appPayload}>
        {tanstackRouterEnabled ? (
          sharedInternals
        ) : (
          <RoutesContextProvider routes={routes}>{sharedInternals}</RoutesContextProvider>
        )}
      </AppPayloadContext>
    </BaseProviders>
  )
}
