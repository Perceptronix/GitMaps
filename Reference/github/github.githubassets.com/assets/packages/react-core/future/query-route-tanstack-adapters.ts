import {type RouteObject, tanStackSearchToURLSearchParams} from '@github-ui/react-router'

import type {PreloadableComponent} from '../app-routing-types'
import type {AnyQueryRoute, QueryRouteTanStackOptions} from './query-route'

const LOADER_DEPS_FALLBACK_WARNING =
  'An error occurred while deriving loader dependencies from queryDeps.' +
  ' Falling back to the full search object, so this route will revalidate on every search params change.' +
  " Override loaderDeps via this route's tanStackRouterOptions to customize this behavior."

/**
 * Builds the TanStack Router route-options object for a `QueryRoute` served by Rails + Alloy.
 *
 * This layer supplies `ssr` from the route component, derives `loaderDeps`
 * from the route's `queryDeps`, and forwards any `tanStackRouterOptions` from the
 * source query route.
 *
 * The downstream `routeOptionsAdapter(...)` layer is responsible for merging
 * those forwarded options with auto-generated `staticData` values and
 * adapting React Router options (e.g., loader) for use in a TanStack Router context.
 */
export function getRouteOptionsForQueryRoute(routeObj: RouteObject): {
  ssr?: boolean
  loaderDeps?: QueryRouteTanStackOptions['loaderDeps']
} & QueryRouteTanStackOptions {
  const component = routeObj.Component as PreloadableComponent | undefined
  return {
    ssr: component?.ssr,
    loaderDeps: loaderDepsFromQueryRoute(routeObj),
    ...tanStackRouteOptionsFromQueryRoute(routeObj),
  }
}

/**
 * Builds the TanStack Router route-options object for a `QueryRoute` served by UI Service.
 *
 * This layer derives `loaderDeps` from the route's `queryDeps`,
 * and forwards any `tanStackRouterOptions` from the
 * source query route.
 *
 * The downstream `registerRouteWithUIService(...)` layer is responsible for merging
 * those forwarded options with auto-generated `staticData` values and
 * configuring UI Service concerns like the streaming-compatible `loader` and `head`.
 */
export function getUIServiceRouteOptionsForQueryRoute(routeObj: RouteObject): NonNullable<QueryRouteTanStackOptions> {
  return {
    loaderDeps: loaderDepsFromQueryRoute(routeObj),
    ...tanStackRouteOptionsFromQueryRoute(routeObj),
  }
}

// A proxy params object that returns an empty string for any property access.
export const PARAMS_PROXY = new Proxy<Record<string, string>>({}, {get: () => ''})

/**
 * Adapts a QueryRoute's `queryDeps` definitions into TanStack Router `loaderDeps`.
 *
 * Path params are already part of TanStack route match identity, so they do not need to
 * be returned again; this adapter maps the search-driven portions of a
 * QueryRoute's query identity.
 *
 * See:
 * https://tanstack.com/router/latest/docs/framework/react/api/router/RouteOptionsType#loaderdeps-method
 * https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#using-loaderdeps-to-access-search-params
 */
export function loaderDepsFromQueryRoute(routeObj: RouteObject): QueryRouteTanStackOptions['loaderDeps'] {
  const queryRoute = getQueryRouteFromHandle(routeObj)

  if (!queryRoute) return undefined

  const queriesWithDeps = Object.entries(queryRoute.queries).filter(([, queryConfig]) =>
    Boolean(queryConfig?.queryDeps),
  )

  // Return a default loaderDeps function for routes without queryDeps
  if (queriesWithDeps.length === 0) return () => ({})

  return ({search}: Parameters<NonNullable<QueryRouteTanStackOptions['loaderDeps']>>[0]) => {
    const searchParams = tanStackSearchToURLSearchParams(search)

    return Object.fromEntries(
      queriesWithDeps.map(([queryName, queryConfig]) => {
        // Queries that do not depend on searchParams return a stable object based on
        // the default pathname and params proxy values that never change between calls.
        // TanStack Router compares loader deps by deep equality, not identity,
        // so that's fine and will not trigger reloads.
        let searchDeps: Record<string, unknown>
        try {
          searchDeps =
            queryConfig?.queryDeps?.({
              // TanStack Router already keys route matches by params/path. loaderDeps only needs
              // to surface the query-route's search-driven identity so search-only navigations
              // recompute query keys.
              pathname: '',
              params: PARAMS_PROXY as never,
              searchParams,
            }) ?? {}
        } catch {
          // eslint-disable-next-line no-console
          console.warn(LOADER_DEPS_FALLBACK_WARNING)
          // If queryDeps throws an error, we default to the full search.
          searchDeps = search
        }

        // Stringify + parse ensures the result is serializable including stripping the params Proxy.
        // The source queryDeps are already typed as serializable.
        return [queryName, JSON.parse(JSON.stringify(searchDeps))]
      }),
    )
  }
}

function tanStackRouteOptionsFromQueryRoute(routeObj: RouteObject): QueryRouteTanStackOptions | undefined {
  const queryRoute = getQueryRouteFromHandle(routeObj)

  if (!queryRoute) return undefined

  return queryRoute.tanStackRouterOptions
}

function getQueryRouteFromHandle(routeObj: RouteObject): AnyQueryRoute | undefined {
  if (!routeObj.handle || typeof routeObj.handle !== 'object') {
    return undefined
  }
  return 'queryRoute' in routeObj.handle ? (routeObj.handle.queryRoute as AnyQueryRoute) : undefined
}
