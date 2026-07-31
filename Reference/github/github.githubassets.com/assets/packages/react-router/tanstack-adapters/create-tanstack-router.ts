import {createRootRoute, createRoute, createRouter, type ErrorComponentProps} from '@tanstack/react-router'
import type {ReactNode} from 'react'
import {routeTreeAdapter} from './route-tree-adapter'
import type {RouteObject as ReactRouterRouteObject} from '../react-router'
import type {GetRouteOptions} from './types'

type CreateTanStackRouterOptions<TContext extends {}> = Omit<Parameters<typeof createRouter>[0], 'routeTree'> & {
  /** An array of React Router `RouteObject`s representing the route hierarchy. */
  routeObjects: ReactRouterRouteObject[]
  /** The root context that will be provided to all routes in the route tree. */
  context: TContext
  /** Optional root route component. Renders as a wrapper around all routes — use to inject providers. */
  rootComponent?: () => ReactNode
  /** Optional root route pending/hydrate-fallback component. Shown during SSR hydration or suspended loads. */
  rootPendingComponent?: () => ReactNode
  /** Optional root route error component. Receives `{error, reset}` props from TanStack Router. */
  rootErrorComponent?: (props: ErrorComponentProps) => ReactNode
  /** Optional app route error component. Receives `{error, reset}` props from TanStack Router. */
  appErrorComponent?: (props: ErrorComponentProps) => ReactNode
  /** Optional function to get TanStack route options from the React Router route.*/
  getRouteOptions?: GetRouteOptions
}

export function createTanStackRouter<TContext extends {}>({
  routeObjects,
  context,
  rootComponent,
  rootPendingComponent,
  rootErrorComponent,
  appErrorComponent,
  history,
  defaultOnCatch,
  getRouteOptions,
  ...customRouterOptions
}: CreateTanStackRouterOptions<TContext>) {
  const rootRoute = createRootRoute({
    context: (): TContext => context,
    component: rootComponent,
    pendingComponent: rootPendingComponent,
    errorComponent: rootErrorComponent,
  })

  // When an appErrorComponent is provided, create an intermediate wrapper route
  // (`__DATA_ROUTER_APPLICATION_ROUTES__`) that catches app-level errors before
  // they bubble up to the root — mirroring React Router's two-level error boundary structure.
  const appRouteParent = appErrorComponent
    ? createRoute({
        getParentRoute: () => rootRoute,
        id: '__DATA_ROUTER_APPLICATION_ROUTES__',
        errorComponent: appErrorComponent,
      })
    : rootRoute

  const tanstackRoutes = routeTreeAdapter(routeObjects, appRouteParent, {
    parentFullPath: '',
    getRouteOptions,
  })

  const routeTree =
    appRouteParent === rootRoute
      ? rootRoute.addChildren(tanstackRoutes)
      : rootRoute.addChildren([appRouteParent.addChildren(tanstackRoutes)])
  const router = createRouter({
    routeTree,
    context,
    history,
    defaultOnCatch,
    ...customRouterOptions,
  })

  return router
}
