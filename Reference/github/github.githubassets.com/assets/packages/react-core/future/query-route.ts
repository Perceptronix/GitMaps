import {isFeatureEnabled} from '@github-ui/feature-flags'
import {getQueryClient} from '@github-ui/query-client'
import {
  createPath,
  generatePath,
  type LoaderFunction,
  type Params,
  type PathParam,
  type RouteObject,
  type ShouldRevalidateFunction,
  type TanStackRouteOptions,
  type UIMatch,
  useMatches,
} from '@github-ui/react-router'
import {IS_BROWSER, IS_SERVER, ssrSafeLocation} from '@github-ui/ssr-utils'
import {sendCustomMetric} from '@github-ui/stats'
import {queryOptions} from '@tanstack/react-query'

import type {EmbeddedData} from '../embedded-data-types'
import {makeQueryKey as buildQueryKey, queryKeyObjFromKey, type RouteQueryKey} from '../query-key'
import {
  type ComponentRenderingProperties,
  DECODE_EMBEDDED_PROTO,
  type NonNullableType,
  type QueryDepsFn,
  type QueryRouteQueryConfig,
  QueryRouteQueryType,
  type SerializableQueryDeps,
} from './data-router-types'
import {createRouteErrorBoundary, type CreateRouteErrorBoundaryOptions} from './route-error-boundary'
import {wrapComponentWithProfiler} from './WrapWithProfiler'

type QueryOptions = Omit<
  Parameters<typeof queryOptions<unknown, Error, unknown, RouteQueryKey>>[0],
  'queryFn' | 'queryKey' | 'enabled'
>

type GeneratePathParams<Path extends string> = NonNullable<Parameters<typeof generatePath<Path>>[1]>

type GetEmbeddedDataFn = () => EmbeddedData | undefined

type QueryDepsFromConfig<Config> =
  Config extends QueryRouteQueryConfig<
    string,
    string,
    infer RoutePath extends string,
    string,
    infer Deps,
    unknown,
    QueryRouteQueryType
  >
    ? Deps extends QueryDepsFn<RoutePath>
      ? ReturnType<Deps>
      : SerializableQueryDeps
    : SerializableQueryDeps

type QueriesWithHelpers<
  AppName extends string,
  RouteId extends string,
  RoutePath extends string,
  Queries extends Record<
    string,
    QueryRouteQueryConfig<
      AppName,
      RouteId,
      RoutePath,
      string,
      QueryDepsFn<RoutePath> | undefined,
      unknown,
      QueryRouteQueryType
    >
  >,
> = {
  [Key in keyof Queries]: Queries[Key] & {
    makeQueryKey: (queryDeps?: QueryDepsFromConfig<Queries[Key]>) => RouteQueryKey
    type: NonNullable<Queries[Key]['type']>
    staleTimeForNavigation: number
    navigationBehavior: NonNullable<Queries[Key]['navigationBehavior']>
  }
}

/**
 * The shape of `loaderData` (and each entry in `useRouteMatches()`) for a
 * {@link QueryRoute}. Generic over the specific {@link QueryRoute} so callers
 * get strongly-typed `queries` keys.
 *
 * Note: this shape is intended to be fully JSON-serializable. The route
 * instance itself is *not* stored here — `routeId` is enough for runtime
 * identity checks against `useRouteMatches()`. Code that needs the actual
 * `QueryRoute` instance should reach for `useCurrentQueryRoute()` (which
 * reads it from `match.handle.queryRoute`).
 */
export type RouteMatchData<Config extends AnyQueryRoute = AnyQueryRoute> = {
  routeId: string
  queries: Record<
    keyof Config['queries'],
    {
      type: QueryRouteQueryType
      queryKey: RouteQueryKey
      /**
       * Whether `useRouteQuery` / `useChildRouteQuery` should hide this query's
       * data during the SSR / hydration render pass. Canonical (non-UI-Service)
       * loaders always set this to `false`; `registerRouteWithUIService` sets it
       * to `true` for streaming registrations and `false` otherwise. Required so
       * every loader has to make an explicit choice rather than relying on a
       * default at the read site.
       */
      suppressDuringSSR: boolean
    }
  >
}

/**
 * The shape of a single match's `handle` for a {@link QueryRoute}. The
 * `queryRoute` property is attached by {@link QueryRoute.toRoute} and points
 * back to the route instance, allowing hooks like `useCurrentQueryRoute` to
 * recover the instance from the match tree.
 */
export type RouteMatchHandle = {queryRoute?: AnyQueryRoute}

export type RouteMatches = Array<UIMatch<RouteMatchData | null, RouteMatchHandle>>

interface QueryMeta {
  preloadedAt?: number
  /**
   * Marks a fetch as a speculative preload (hover/focus intent). Set by
   * `preload` here and by the UI Service loader; read by the IndexedDB
   * persister to restore cached data without firing a background revalidation.
   * Absent on real navigations, which revalidate as usual.
   */
  isPreload?: boolean
}

const PreloadStatus = {
  Fresh: 'fresh',
  Stale: 'stale',
  None: 'none',
  Error: 'error',
} as const
type PreloadStatus = (typeof PreloadStatus)[keyof typeof PreloadStatus]

type PreloadInfo = {
  status: PreloadStatus
  preloadedAt?: number
  fetchStatus?: 'fetching' | 'paused' | 'idle'
}

/**
 * Inspects a query's preload metadata and returns its freshness status along with
 * the raw `preloadedAt` timestamp and current `fetchStatus` so callers can emit
 * detail metrics without re-reading the cache.
 */
function getPreloadInfo(queryClient: ReturnType<typeof getQueryClient>, queryKey: RouteQueryKey): PreloadInfo {
  const query = queryClient.getQueryCache().find({queryKey})
  const meta = query?.meta as QueryMeta | undefined
  const preloadedAt = meta?.preloadedAt
  const fetchStatus = query?.state.fetchStatus

  if (!query || preloadedAt === undefined) return {status: PreloadStatus.None, fetchStatus}
  if (query.state.status === 'error') return {status: PreloadStatus.Error, preloadedAt, fetchStatus}

  const preloadAge = Date.now() - preloadedAt

  if (preloadAge > DEFAULT_STALE_TIME_FOR_PRELOAD) return {status: PreloadStatus.Stale, preloadedAt, fetchStatus}

  return {status: PreloadStatus.Fresh, preloadedAt, fetchStatus}
}

export function useRouteMatches() {
  return useMatches() as RouteMatches
}

export const QUERY_ROUTE_QUERY_CLIENT_DEFAULTS = {
  refetchOnWindowFocus: false,
  retry: false,
  networkMode: 'always',
  staleTime: 1000 * 60 * 60 * 24, // 1 day in ms
} as const satisfies QueryOptions

/**
 * Feature flag gating the SWR-preserving blocking-query suspense behavior in
 * `useRouteQuery`. When enabled, a blocking query that reads with no in-memory
 * data (a true cold miss — garbage-collected while unobserved and re-read on a
 * soft navigation back) suspends and restores via the persister instead of
 * rendering `undefined`, and blocking queries adopt the bounded
 * `BLOCKING_QUERY_GC_TIME` retention below. Default off keeps today's behavior
 * (unbounded retention + no suspense, only a dev warning), so the flag is an
 * atomic, instantly reversible switch for a staged (staff/percentage) rollout.
 */
export const BLOCKING_QUERY_SUSPENSE_FLAG = 'blocking_route_query_suspense' as const

// Retention for an unobserved blocking query BEFORE the suspense safety net is
// enabled — the flag-off / rollback path. Preserves the pre-fix 1-day behavior
// exactly, so disabling the flag cannot reintroduce cold-miss `undefined` reads
// on routes that lack a Suspense boundary.
export const BLOCKING_QUERY_GC_TIME_UNBOUNDED = 1000 * 60 * 60 * 24 // 1 day

// Bounded retention used ONLY when `BLOCKING_QUERY_SUSPENSE_FLAG` is on. The
// browser QueryClient is a tab-lifetime singleton (see `browserQueryClient` in
// @github-ui/query-client), so a day-long retention keeps every soft-navigated
// route's cache alive for the whole session and grows heap unboundedly. Bounding
// it lets a long-lived tab plateau. This is only safe alongside the flag: a cold
// miss within the shorter window now suspends and restores via the IndexedDB
// persister (stale-while-revalidate) instead of rendering `undefined`. Coupling
// the bound to the flag keeps the memory fix and its correctness mechanism
// atomic — you never get the tighter eviction without the safety net.
export const BLOCKING_QUERY_GC_TIME = 1000 * 60 * 30 // 30 minutes

/**
 * Resolves the blocking-query `gcTime`: the bounded value once the suspense
 * safety net (`BLOCKING_QUERY_SUSPENSE_FLAG`) is enabled, otherwise today's
 * unbounded retention. Read at query-build time so flipping the flag takes
 * effect on the next route/query build without a rebuild.
 *
 * The unbounded heap growth this bounds is a *client* problem — the browser
 * QueryClient is a tab-lifetime singleton, whereas the server's client is
 * request-scoped and discarded after each render. So on the server the value is
 * immaterial; we skip the flag read entirely there to avoid depending on client
 * env being loaded during SSR (`isFeatureEnabled` throws if it isn't).
 */
export function resolveBlockingQueryGcTime(): number {
  if (IS_SERVER) return BLOCKING_QUERY_GC_TIME_UNBOUNDED
  return isFeatureEnabled(BLOCKING_QUERY_SUSPENSE_FLAG) ? BLOCKING_QUERY_GC_TIME : BLOCKING_QUERY_GC_TIME_UNBOUNDED
}

export class MissingSSREmbeddedDataError extends Error {
  readonly queryName: string
  readonly routeId: string
  readonly routePath: string

  constructor({queryName, routeId, routePath}: {queryName: string; routeId: string; routePath: string}) {
    super(
      `[SSR] Blocking query "${queryName}" on route "${routeId}" is missing embedded data. ` +
        `Blocking queries require embedded data during server rendering. ` +
        `Ensure the server payload includes data for this query. ` +
        `Route path: "${routePath}"`,
    )
    this.name = 'MissingSSREmbeddedDataError'
    this.queryName = queryName
    this.routeId = routeId
    this.routePath = routePath
  }
}

export const DEFAULT_STALE_TIME_FOR_NAVIGATION = 200
export const DEFAULT_STALE_TIME_FOR_PRELOAD = 1000 * 30 // 30 seconds

/**
 * Route-level TanStack options accepted by `QueryRoute`.
 *
 * `TanStackValidateSearch` threads into callback context typing
 * (`beforeLoad`, `shouldReload`, `loaderDeps`). If omitted, search defaults to
 * `Record<string, unknown>` via the shared `TanStackRouteOptions` adapter type.
 *
 * This exists because QueryRoute authoring is object-based. TanStack Router's
 * `createFileRoute(...)(...)` curry naturally carries validator-driven callback
 * types through file routes, but QueryRoute must represent that same contract
 * when options are declared directly on the route instance.
 */
export type QueryRouteTanStackOptions<
  RoutePath extends string = string,
  TanStackValidateSearch extends TanStackRouteOptions['validateSearch'] = never,
> = Pick<
  TanStackRouteOptions<RoutePath, TanStackValidateSearch>,
  'beforeLoad' | 'shouldReload' | 'staticData' | 'loaderDeps' | 'validateSearch'
>

/**
 * Managed form of the {@link QueryRoute.toRoute} `errorBoundary` option. Mirrors
 * {@link CreateRouteErrorBoundaryOptions}, except `boundaryName` defaults to the route id
 * when omitted so failbot reports stay attributable without per-route boilerplate.
 * `critical` defaults to `true` here (route boundaries mean the route failed to render).
 *
 * Notable options:
 * - `shouldReport` — optional predicate to suppress specific errors from failbot (applied
 *   after the built-in 404 skip and `shouldSkipReport` opt-out).
 * - `setDocumentTitleOnResponseError` — defaults to `false`; enable on page-owning layout
 *   boundaries only, so nested subroutes don't clobber the browser tab title.
 */
export type ToRouteManagedErrorBoundaryOptions = Omit<CreateRouteErrorBoundaryOptions, 'boundaryName'> & {
  /** Failbot `reactErrorBoundaryName`. Defaults to the route id. */
  boundaryName?: string
}

/**
 * Escape-hatch form of the {@link QueryRoute.toRoute} `errorBoundary` option. Renders the
 * supplied boundary component directly, short-circuiting the managed self-reporting wrapper.
 * The component is then responsible for its own failbot reporting (a raw route boundary
 * bypasses React 19's `onCaughtError`). Reach for this only when a route needs bespoke
 * boundary behavior the managed `fallback` form can't express.
 */
export type ToRouteOverrideErrorBoundaryOptions = {
  /** A fully custom route boundary component, used verbatim as the route `ErrorBoundary`. */
  override: NonNullable<RouteObject['ErrorBoundary']>
}

/**
 * The `errorBoundary` option accepted by {@link QueryRoute.toRoute}: either the managed,
 * self-reporting boundary (preferred) or the `{override}` escape hatch.
 */
export type ToRouteErrorBoundaryOptions = ToRouteManagedErrorBoundaryOptions | ToRouteOverrideErrorBoundaryOptions

type ToRouteBaseArgs = Pick<RouteObject, Exclude<ComponentRenderingProperties, 'ErrorBoundary'>>

/**
 * Arguments to {@link QueryRoute.toRoute}. The route error boundary is configured through the
 * single `errorBoundary` option — a raw route `ErrorBoundary` is not accepted, because it
 * bypasses React 19's `onCaughtError` and would drop failbot reporting. The option is optional
 * in the type but required in practice by the `require-error-boundary-on-route` lint rule, so a
 * failing route never tears down the whole page layout.
 */
type ToRouteArgs = ToRouteBaseArgs & {
  /**
   * Route error boundary. Two forms:
   *
   * - `{fallback, critical?, boundaryName?}` — the managed, self-reporting boundary
   *   (preferred). Restores the failbot reporting a raw route boundary drops, works in
   *   both the React Router and TanStack Router paths, and defaults `boundaryName` to the
   *   route id and `critical` to `true`.
   * - `{override}` — escape hatch: render a fully custom boundary component directly. It's
   *   then responsible for its own reporting.
   */
  errorBoundary?: ToRouteErrorBoundaryOptions
}

export class QueryRoute<
  AppName extends string,
  RouteId extends string,
  RoutePath extends string,
  Queries extends Record<
    string,
    QueryRouteQueryConfig<
      AppName,
      RouteId,
      RoutePath,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any, // QueryName
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any, // QueryDeps
      unknown, // QueryRes
      QueryRouteQueryType
    >
  >,
  TanStackValidateSearch extends TanStackRouteOptions['validateSearch'] = never,
> {
  #staticAppName: AppName
  #getAppName?: () => AppName
  #getEmbeddedData: GetEmbeddedDataFn
  #shouldRevalidate?: ShouldRevalidateFunction

  // Resolve the app name lazily when a resolver is supplied, so a route
  // registered under a different app than the one that created its singleton
  // (e.g. `code-view` routes under the `repo` app, selected by a feature flag)
  // builds query keys and emits metrics for the app that is actually running.
  // Callers that don't need this (most direct constructors) pass a plain static
  // `appName` and omit `getAppName`.
  get #appName(): AppName {
    return this.#getAppName ? this.#getAppName() : this.#staticAppName
  }

  id: RouteId
  path: RoutePath
  queries: QueriesWithHelpers<AppName, RouteId, RoutePath, Queries>
  index: boolean
  tanStackRouterOptions?: Pick<
    TanStackRouteOptions<RoutePath, TanStackValidateSearch>,
    'beforeLoad' | 'shouldReload' | 'staticData' | 'loaderDeps' | 'validateSearch'
  >

  constructor(args: {
    appName: AppName
    getAppName?: () => AppName
    id: RouteId
    path: RoutePath
    queries: Queries
    index: boolean
    getEmbeddedData: GetEmbeddedDataFn
    shouldRevalidate?: ShouldRevalidateFunction
    tanStackRouterOptions?: QueryRouteTanStackOptions<RoutePath, TanStackValidateSearch>
  }) {
    this.#staticAppName = args.appName
    this.#getAppName = args.getAppName
    this.id = args.id
    this.path = args.path
    this.queries = this.#processQueries(args.queries)
    this.index = args.index
    this.tanStackRouterOptions = args.tanStackRouterOptions
    this.#getEmbeddedData = args.getEmbeddedData
    this.#shouldRevalidate = args.shouldRevalidate
  }

  // Normalize route-level query defaults once so downstream consumers (this
  // class's own loader and `registerRouteWithUIService`) can treat these
  // fields as required and stay in agreement on what "omitted" means.
  // Defaults are applied via `??` rather than spread order so that an
  // explicit `{type: undefined}` from a generic spread still resolves to the
  // documented default — keeping the runtime in sync with the
  // `NonNullable<...>` claim on `QueriesWithHelpers`.
  #processQueries(queries: Queries): QueriesWithHelpers<AppName, RouteId, RoutePath, Queries> {
    return Object.fromEntries(
      objectEntries(queries).map(([queryName, queryConfig]) => {
        const makeQueryKey = (queryDeps?: QueryDepsFromConfig<typeof queryConfig>) =>
          buildQueryKey({
            appName: this.#appName,
            routeId: this.id,
            routePath: this.path,
            queryName: queryName.toString(),
            queryDeps: queryDeps ?? {},
          })

        return [
          queryName,
          {
            ...queryConfig,
            makeQueryKey,
            type: queryConfig.type ?? QueryRouteQueryType.Deferred,
            staleTimeForNavigation: queryConfig.staleTimeForNavigation ?? DEFAULT_STALE_TIME_FOR_NAVIGATION,
            navigationBehavior: queryConfig.navigationBehavior ?? 'stale-while-revalidate',
          },
        ]
      }),
    ) as QueriesWithHelpers<AppName, RouteId, RoutePath, Queries>
  }

  /**
   * Validates whether an argument is the same as the route
   *
   * We don't want to do a pure equality check like `Object.is` since on hydration
   * we might have different/similar objects.
   *
   * Doing a simple `id === id` check since this is most commonly going to catch issues
   * should there be any without doing a real deepEquality check
   */
  isSameRoute(route: unknown): route is QueryRoute<AppName, RouteId, RoutePath, Queries, TanStackValidateSearch> {
    return Boolean(
      typeof route === 'object' && route && 'id' in route && typeof route.id === 'string' && route.id === this.id,
    )
  }

  /**
   * Given a params object generates a valid pathname for the route.
   * Optionally search parameters and/or a hash can be passed.
   */
  generatePath(
    params: {[key in PathParam<RoutePath>]: string} & GeneratePathParams<RoutePath>,
    args?: {
      search?: ConstructorParameters<typeof URLSearchParams>[0]
      hash?: string
    },
  ) {
    return createPath({
      pathname: generatePath(this.path, params),
      search: args?.search ? new URLSearchParams(args.search).toString() : undefined,
      hash: args?.hash,
    })
  }

  #initializeQueryFromEmbeddedData({
    queryName,
    queryKey,
    type,
  }: {
    queryName: keyof Queries
    queryKey: ReturnType<typeof queryOptions>['queryKey']
    type: QueryRouteQueryType
  }) {
    const queryClient = getQueryClient()
    const embeddedData = this.#getEmbeddedData()
    const embeddedDataPayload = embeddedData?.payload as Record<string, Record<keyof Queries, unknown>> | undefined
    const initialData = this.#buildInitialDataForQueryClient({embeddedData, queryName})

    // Note that embedded data is not keyed by `queryDeps`, so it could be applied to any query with the same
    // `routeId` and `queryName`.
    // Because of this, we only want it to apply on initial render, so we delete it after first access.
    if (initialData !== undefined) {
      if (queryName === 'mainQuery') {
        delete embeddedDataPayload?.[this.id]
      } else {
        delete embeddedDataPayload?.[String(queryName)]
        delete embeddedDataPayload?.[this.id]?.[queryName]
      }

      queryClient.setQueryData<typeof initialData>(queryKey, initialData)
    } else if (IS_SERVER && type === QueryRouteQueryType.Blocking) {
      // During SSR, blocking queries MUST have their data provided via embedded data.
      // Fail hard so we don't silently render with missing data.
      throw new MissingSSREmbeddedDataError({
        queryName: String(queryName),
        routeId: this.id,
        routePath: this.path,
      })
    }
  }

  /**
   * Constructs the TanStack Query options object for one of this route's named
   * queries, given the fully-resolved {@link RouteQueryKey}.
   *
   * This is the single source of truth for how a route's per-query options are
   * assembled. Consumers (e.g. `useRouteQuery`) call it to rebuild equivalent
   * options from the route definition without reading from the loader data
   * — the loader payload is intentionally restricted to serializable fields
   * (`queryKey`, `type`) so it round-trips cleanly across the SSR ↔ client
   * boundary.
   *
   * Callsite-specific overrides (e.g. those passed into `useRouteQuery`) are
   * the caller's responsibility to merge on top of the returned object.
   *
   * The return type is intentionally left to inference from `queryOptions(...)`:
   * that gives consumers the same shape TanStack expects in `useQuery`,
   * including the `DataTag` brand on `queryKey` that lets `getQueryData` infer
   * the result type. Hand-rolled aliases here in the past drifted from the
   * real input shape and forced unsafe casts at every call site.
   */
  buildQueryOptions<QueryName extends keyof Queries>(queryName: QueryName, queryKey: RouteQueryKey) {
    const {queryFn, enabled, ...rest} = this.queries[queryName]

    if (!queryFn) {
      throw new Error(`Query function for ${String(queryName)} is missing`)
    }

    // The destructure above pulls everything off the per-query config; `rest`
    // contains the leftover authoring options that `queryOptions()` accepts
    // (e.g. `meta`, `initialData`). Strip the helper fields that aren't part
    // of the TanStack `queryOptions` API.
    const {
      queryName: _queryName,
      queryDeps: _queryDeps,
      makeQueryKey: _makeQueryKey,
      type,
      staleTimeForNavigation: _staleTimeForNavigation,
      navigationBehavior: _navigationBehavior,
      ...routeDefinedQueryOptions
    } = rest

    return queryOptions<unknown, Error, unknown, RouteQueryKey>({
      ...QUERY_ROUTE_QUERY_CLIENT_DEFAULTS,
      queryKey,
      // Blocking queries are seeded at the loader boundary and typed as
      // always-defined. Their gcTime is flag-aware: bounded once the suspense
      // safety net is on (so a long-lived tab's heap plateaus), otherwise the
      // pre-fix unbounded retention (so the flag-off path never reintroduces
      // cold-miss `undefined` reads). See `resolveBlockingQueryGcTime`. The
      // always-defined guarantee lives at the read boundary (suspense +
      // the persister's stale-while-revalidate restore), not in gcTime.
      ...(type === QueryRouteQueryType.Blocking ? {gcTime: resolveBlockingQueryGcTime()} : {}),
      // Forward `signal` lazily via a getter. TSQ defines `ctx.signal` itself
      // as a getter that flips `#abortSignalConsumed = true` on first access
      // (`addSignalProperty` in query-core). Eagerly destructuring `signal`
      // here marks every fetch as abort-aware, which makes `removeObserver`
      // call `retryer.cancel({revert: true})` whenever observers transiently
      // drop to 0 mid-fetch — e.g. under React StrictMode's mount/unmount/
      // mount cycle — discarding the in-flight response and reverting cache
      // to the pre-fetch snapshot. Forwarding via getter only triggers TSQ's
      // signal consumption when the inner queryFn actually reads `.signal`.
      queryFn: ctx => {
        return queryFn(queryKeyObjFromKey(queryKey), {
          get signal() {
            return ctx.signal
          },
          meta: ctx.meta,
        })
      },
      enabled,
      // Cast widens the per-query generic shape (which includes
      // generically-typed `initialData` / `placeholderData`) to the canonical
      // `queryOptions()` input shape. Same pattern used by the `preload` method.
      ...(routeDefinedQueryOptions as QueryOptions),
    })
  }

  /**
   * The react-route compatible loader. This loops through each query defined on the route,
   * fetching or preloading the data as necessary.
   */
  #loader: LoaderFunction = async ({request, params}) => {
    const blockingRequests: Array<Promise<unknown>> = []
    const {searchParams} = new URL(request.url, ssrSafeLocation.origin)

    const pathname = toQualifiedPath(this.path, params)
    const queryClient = getQueryClient()
    let preloadedQueries = 0
    let totalEligibleQueries = 0

    const queryConfigs = objectEntries(this.queries).map(
      ([queryName, {queryDeps, makeQueryKey, type, staleTimeForNavigation, navigationBehavior, enabled}]) => {
        const deps =
          queryDeps?.({
            pathname,
            params: params as NonNullableType<Params<PathParam<RoutePath>>>,
            searchParams,
          }) ?? {}

        const queryKey = makeQueryKey(deps)

        const queryConfig = this.buildQueryOptions(queryName, queryKey)

        const isEnabled = typeof enabled === 'function' ? enabled() : (enabled ?? true)

        if (isEnabled) {
          // Only initialize from embedded data if the query doesn't already have cached data
          // (e.g., from a preload). This prevents overwriting preloaded data and resetting dataUpdatedAt.
          const existingData = queryClient.getQueryData(queryConfig.queryKey)
          if (existingData === undefined) {
            this.#initializeQueryFromEmbeddedData({queryName, queryKey: queryConfig.queryKey, type})
          }
        }

        // Don't try to begin queries on the server, or when explicitly disabled
        if (IS_BROWSER && isEnabled) {
          totalEligibleQueries++

          const fetchConfig = {
            ...queryConfig,
            // during navigation we set the staletime very short to ensure fresh data is pulled, but not too aggressively as to get caught during hydration for a server hydrated query
            staleTime: staleTimeForNavigation,
            meta: {...queryConfig.meta} satisfies QueryMeta,
          }

          // Check if this specific query was recently preloaded (via hover/focus preloading)
          // If so, we can skip refetching to avoid unnecessary network requests
          const {status: preloadStatus, preloadedAt, fetchStatus = 'idle'} = getPreloadInfo(queryClient, queryKey)
          const freshPreload = preloadStatus === PreloadStatus.Fresh

          if (freshPreload) {
            preloadedQueries++

            // Emit per-query detail metrics so we can understand *how* good each hit was:
            //   - value = ms between the preload firing and the navigation reaching the loader
            //   - tag `fetchStatus` = whether the preload had finished by the time we got here
            //     ('idle' = finished, loader avoids a fetch; 'fetching' = still in flight,
            //      loader will dedupe but has to wait for it)
            if (preloadedAt !== undefined) {
              sendCustomMetric({
                name: 'REACT_PRELOAD_LATENCY',
                value: Date.now() - preloadedAt,
                tags: {
                  routeId: this.id,
                  fetchStatus,
                  appName: this.#appName,
                  router: 'data-router',
                },
              })
            }

            sendCustomMetric({
              name: 'REACT_PRELOAD_FETCH_STATUS',
              value: 1,
              tags: {
                routeId: this.id,
                fetchStatus,
                appName: this.#appName,
                router: 'data-router',
              },
            })
          } else if (preloadStatus !== PreloadStatus.None) {
            sendCustomMetric({
              name: 'REACT_PRELOAD_REJECTED',
              value: 1,
              tags: {
                routeId: this.id,
                reason: preloadStatus,
                appName: this.#appName,
                router: 'data-router',
              },
            })
          }

          switch (type) {
            case QueryRouteQueryType.Deferred: {
              /**
               * Deferred queries use prefetchQuery to avoid throwing/rejecting on failure.
               * We initiate these requests during navigation, but we don't await them, so they
               * can resolve anytime between now and well after navigation completes.
               *
               * Skip preloading if data was recently preloaded to avoid unnecessary network requests.
               */
              if (!freshPreload) {
                void queryClient.prefetchQuery(fetchConfig)
              }
              break
            }
            case QueryRouteQueryType.Blocking: {
              /**
               * Immediately returns stale data if it exists, but fetches updates in the background
               * this gives us a default `stale-while-revalidate` behavior.
               *
               * We may later make this configureable with a `blockingQueryBehavior` of `stale-while-revalidate` or `revalidate`
               */
              const state = queryClient.getQueryState(fetchConfig.queryKey)
              const dataAge = state ? Date.now() - state.dataUpdatedAt : Infinity

              // Check if query data doesn't exist, is currently pending, or previously errored.
              // Use fetchStatus to detect in-flight requests to avoid race conditions
              // where rapid double-clicks might not see the query as pending yet.
              // Queries in error state must be re-fetched and awaited to avoid rendering
              // the component with undefined data.
              if (
                !state ||
                state.status === 'pending' ||
                state.status === 'error' ||
                state.fetchStatus === 'fetching'
              ) {
                // fetchQuery will deduplicate in-flight requests automatically
                blockingRequests.push(queryClient.fetchQuery(fetchConfig))
              } else if (navigationBehavior === 'network-first') {
                // Network-first always fetches fresh data, regardless of preload status
                if (dataAge >= staleTimeForNavigation) {
                  void queryClient.invalidateQueries({queryKey: fetchConfig.queryKey})
                  blockingRequests.push(queryClient.fetchQuery(fetchConfig))
                }
              } else if (!freshPreload && dataAge >= staleTimeForNavigation) {
                // For stale-while-revalidate: only invalidate if data wasn't recently preloaded
                // This prevents unnecessary background refetches when navigating after a preload
                void queryClient.invalidateQueries({queryKey: fetchConfig.queryKey})
              }
              break
            }
            default: {
              throw new Error(
                `Invalid QueryRouteQueryType defined, \`${type}\`. Valid QueryRouteQueryTypes are ${JSON.stringify(
                  Object.keys(QueryRouteQueryType),
                )}`,
              )
            }
          }
        }

        // `queryConfig` is intentionally not emitted from the loader: it isn't
        // JSON-serializable and consumers rebuild it on demand via
        // `route.buildQueryOptions(queryName, queryKey)` (see
        // `useQueriesConfig` in `use-route-query.ts`). Canonical routes have
        // no streaming notion, so `suppressDuringSSR` is always false here;
        // `registerRouteWithUIService` sets it to true for streaming queries.
        return [queryName, {queryKey, type, suppressDuringSSR: false}] as const
      },
    )

    await Promise.all(blockingRequests)

    if (IS_BROWSER && preloadedQueries > 0) {
      sendCustomMetric({
        name: 'REACT_PRELOAD_HIT',
        value: 1,
        tags: {
          routeId: this.id,
          type: preloadedQueries === totalEligibleQueries ? 'full' : 'partial',
          appName: this.#appName,
          router: 'data-router',
        },
      })
    }

    // `Object.fromEntries` widens the per-query value type to a string-keyed
    // record, so we narrow it to `RouteMatchData<typeof this>` here. The shape
    // itself is fully JSON-serializable.
    return {
      routeId: this.id,
      queries: Object.fromEntries(queryConfigs),
    }
  }

  /**
   * Given components and children to render, returns a react-router compatible route
   * definition implementing the `QueryRoute` logic.
   */
  toRoute = ({Component, element, errorBoundary, ...args}: ToRouteArgs): RouteObject => {
    const WrappedComponent = wrapComponentWithProfiler(this.id, {element, Component})
    // Default to not revalidating - routes should opt-in to revalidation
    const shouldRevalidate = this.#shouldRevalidate
    const handle = {
      ...args.handle,
      queryRoute: this,
    }
    // The managed `errorBoundary` option builds a self-reporting boundary, defaulting
    // its failbot name to the route id. The `{override}` form is used verbatim,
    // short-circuiting the managed behavior. Resolve `boundaryName` after spreading so an
    // explicit `boundaryName: undefined` still falls back to the route id.
    const ErrorBoundary = errorBoundary
      ? 'override' in errorBoundary
        ? errorBoundary.override
        : createRouteErrorBoundary({...errorBoundary, boundaryName: errorBoundary.boundaryName ?? this.id})
      : undefined
    if (this.index) {
      return {
        ...args,
        id: this.id,
        children: undefined,
        path: this.path,
        index: this.index,
        loader: this.#loader,
        handle,
        shouldRevalidate,
        Component: WrappedComponent,
        ErrorBoundary,
      }
    }

    return {
      ...args,
      id: this.id,
      path: this.path,
      index: this.index,
      loader: this.#loader,
      handle,
      shouldRevalidate,
      Component: WrappedComponent,
      ErrorBoundary,
    }
  }

  #buildInitialDataForQueryClient({
    embeddedData,
    queryName,
  }: {
    embeddedData: EmbeddedData | undefined
    queryName: keyof Queries
  }) {
    // embedded data may be keyed directly by `embeddedData.payload[queryName]`
    // or nested under a route id as `embeddedData.payload[routeId][queryName]`
    const embeddedDataPayload = embeddedData?.payload as Record<string, Record<keyof Queries, unknown>> | undefined
    let routePayload
    // Payload key in `embeddedData.payload`, matching the backend `route_id`
    // (mainQuery -> route id; top-level secondary query -> query name) listed
    // in `meta.protoRoutes`. The nested fallback shape isn't flagged.
    let protoPayloadKey: string | undefined
    if (queryName === 'mainQuery') {
      routePayload = embeddedDataPayload?.[this.id]
      protoPayloadKey = this.id
    } else if (embeddedDataPayload?.[String(queryName)] !== undefined) {
      routePayload = embeddedDataPayload[String(queryName)]
      protoPayloadKey = String(queryName)
    } else {
      routePayload = embeddedDataPayload?.[this.id]?.[queryName]
    }

    if (routePayload === undefined) {
      return
    }

    // Decode embedded proto3-JSON for keys the backend flags in
    // `meta.protoRoutes`, matching the soft-nav fetch path's `fromJson` decode.
    if (protoPayloadKey !== undefined && (embeddedData?.meta?.protoRoutes?.includes(protoPayloadKey) ?? false)) {
      const decodeEmbeddedProto = this.queries[queryName]?.[DECODE_EMBEDDED_PROTO]
      if (decodeEmbeddedProto) {
        routePayload = decodeEmbeddedProto(routePayload, protoPayloadKey)
      }
    }

    if (queryName !== 'mainQuery') {
      return routePayload
    }

    const embeddedDataTitle = embeddedData?.title || embeddedData?.meta?.title

    return {
      meta: embeddedDataTitle ? {title: embeddedDataTitle} : undefined,
      payload: routePayload,
    }
  }

  /**
   * Preloads all queries for this route without blocking.
   *
   * @param params - Route params matching the route's path pattern
   * @param searchParams - Optional URL search parameters
   */
  preload(params: {[key in PathParam<RoutePath>]: string}, searchParams?: URLSearchParams): void {
    if (!IS_BROWSER) return

    const pathname = toQualifiedPath(this.path, params)
    const queryClient = getQueryClient()
    const resolvedSearchParams = searchParams ?? new URLSearchParams()
    let preloaded = false

    for (const [
      _queryName,
      {queryFn, queryDeps, makeQueryKey, navigationBehavior, enabled, ...config},
    ] of objectEntries(this.queries)) {
      // Skip preloading for network-first queries since they will always fetch fresh data on navigation
      if (navigationBehavior === 'network-first') {
        continue
      }

      // Skip preloading for disabled queries
      const isEnabled = typeof enabled === 'function' ? enabled() : (enabled ?? true)
      if (!isEnabled) {
        continue
      }

      const deps =
        queryDeps?.({
          pathname,
          params: params as NonNullableType<Params<PathParam<RoutePath>>>,
          searchParams: resolvedSearchParams,
        }) ?? {}

      const queryKey = makeQueryKey(deps)

      // Skip if this query was already recently preloaded
      if (getPreloadInfo(queryClient, queryKey).status === PreloadStatus.Fresh) {
        continue
      }

      // Skip if this query already has a successful cached result. We'll stale-while-revalidate in this case.
      const queryState = queryClient.getQueryState(queryKey)
      if (queryState?.status === 'success') {
        continue
      }

      void queryClient.prefetchQuery({
        ...QUERY_ROUTE_QUERY_CLIENT_DEFAULTS,
        queryKey,
        // Lazy `signal` getter — see `buildQueryOptions` for the StrictMode
        // cancel-with-revert rationale.
        queryFn: ctx => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return queryFn!(queryKeyObjFromKey(queryKey), {
            get signal() {
              return ctx.signal
            },
            meta: ctx.meta,
          })
        },
        ...(config as QueryOptions),
        meta: {...(config as QueryOptions).meta, preloadedAt: Date.now(), isPreload: true} satisfies QueryMeta,
      })

      preloaded = true
    }

    if (preloaded) {
      sendCustomMetric({
        name: 'REACT_PRELOAD_COUNT',
        value: 1,
        tags: {
          routeId: this.id,
          appName: this.#appName,
          router: 'data-router',
        },
      })
    }
  }
}

/**
 * A QueryRoute with any queries — used when the specific query shape doesn't matter.
 * */
export type AnyQueryRoute = QueryRoute<
  string,
  string,
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Record<string, QueryRouteQueryConfig<any, any, any, any, any, any, any>>
>

/**
 * Given a `routePath` path pattern and a loader-like params object return a
 * string with the params replacing the pattern
 */
function toQualifiedPath<RoutePath extends string>(routePath: RoutePath, params: Params<PathParam<RoutePath>>) {
  return generatePath(routePath, translateUndefinedToNull(params) as GeneratePathParams<RoutePath>)
}

/**
 * Given an object with potentially undefined parameters map those to `null`
 *
 * This is mostly useful for mapping an object from a loader params shape
 * to a generatePath params shape
 */
function translateUndefinedToNull<T extends Record<string, string | undefined>>(
  input: T,
): Record<keyof T, string | null> {
  return Object.fromEntries(
    objectEntries(input).map(([key, value]) => [key, value === undefined ? null : value] as const),
  ) as Record<keyof T, string | null>
}

/**
 * A small type-safe wrapper around `Object.entries`
 *
 * By default, typescript makes the entries keys `string` typed only (as it does for Object.keys)
 * this assumes a bit more stable structure around the entries
 */
const objectEntries = <T extends object>(obj: T) => {
  return Object.entries(obj) as Array<[keyof typeof obj, (typeof obj)[keyof typeof obj]]>
}
