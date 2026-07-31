import {useRouter as useRouterTanStack, useNavigate as useNavigateTanStack} from '@tanstack/react-router'
import {PREVENT_AUTOFOCUS_KEY, type NavigateOptionExtensions} from '../shared'
import {useCallback} from 'react'
import {isExternalToApp as isExternalToAppRouter} from './is-external-to-app'

/** Mirror react-router types */
export type URLSearchParamsInit = string | URLSearchParams | Array<[string, string]> | Record<string, string | string[]>
export type To = string | Partial<{pathname: string; search: string; hash: string}>
interface NavigateOptions {
  replace?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state?: any
  preventScrollReset?: boolean
  relative?: 'route' | 'path'
  flushSync?: boolean
  viewTransition?: boolean
}
export type NavigateOptionsWithPreventAutofocus = NavigateOptions & NavigateOptionExtensions

export {PREVENT_AUTOFOCUS_KEY} from '../shared'

/**
 * Translates React Router navigation calls to TanStack Router format.
 *
 * Forwarded compatible options:
 * - replace: replace history instead of push.
 * - state: stored in location state.
 * - viewTransition: document view transitions.
 * - reloadDocument: forwarded & force-set to true for routes detected as external to this app.
 * Mapped options:
 * - preventScrollReset: mapped to TanStack `resetScroll` (inverted value).
 * - relative: mapped to TanStack `unsafeRelative` when set to 'path'.
 * - preventAutofocus: mapped to a location state flag used by focus management.
 * Ignored options:
 * - preventTurbo: TanStack routing is not integrated with Turbo.
 * - flushSync: accepted for parity but currently a noop in this adapter.
 */
export const useNavigate = () => {
  const navigate = useNavigateTanStack()
  const router = useRouterTanStack()

  const isExternalToApp = useCallback(
    (path: string): boolean => (router ? isExternalToAppRouter(router, path) : true),
    [router],
  )

  return (to: To, options?: NavigateOptionsWithPreventAutofocus) => {
    // Determine the target path for route checking
    let targetPath: string | undefined

    if (typeof to === 'string') {
      targetPath = to
    } else if (to && typeof to === 'object' && to.pathname) {
      targetPath = to.pathname
    }

    const {
      preventScrollReset,
      relative,
      flushSync: _flushSync,
      preventAutofocus,
      preventTurbo: _preventTurbo,
      state,
      ...compatibleOptions
    } = options ?? {}

    const finalOptions: Record<string, unknown> = {
      ...compatibleOptions,
    }

    if (state !== undefined) {
      finalOptions.state = state
    }

    if (preventScrollReset !== undefined) {
      finalOptions.resetScroll = !preventScrollReset
    }

    if (relative === 'path') {
      finalOptions.unsafeRelative = 'path'
    }

    if (preventAutofocus) {
      finalOptions.state = {
        [PREVENT_AUTOFOCUS_KEY]: true,
        ...(state ?? {}),
      }
    }

    const isExternal = targetPath && isExternalToApp(targetPath)
    if (isExternal) {
      finalOptions.href = targetPath
      finalOptions.to = undefined
      // Force a full-page navigation so TanStack Router doesn't attempt a
      // client-side route transition for paths outside the app's route tree.
      finalOptions.reloadDocument = true
    }

    // Handle string paths (e.g., navigate('/repos'))
    if (typeof to === 'string') {
      navigate({to, ...finalOptions})
      return
    }

    // Handle object paths with pathname and search
    // React Router format: {pathname: '/repos', search: 'q=foo'}
    // TanStack Router format: {to: '/repos', search: {q: 'foo'}}
    if (to && typeof to === 'object') {
      const {pathname, search, hash, ...rest} = to

      // Build TanStack Router navigation object
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tsrNavigation: Record<string, any> = {
        ...rest,
      }

      // Set the 'to' path
      if (pathname) {
        tsrNavigation.to = pathname
      }

      // Convert search string to object if needed
      // An empty string may be used to clear search params
      if (search !== undefined) {
        if (typeof search === 'string') {
          tsrNavigation.search = router.options.parseSearch(search)
        } else {
          tsrNavigation.search = search
        }
      }

      // Add hash if present
      if (hash) {
        tsrNavigation.hash = hash
      }

      // Merge with options
      navigate({...tsrNavigation, ...finalOptions})
      return
    }

    // Fallback: pass through as-is
    navigate({to, ...finalOptions})
  }
}
