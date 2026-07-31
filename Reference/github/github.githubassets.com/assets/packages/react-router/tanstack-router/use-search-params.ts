import {useLocation as useLocationTanStack} from '@tanstack/react-router'
import {useNavigate, type NavigateOptionsWithPreventAutofocus, type URLSearchParamsInit} from './use-navigate'
import {useCallback, useMemo} from 'react'
import {createSearchParams} from './to-url-search-params'

/**
 * React Router-compatible useSearchParams implementation for TanStack Router.
 * The setter wraps the useNavigate hook defined above.
 */

export const useSearchParams = (): [
  URLSearchParams,
  (
    nextInit?: URLSearchParamsInit | ((prev: URLSearchParams) => URLSearchParamsInit),
    navigateOpts?: NavigateOptionsWithPreventAutofocus,
  ) => void,
] => {
  const {pathname, searchStr} = useLocationTanStack()
  const navigate = useNavigate()

  const searchParams = useMemo(() => {
    return new URLSearchParams(searchStr)
  }, [searchStr])

  const setSearchParams = useCallback(
    (
      nextInit?: URLSearchParamsInit | ((prev: URLSearchParams) => URLSearchParamsInit),
      navigateOpts?: NavigateOptionsWithPreventAutofocus,
    ) => {
      const nextValue = typeof nextInit === 'function' ? nextInit(searchParams) : nextInit
      const newSearchParams = createSearchParams(nextValue)
      navigate(
        {
          pathname,
          search: newSearchParams.toString(),
        },
        navigateOpts,
      )
    },
    [navigate, pathname, searchParams],
  )

  return [searchParams, setSearchParams]
}
