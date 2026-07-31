// eslint-disable-next-line @github-ui/github-monorepo/prefer-github-ui-react-router
import {
  createPath,
  matchRoutes,
  type NavigateOptions,
  resolvePath,
  type RouteObject,
  type To,
  useNavigate as useReactRouterNavigate,
} from 'react-router'
import isHashNavigation from '@github-ui/is-hash-navigation'
import {startSoftNav} from '@github-ui/soft-nav/state'
import {useCallback, use, createContext} from 'react'
import {PREVENT_AUTOFOCUS_KEY, type NavigateOptionExtensions} from '../shared'

// Note: the name for this interface went stale. It should really be something like
// NavigateOptionsWithExtensions.
export type NavigateOptionsWithPreventAutofocus = NavigateOptions & NavigateOptionExtensions

export interface RoutesContextType {
  routes: RouteObject[]
}

export const RoutesContext = createContext<RoutesContextType>({routes: []})

/**
 * A wrapper around `react-router`'s useNavigate that adds support for:
 * - Soft navigation with Turbo for external links (when `reloadDocument` is not set)
 * - Preventing autofocus on navigation when `preventAutofocus` is set
 * - Starting a soft navigation with `@github-ui/soft-nav` for non-hash internal links to allow
 *   for features like the progress bar and transition animations
 */
export const useNavigate = (): ((to: To, options?: NavigateOptionsWithPreventAutofocus) => void) => {
  const {routes} = use(RoutesContext)
  const reactRouterNavigate = useReactRouterNavigate()
  return useCallback(
    (to, navigateOptions = {}) => {
      const pathname = resolvePath(to).pathname
      const isExternalToApp = !matchRoutes(routes, pathname)

      if (isExternalToApp || navigateOptions.reloadDocument) {
        const href = typeof to === 'string' ? to : createPath(to)
        if (navigateOptions.preventTurbo) {
          window.location.href = href
        } else {
          ;(async () => {
            const {softNavigate: turboSoftNavigate} = await import('@github-ui/soft-navigate')
            turboSoftNavigate(href)
          })()
        }
      } else {
        if (!isHashNavigation(location.href, to.toString())) {
          startSoftNav('react')
        }
        const {preventAutofocus, ...options} = navigateOptions
        reactRouterNavigate(
          to,
          preventAutofocus
            ? {
                ...options,
                state: {
                  [PREVENT_AUTOFOCUS_KEY]: true,
                  ...options.state,
                },
              }
            : options,
        )
      }
    },
    [reactRouterNavigate, routes],
  )
}
