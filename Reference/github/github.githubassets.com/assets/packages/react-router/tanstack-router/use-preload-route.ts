import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {useRouter} from '@tanstack/react-router'
import {useCallback} from 'react'

export function usePreloadRoute(): (url: string) => boolean {
  const router = useRouter()

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

      void router.preloadRoute({to: pathname, search: Object.fromEntries(searchParams)})
      return true
    },
    [router],
  )
}
