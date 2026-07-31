import {routePathAdapter} from './route-path-adapter'
import type {RouteObject as ReactRouterRouteObject} from '../react-router'
import type {AnyContext, AnyRoute, ErrorRouteComponent, LoaderFnContext, RouteComponent} from '@tanstack/react-router'
import {wrapTanStackErrorComponent, wrapTanStackNotFoundComponent} from '../tanstack-router/use-route-error'
import {buildTanStackRouteOptions} from './build-tanstack-route-options'
import type {GetRouteOptions, TanStackRouteOptions} from './types'
import {ssrSafeLocation} from '@github-ui/ssr-utils'

type RouteIdentifier = {path: string} | {id: string}
type RouteOptionsReturnType = TanStackRouteOptions & {
  normalizedRelativePath: string | undefined
  routeIdentifier: RouteIdentifier
}

/**
 * Converts a React Router `RouteObject` into the options object passed to TanStack Router's
 * `createRoute`.
 *
 * The adapter auto-converts these TanStack route properties from the React Router route:
 *
 * - `loader`: adapted from `routeObj.loader`.
 * - `component`: adapted from `routeObj.Component` or `routeObj.element`.
 * - `errorComponent`: adapted from `routeObj.ErrorBoundary` or `routeObj.errorElement`.
 * - `notFoundComponent`: adapted from `routeObj.ErrorBoundary` or `routeObj.errorElement`.
 * - `shouldReload`, `staticData`: see {@link buildTanStackRouteOptions}.
 *
 * It merges the result of the optional `getRouteOptions` with these adapter-generated options.
 *
 * The returned object includes the following additional properties for building the route tree:
 * - `routeIdentifier`: either `{path}` (for routable routes) or `{id}` (for pathless layout
 *   routes).
 * - `normalizedRelativePath`: the resolved relative path, used by `routeTreeAdapter` to thread the
 *   correct parent path down to child routes before the route tree is fully assembled.
 */
export function routeOptionsAdapter(
  routeObj: ReactRouterRouteObject,
  parentFullPath: string,
  getRouteOptions?: GetRouteOptions,
): RouteOptionsReturnType {
  const normalizedRelativePath = routePathAdapter(routeObj, parentFullPath)

  const routeIdentifier: {path: string} | {id: string} = normalizedRelativePath
    ? {path: normalizedRelativePath}
    : {id: routeObj.id ?? `${parentFullPath}/_layout`}

  return {
    component: componentAdapter(routeObj),
    errorComponent: errorComponentAdapter(routeObj),
    notFoundComponent: notFoundComponentAdapter(routeObj),
    loader: loaderAdapter(routeObj),
    ...buildTanStackRouteOptions(routeObj, getRouteOptions),
    routeIdentifier,
    normalizedRelativePath,
  }
}

type AnyLoaderContext = LoaderFnContext<
  unknown,
  AnyRoute,
  string,
  unknown,
  Record<string, unknown>,
  AnyContext,
  unknown,
  unknown
>
export function loaderAdapter(routeObj: ReactRouterRouteObject) {
  if (!routeObj.loader || typeof routeObj.loader !== 'function') {
    return undefined
  }

  const originalLoader = routeObj.loader

  return async (ctx: AnyLoaderContext) => {
    const {
      params,
      location,
      abortController: {signal},
      context,
    } = ctx

    const url = new URL(location.pathname + (location.searchStr ?? ''), ssrSafeLocation.origin)
    const request = new Request(url.toString(), {signal})

    const loaderArgs = {
      request,
      params,
      context,
      url,
      pattern: location.pathname,
      unstable_pattern: location.pathname,
    }

    return originalLoader(loaderArgs)
  }
}

export function componentAdapter(routeObj: ReactRouterRouteObject): RouteComponent | undefined {
  const Component = routeObj.Component
  if (Component) return Component as RouteComponent
  if (routeObj.element) return () => routeObj.element
  return undefined
}

export function errorComponentAdapter(routeObj: ReactRouterRouteObject): ErrorRouteComponent | undefined {
  const ErrorBoundary = routeObj.ErrorBoundary
  if (ErrorBoundary) return wrapTanStackErrorComponent({ErrorBoundary})
  if (routeObj.errorElement) return wrapTanStackErrorComponent({errorElement: routeObj.errorElement})
  return undefined
}

function notFoundComponentAdapter(routeObj: ReactRouterRouteObject): TanStackRouteOptions['notFoundComponent'] {
  const ErrorBoundary = routeObj.ErrorBoundary
  if (ErrorBoundary) return wrapTanStackNotFoundComponent({ErrorBoundary})
  if (routeObj.errorElement) return wrapTanStackNotFoundComponent({errorElement: routeObj.errorElement})
  return undefined
}
