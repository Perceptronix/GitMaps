import {
  useIsTanStackRouter,
  useBlocker as useBlockerTanStack,
  useBlockerLegacy as useBlockerLegacyTanStack,
  useLinkClickHandler as useLinkClickHandlerTanStack,
  useLoaderData as useLoaderDataTanStack,
  useLocation as useLocationTanStack,
  useMatches as useMatchesTanStack,
  useNavigate as useNavigateTanStack,
  useNavigation as useNavigationTanStack,
  useNavigationType as useNavigationTypeTanStack,
  useParams as useParamsTanStack,
  usePreloadRoute as usePreloadRouteTanStack,
  useRouteError as useRouteErrorTanStack,
  useRouteLoaderData as useRouteLoaderDataTanStack,
  useSearchParams as useSearchParamsTanStack,
} from './tanstack-router'
import {useMatch as useMatchTanStack} from './tanstack-router-migrate'
import {
  type Location,
  useBlocker as useBlockerReactRouter,
  useBlockerLegacy as useBlockerLegacyReactRouter,
  useLinkClickHandler as useLinkClickHandlerReactRouter,
  useLoaderData as useLoaderDataReactRouter,
  useLocation as useLocationReactRouter,
  useMatch as useMatchReactRouter,
  useMatches as useMatchesReactRouter,
  useNavigate as useNavigateReactRouter,
  useNavigation as useNavigationReactRouter,
  useNavigationType as useNavigationTypeReactRouter,
  useParams as useParamsReactRouter,
  usePreloadRoute as usePreloadRouteReactRouter,
  useRouteError as useRouteErrorReactRouter,
  useRouteLoaderData as useRouteLoaderDataReactRouter,
  useSearchParams as useSearchParamsReactRouter,
  NavigationType,
} from './react-router'

export type {
  Blocker,
  BrowserHistory,
  ErrorResponse,
  LinkProps,
  LoaderFunction,
  LoaderFunctionArgs,
  Location,
  GetScrollRestorationKeyFunction,
  HistoryRouterProps,
  InitialEntry,
  MemoryRouterProps,
  Navigator,
  NavigateOptions,
  NavigateOptionsWithPreventAutofocus,
  NavigateProps,
  NavLinkProps,
  Params,
  PathParam,
  RelativeRoutingType,
  RouteObject,
  RouterProviderProps,
  RoutesContextType,
  SetURLSearchParams,
  ShouldRevalidateFunction,
  ShouldRevalidateFunctionArgs,
  To,
  UIMatch,
  URLSearchParamsInit,
} from './react-router'

export {PREVENT_AUTOFOCUS_KEY, DEFAULT_INTENT_PRELOAD_DELAY, type PreloadableRoute, type PreloadProps} from './shared'
export type {TanStackRouteOptions} from './tanstack-adapters/types'
export {buildTanStackRouteOptions} from './tanstack-adapters/build-tanstack-route-options'
export {tanStackSearchToURLSearchParams} from './tanstack-router/to-url-search-params'

export {
  BrowserRouter,
  createBrowserRouter,
  createMemoryRouter,
  createPath,
  createSearchParams,
  createStaticHandler,
  createStaticRouter,
  generatePath,
  isRouteErrorResponse,
  matchPath,
  matchRoutes,
  MemoryRouter,
  NavigationType,
  Navigate,
  redirect,
  resolvePath,
  Route,
  Router,
  RouterContextProvider,
  RouterProvider,
  Routes,
  RoutesContext,
  StaticRouter,
  StaticRouterProvider,
  UNSAFE_createBrowserHistory,
  unstable_usePrompt,
  useBeforeUnload,
  useDangerousNavigate,
  useResolvedPath,
  useRoutes,
  useDangerousSearchParams,
  useInRouterContext,
} from './react-router'

export {Outlet, Link, NavLink, ExtendedLink, ExtendedNavLink, ScrollRestoration} from './components'

/**
 * Returns a callback that preloads all queries for a given route by parsing the provided URL.
 *
 * In a TanStack Router context, calls `router.preloadRoute()` to preload lazy route
 * components and trigger TanStack Router loaders.
 *
 * In a Data Router context, the URL is matched against the app's registered routes
 * (from RoutesContext) to find a route with a `handle.queryRoute` that has a `preload` method.
 *
 * @returns A function that accepts a URL string and triggers preloading.
 *          Returns `true` if the URL matched a preloadable route, `false` otherwise.
 *
 * @example
 * ```tsx
 * const preload = usePreloadRoute()
 *
 * <Link to="/users/42" onMouseEnter={() => preload('/users/42')}>
 *   User 42
 * </Link>
 * ```
 */
export function usePreloadRoute(): (url: string) => boolean {
  'use no memo' // opted out temporarily. These hooks are dynamic shaped, but have static runtimes, which can't be validated by the compiler
  const isTanStack = useIsTanStackRouter()
  const hook = isTanStack ? usePreloadRouteTanStack : usePreloadRouteReactRouter
  return hook()
}

export const useMatches = (): ReturnType<typeof useMatchesReactRouter> => {
  'use no memo' // opted out temporarily. These hooks are dynamic shaped, but have static runtimes, which can't be validated by the compiler
  const isTanstackContext = useIsTanStackRouter()
  const hook = isTanstackContext ? useMatchesTanStack : useMatchesReactRouter
  return hook()
}

export function useMatch(...args: Parameters<typeof useMatchReactRouter>): ReturnType<typeof useMatchReactRouter> {
  'use no memo' // opted out temporarily. These hooks are dynamic shaped, but have static runtimes, which can't be validated by the compiler
  const isTanstackContext = useIsTanStackRouter()
  const hook = isTanstackContext ? useMatchTanStack : useMatchReactRouter
  return hook(...args)
}

export const useRouteError = (): ReturnType<typeof useRouteErrorReactRouter> => {
  'use no memo' // opted out temporarily. These hooks are dynamic shaped, but have static runtimes, which can't be validated by the compiler
  const isTanstackContext = useIsTanStackRouter()
  const hook = isTanstackContext ? useRouteErrorTanStack : useRouteErrorReactRouter
  return hook()
}

export const useNavigate = (): ReturnType<typeof useNavigateReactRouter> => {
  'use no memo' // opted out temporarily. These hooks are dynamic shaped, but have static runtimes, which can't be validated by the compiler
  const isTanstackContext = useIsTanStackRouter()
  const hook = isTanstackContext ? useNavigateTanStack : useNavigateReactRouter
  return hook()
}

export const useSearchParams = (): ReturnType<typeof useSearchParamsReactRouter> => {
  'use no memo' // opted out temporarily. These hooks are dynamic shaped, but have static runtimes, which can't be validated by the compiler
  const isTanstackContext = useIsTanStackRouter()
  const hook = isTanstackContext ? useSearchParamsTanStack : useSearchParamsReactRouter
  return hook()
}

export function useParams<T extends string = string>(): Partial<Record<T, string>>
export function useParams<T extends Readonly<Record<string, string | undefined>>>(): Partial<T>
export function useParams() {
  'use no memo' // opted out temporarily. These hooks are dynamic shaped, but have static runtimes, which can't be validated by the compiler
  const isTanstackContext = useIsTanStackRouter()
  const hook = isTanstackContext ? useParamsTanStack : useParamsReactRouter
  return hook()
}

export function useLocation(): ReturnType<typeof useLocationReactRouter> {
  'use no memo' // opted out temporarily. These hooks are dynamic shaped, but have static runtimes, which can't be validated by the compiler
  const isTanstackContext = useIsTanStackRouter()
  const hook = isTanstackContext ? useLocationTanStack : useLocationReactRouter
  return hook()
}

export function useNavigation(): Pick<ReturnType<typeof useNavigationReactRouter>, 'state' | 'location'> {
  'use no memo' // opted out temporarily. These hooks are dynamic shaped, but have static runtimes, which can't be validated by the compiler
  const isTanstackContext = useIsTanStackRouter()
  const hook = isTanstackContext ? useNavigationTanStack : useNavigationReactRouter
  return hook()
}

export function useNavigationType(): ReturnType<typeof useNavigationTypeReactRouter> {
  'use no memo' // opted out temporarily. These hooks are dynamic shaped, but have static runtimes, which can't be validated by the compiler
  const isTanstackContext = useIsTanStackRouter()
  const hook = isTanstackContext ? useNavigationTypeTanStack : useNavigationTypeReactRouter
  const action = hook()
  // Normalize TanStack Router's string action into React Router's NavigationType
  // enum for this shared API. This mapping is runtime-safe because string enum
  // members compare equal to their payloads, e.g. NavigationType.Push === 'PUSH'.
  // We keep the conversion here instead of in the TSR-only hook because importing
  // NavigationType there would pull a React Router runtime value, not just a type,
  // into a TanStack-only module.
  switch (action) {
    case 'PUSH':
      return NavigationType.Push
    case 'REPLACE':
      return NavigationType.Replace
    case 'POP':
      return NavigationType.Pop
  }
}

export function useBlocker(
  shouldBlock:
    | boolean
    | (({
        currentLocation,
        nextLocation,
      }: {
        currentLocation: Pick<Location, 'pathname'>
        nextLocation: Pick<Location, 'pathname'>
      }) => boolean),
): ReturnType<typeof useBlockerReactRouter> {
  'use no memo' // opted out temporarily. These hooks are dynamic shaped, but have static runtimes, which can't be validated by the compiler
  const isTanstackContext = useIsTanStackRouter()
  const hook = isTanstackContext ? useBlockerTanStack : useBlockerReactRouter
  return hook(shouldBlock)
}

export function useLinkClickHandler<E extends Element = HTMLAnchorElement>(
  ...args: Parameters<typeof useLinkClickHandlerReactRouter>
): (event: React.MouseEvent<E>) => void {
  'use no memo' // opted out temporarily. These hooks are dynamic shaped, but have static runtimes, which can't be validated by the compiler
  const isTanstackContext = useIsTanStackRouter()
  const hook = isTanstackContext ? useLinkClickHandlerTanStack : useLinkClickHandlerReactRouter
  return hook<E>(...args)
}

/**
 * @deprecated - `useBlockerLegacy` does not block soft navigations in DataRouter apps
 * in a React Router context; callers should prefer `useBlocker` instead.
 */
export function useBlockerLegacy(
  blocker: Parameters<typeof useBlockerLegacyReactRouter>[0],
  message: string,
  when = true,
) {
  'use no memo' // opted out temporarily. These hooks are dynamic shaped, but have static runtimes, which can't be validated by the compiler
  const isTanstackContext = useIsTanStackRouter()
  const hook = isTanstackContext ? useBlockerLegacyTanStack : useBlockerLegacyReactRouter
  return hook(blocker, message, when)
}

// Mirror React Router's any default for compatibility with legacy call sites without generic.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useLoaderData<T = any>() {
  'use no memo' // opted out temporarily. These hooks are dynamic shaped, but have static runtimes, which can't be validated by the compiler
  const isTanstackContext = useIsTanStackRouter()
  const hook = isTanstackContext ? useLoaderDataTanStack : useLoaderDataReactRouter
  return hook<T>()
}

// Mirror React Router's any default for compatibility with legacy call sites without generic.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useRouteLoaderData<T = any>(
  reactRouterRouteId: string,
): ReturnType<typeof useRouteLoaderDataReactRouter<T>> {
  'use no memo' // opted out temporarily. These hooks are dynamic shaped, but have static runtimes, which can't be validated by the compiler
  const isTanstackContext = useIsTanStackRouter()
  const hook = isTanstackContext ? useRouteLoaderDataTanStack : useRouteLoaderDataReactRouter
  return hook<T>(reactRouterRouteId)
}

export {createTanStackRouter} from './tanstack-adapters/create-tanstack-router'
export {convertToTanStackPath} from './tanstack-adapters/route-path-adapter'
export {
  RouterProvider as TanStackRouterProvider,
  createMemoryHistory as createTanStackMemoryHistory,
} from '@tanstack/react-router'
export type {
  AnyRoute as AnyTanStackRoute,
  AnyRouter as AnyTanStackRouter,
  RouterHistory as TanStackRouterHistory,
  RouterOptions as TanStackRouterOptions,
} from '@tanstack/react-router'
