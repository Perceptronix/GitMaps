// eslint-disable-next-line @github-ui/github-monorepo/prefer-github-ui-react-router
import {matchRoutes} from 'react-router'
import {RoutesContext} from './use-navigate'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {use, useCallback} from 'react'
import type {PreloadableRoute} from '../shared'

export function usePreloadRoute(): (url: string) => boolean {
  const {routes} = use(RoutesContext)

  return useCallback(
    (url: string) => {
      let pathname: string
      let searchParams: URLSearchParams

      try {
        const parsed = new URL(url, ssrSafeLocation.origin)
        pathname = parsed.pathname
        searchParams = parsed.searchParams
      } catch {
        return false
      }

      const matches = matchRoutes(routes, pathname)
      if (!matches) return false

      let preloaded = false
      for (const match of matches) {
        const queryRoute = (match.route.handle as {queryRoute?: PreloadableRoute} | undefined)?.queryRoute
        if (queryRoute) {
          const params = (match.params ?? {}) as Record<string, string>
          queryRoute.preload(params, searchParams)
          preloaded = true
        }
      }

      return preloaded
    },
    [routes],
  )
}
