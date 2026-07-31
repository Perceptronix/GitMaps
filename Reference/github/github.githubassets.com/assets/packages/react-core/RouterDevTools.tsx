import {
  matchRoutes,
  type Params,
  type RouteObject,
  type UIMatch,
  useLocation,
  useMatches,
} from '@github-ui/react-router'
import {memo, useEffect, useMemo} from 'react'

import {useIsDataRouterEnabled} from './future/use-is-data-router-enabled'
import {getRouterDevtoolsStore, type RouterState} from './router-dev-tools'

const EMPTY_MATCHES: RouterState['matches'] = []
const EMPTY_ROUTES: RouterState['routes'] = []

// eslint-disable-next-line @typescript-eslint/no-shadow -- named function expression intentionally shares the outer name
export const RouterDevTools = memo(function RouterDevTools({routes}: {routes: RouteObject[]}) {
  const isDataRouterEnabled = useIsDataRouterEnabled()
  if (isDataRouterEnabled) return <DataRouterDevTools routes={routes} />
  else return <NavigatorRouterDevTools routes={routes} />
})

function toUiMatch({pathname, route, params}: {pathname: string; route: RouteObject; params: Params}): UIMatch {
  return {
    id: route.id ?? route.path ?? pathname,
    pathname,
    params,
    loaderData: undefined,
    handle: route.handle,
  }
}

// eslint-disable-next-line @typescript-eslint/no-shadow -- named function expression intentionally shares the outer name
const NavigatorRouterDevTools = memo(function NavigatorRouterDevTools({routes}: {routes: RouteObject[]}) {
  // Keep this component mounted on SSR for client/server tree parity, but skip expensive route computations on server.
  const isServer = typeof document === 'undefined'
  const location = useLocation()
  const matches = useMemo(
    () => (isServer ? EMPTY_MATCHES : (matchRoutes(routes, location)?.map(item => toUiMatch(item)) ?? EMPTY_MATCHES)),
    [isServer, location, routes],
  )
  const staticRoutes = useMemo(() => {
    if (isServer) return EMPTY_ROUTES
    return flattenToUIMatches(routes)
  }, [isServer, routes])

  useEmitRouterState({location, matches, routes: staticRoutes})

  return null
})

// eslint-disable-next-line @typescript-eslint/no-shadow -- named function expression intentionally shares the outer name
const DataRouterDevTools = memo(function DataRouterDevTools({routes}: {routes: RouteObject[]}) {
  const isServer = typeof document === 'undefined'
  const location = useLocation()
  const dataRouterMatches = useMatches()
  const matches = isServer ? EMPTY_MATCHES : dataRouterMatches
  const staticRoutes = useMemo(() => {
    if (isServer) return EMPTY_ROUTES
    return flattenToUIMatches(routes)
  }, [isServer, routes])

  useEmitRouterState({location, matches, routes: staticRoutes})

  return null
})

function useEmitRouterState({location, matches, routes}: RouterState) {
  // Handle Turbo navigation events
  useEffect(() => {
    const controller = new AbortController()
    document.addEventListener(
      'turbo:load',
      () => {
        getRouterDevtoolsStore().setState({
          location,
          matches,
          routes,
        })
      },
      {signal: controller.signal},
    )
    return () => {
      controller.abort()
    }
  }, [location, routes, matches])

  // Update store when location or matches change
  useEffect(() => {
    getRouterDevtoolsStore().setState({
      location,
      matches,
      routes,
    })

    return () => {
      // Clear the store when the component unmounts
      getRouterDevtoolsStore().setState(null)
    }
  }, [location, routes, matches])
}

function ensureTrailingSlash(path: string): string {
  return path.endsWith('/') ? path : `${path}/`
}

function flattenToUIMatches(routes: RouteObject[], parentPath = ''): RouterState['routes'] {
  const flat: RouterState['routes'] = []

  for (const route of routes) {
    const isIndex = route.index === true
    const currentPath = route.path ?? ''
    let fullPath: string
    if (isIndex) {
      // special case: absolute parent + index → trailing slash
      fullPath =
        parentPath.startsWith('/') && !parentPath.endsWith('/') ? ensureTrailingSlash(parentPath) : parentPath || '/'
    } else {
      fullPath = currentPath.startsWith('/') ? currentPath : joinPaths(parentPath, currentPath)
    }

    const id = 'id' in route && typeof route.id === 'string' ? route.id : fullPath || '/'

    flat.push({
      id,
      pathname: fullPath || '/',
      route,
      loaderData: undefined,
    })

    if (route.children) {
      flat.push(...flattenToUIMatches(route.children, fullPath))
    }
  }

  return flat
}

// Join two paths like React Router does, avoiding double slashes
function joinPaths(a: string, b: string): string {
  if (!a) return b
  if (!b) return a
  return `${a.replace(/\/+$/, '')}/${b.replace(/^\/+/, '')}`
}
