import type {Location, NavigateOptions as RouterNavigateOptions, RouterProviderProps, To} from '@github-ui/react-router'
import {matchRoutes} from '@github-ui/react-router'
import {startSoftNav} from '@github-ui/soft-nav/state'
import {createPath, parsePath, type Path} from 'history'

type Router = RouterProviderProps['router']

/**
 * Staff magic params that should be preserved across navigations.
 * These are used for feature flags and tracing in development/staff environments.
 */
const STAFF_MAGIC_PARAMS = ['_features', '_tracing'] as const

/**
 * Wraps the router's navigate function to add support for Turbo and Soft Navigation.
 *
 * When this is called, immediately `startSoftNav` if necessary
 * Apply a default `skipTurbo` state override to all router navigations
 * Preserve staff magic params (`_features`, `_tracing`) from the current URL
 *
 * This ensures that we mark react soft navigations correctly as well as ensure turbo doesn't
 * incorrectly handle react navigations.
 *
 * @param router The router to wrap.
 * @returns A new router with the wrapped navigate function.
 */
export function wrapRouterNavigateForTurboAndSoftNavs(router: Router): Router {
  return new Proxy(router, {
    get(target, prop, receiver) {
      if (prop === 'navigate') {
        return function (to: To | null | number, opts?: RouterNavigateOptions): Promise<void> {
          if (typeof to === 'number') {
            return target.navigate(to)
          }

          const currentLocation = target.state.location
          const nextLocation = typeof to === 'string' ? parsePath(to) : to

          // Preserve staff magic params from current URL
          const toWithMagicParams = preserveStaffMagicParams(nextLocation)

          const externalNav = toWithMagicParams
            ? resolveExternalNavigation(target, currentLocation, nextLocation)
            : undefined
          if (toWithMagicParams && externalNav) {
            const destinationUrl =
              typeof toWithMagicParams === 'string' ? toWithMagicParams : createPath(toWithMagicParams)
            if (externalNav === 'reload') {
              navigation.hardNavigate(destinationUrl)
              return Promise.resolve()
            }

            // Destination is outside this app's router; let the owning app load it.
            if (process.env.NODE_ENV === 'development') {
              // eslint-disable-next-line no-console
              console.warn(
                `[react-router] Navigating to "${destinationUrl}", which isn't served by this app's router — ` +
                  `handing off to a full navigation. If this route is meant to be client-side, it may be ` +
                  `missing from the app's route registration.`,
              )
            }
            return navigation.turboNavigate(destinationUrl)
          }

          const hashNav = isHashNav(currentLocation, nextLocation)
          if (!hashNav) {
            startSoftNav('react')
          }

          const isPushAction = !opts?.replace
          const skipTurboState = opts?.state?.skipTurbo

          return target.navigate(toWithMagicParams, {
            ...opts,
            // Prevent scroll reset on hash-only navigations to avoid jumping to top
            // before virtualized content can scroll to the target line
            preventScrollReset: hashNav ? true : opts?.preventScrollReset,
            state: {
              ...opts?.state,
              skipTurbo: isPushAction ? (skipTurboState ?? true) : skipTurboState,
            },
          })
        }
      }

      // Pass through all other props
      return Reflect.get(target, prop, receiver)
    },
  })
}

// exposed for testing and easier mocking
export const navigation = {
  hardNavigate(url: string) {
    window.location.href = url
  },
  async turboNavigate(url: string) {
    const {softNavigate} = await import('@github-ui/soft-navigate')
    softNavigate(url)
  },
}

// 'reload' -> full document reload; 'turbo' -> Turbo navigation handoff.
type ExternalNavigation = 'reload' | 'turbo'

function resolveExternalNavigation(
  target: Router,
  currentLocation: Location,
  nextLocation: Partial<Path> | null,
): ExternalNavigation | undefined {
  try {
    // Code view: navigating to a different repo does a full page reload to avoid stale data.
    const isCodeView = !!target.state?.loaderData?.codeViewLayoutRoute
    if (isCodeView && nextLocation?.pathname && !isSameRepoPath(currentLocation.pathname, nextLocation.pathname)) {
      return 'reload'
    }

    // Absolute paths this router can't match would dead-end on its internal 404 boundary,
    // so hand off to a Turbo navigation and let the owning app load it. Relative paths
    // ('.', '..') resolve against the current in-app location, so we skip them here.
    const pathname = nextLocation?.pathname
    if (pathname?.startsWith('/') && !matchRoutes(target.routes, pathname)) {
      return 'turbo'
    }

    return undefined
  } catch {
    // If we can't resolve the destination, fall back to a full reload rather than risk
    // dead-ending on a broken client navigation.
    return 'reload'
  }
}

function isSameRepoPath(url1: string, url2: string): boolean {
  const path1 = url1.split('/', 3).join('/')
  const path2 = url2.split('/', 3).join('/')
  return path1 === path2
}

/**
 * Preserves staff magic params (`_features`, `_tracing`) from the current browser URL
 * to the destination URL if they aren't already present in the destination.
 */
function preserveStaffMagicParams(to: Partial<Path> | null): To | null {
  if (!to) return null

  const currentSearchParams = new URLSearchParams(window.location.search)
  const destinationSearchParams = new URLSearchParams(to.search || '')

  let modified = false
  for (const param of STAFF_MAGIC_PARAMS) {
    const currentValue = currentSearchParams.get(param)
    if (currentValue && !destinationSearchParams.has(param)) {
      destinationSearchParams.set(param, currentValue)
      modified = true
    }
  }

  if (!modified) {
    return to
  }

  const newSearch = destinationSearchParams.toString()
  return createPath({
    ...to,
    search: newSearch ? `?${newSearch}` : '',
  })
}

function isHashNav(current: Partial<Path>, next: Partial<Path> | null): boolean {
  if (!next) return false

  if (next.pathname !== undefined && next.pathname !== current.pathname) return false
  if (next.search !== undefined && next.search !== current.search) return false

  return Boolean(next.hash !== undefined && next.hash !== current.hash)
}
