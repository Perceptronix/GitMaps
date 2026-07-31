// This file is a migration bridge for callsites that are guaranteed to be in a TanStack Router context,
// but render components that implement React-Router-style APIs.
//
// Consistent export names across `@github-ui/react-router` exports are enforced by `exports.browser.test.ts`.

// eslint-disable-next-line @github-ui/github-monorepo/prefer-github-ui-react-router
import {
  matchPath as reactRouterMatchPath,
  type PathMatch as ReactRouterPathMatch,
  type PathPattern as ReactRouterPathPattern,
} from 'react-router'
import {useMatches} from './tanstack-router'

// TanStack-only implementations that mirror React Router APIs.
export {
  Outlet,
  PREVENT_AUTOFOCUS_KEY,
  useNavigate,
  useRouteError,
  useSearchParams,
  useMatches,
  useParams,
  usePreloadRoute,
  useLoaderData,
  useRouteLoaderData,
  useLocation,
  useNavigation,
  useNavigationType,
  useBlocker,
  useBlockerLegacy,
  useLinkClickHandler,
  isExternalToApp,
  Link,
  NavLink,
  ExtendedLink,
  ExtendedNavLink,
  useIsTanStackRouter,
  tanStackSearchToURLSearchParams,
} from './tanstack-router'
export type {URLSearchParamsInit, To, NavigateOptionsWithPreventAutofocus} from './tanstack-router'
export {DEFAULT_INTENT_PRELOAD_DELAY, type PreloadableRoute, type PreloadProps} from './shared'
export {ScrollRestoration} from './components'
export {convertToTanStackPath} from './tanstack-adapters/route-path-adapter'
export type {TanStackRouteOptions} from './tanstack-adapters/types'
export {buildTanStackRouteOptions} from './tanstack-adapters/build-tanstack-route-options'

// Re-exports remaining React Router APIs that haven't been implemented in TanStack Router yet.
// These exports should be removed as TanStack Router equivalent APIs are added.
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
  UIMatch,
} from './react-router'

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

/**
 * We export this here and not from `./tanstack-router/index` because the shim relies
 * on React Router's matchPath utility. ./tanstack-router/* exports should be TanStack-only.
 * Reimplementating the internals of matchPath is non-trivial and not currently worth the maintenance burden.
 */
export function useMatch<ParamKey extends string = string>(
  pattern: string | ReactRouterPathPattern,
): ReactRouterPathMatch<ParamKey> | null {
  // Derive useMatch from the committed useMatches() snapshot so both hooks observe the same committed
  // matches during navigation.
  // We intentionally avoid useLocation() here because it can observe a different in-flight snapshot and
  // result in useMatch() and useMatches() disagreeing about which routes are mounted.
  const committedMatches = useMatches()

  // reactRouterMatchPath is a React Router utility that does not depend on RR context.
  const possibleMatches = committedMatches.map(m => reactRouterMatchPath(pattern, m.pathname))
  return possibleMatches.find(Boolean) ?? null
}
