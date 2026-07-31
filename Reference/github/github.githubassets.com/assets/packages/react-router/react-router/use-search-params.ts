// eslint-disable-next-line @github-ui/github-monorepo/prefer-github-ui-react-router
import {
  createSearchParams,
  useLocation,
  useSearchParams as useReactRouterSearchParams,
  type URLSearchParamsInit,
} from 'react-router'
import {useNavigate} from './use-navigate'
import {useCallback} from 'react'
import type {NavigateOptionsWithPreventAutofocus} from '../tanstack-router'

/**
 * An implementation of `useSearchParams` that mirrors `react-router`'s `useSearchParams` hook
 * but utilizes the wrapped `@github-ui/react-router` `useNavigate` to handle updates.
 */
export const useSearchParams = () => {
  const [searchParams] = useReactRouterSearchParams()
  const navigate = useNavigate()
  const {pathname} = useLocation()

  const setSearchParams = useCallback<
    (
      nextInit?: URLSearchParamsInit | ((prev: URLSearchParams) => URLSearchParamsInit),
      navigateOpts?: NavigateOptionsWithPreventAutofocus,
    ) => void
  >(
    (nextInit, navigateOptions = {}) => {
      const newSearchParams = createSearchParams(typeof nextInit === 'function' ? nextInit(searchParams) : nextInit)
      navigate(
        {
          pathname,
          search: newSearchParams.toString(),
        },
        navigateOptions,
      )
    },
    [searchParams, navigate, pathname],
  )

  return [searchParams, setSearchParams] as const
}
