import {isFeatureEnabled} from '@github-ui/feature-flags'
import {getQueryClient} from '@github-ui/query-client'
import {useLoaderData, useRouteLoaderData} from '@github-ui/react-router'
import {useRuntimeEnvironment} from '@github-ui/ssr-utils/use-runtime-environment'
import {type UseQueryResult, useSuspenseQuery, type UseSuspenseQueryResult} from '@tanstack/react-query'

import type {RouteQueryKey} from '../query-key'
import type {
  ConfigQueryResultData,
  QueryOverridesFor,
  QueryRouteQueryConfig,
  SuspenseQueryOverridesFor,
  UseQueriesConfigOptions,
  UseRouteQueryResult,
} from './data-router-types'
import {QueryRouteQueryType} from './data-router-types'
import {BLOCKING_QUERY_SUSPENSE_FLAG, type QueryRoute, type RouteMatchData, useRouteMatches} from './query-route'
import {useStreamingCompatibleQuery} from './use-streaming-compatible-query'

/**
 * Pure predicate: should a blocking route query *suspend* on read instead of
 * returning `undefined`? True only on a true cold miss — a blocking query
 * whose first fetch is in flight with no data yet (`isLoading`). This
 * intentionally excludes:
 *  - queries that already have data (stale or fresh) → served immediately,
 *    revalidated in the background: stale-while-revalidate, no suspend.
 *  - disabled (`enabled: false`) queries → `isLoading` is false when not
 *    fetching, so they never suspend (and never hang).
 *  - errored queries → surfaced via `isError`, not swallowed by a fallback.
 *
 * NOTE: `suppressDuringSSR` is intentionally NOT a parameter here. It is a
 * *persistent* route marker that stays `true` after hydration for streaming
 * routes (registered via `registerRouteWithUIService`). Checking it here
 * would permanently disable cold-miss suspense for those routes on the client.
 * SSR gating is handled by the caller's `!isServer` check.
 *
 * Extracted for unit testing.
 */
export function shouldSuspendBlockingColdMiss({
  type,
  result,
}: {
  type: QueryRouteQueryType
  result: Pick<UseQueryResult<unknown>, 'data' | 'isLoading' | 'isError'>
}): boolean {
  return type === QueryRouteQueryType.Blocking && result.isLoading && result.data === undefined && !result.isError
}

const warnedBlockingQueryKeys = new Set<string>()

function warnBlockingColdMissOnce(queryName: string, queryKey: RouteQueryKey): void {
  const dedupeKey = `${queryName}:${JSON.stringify(queryKey)}`
  if (warnedBlockingQueryKeys.has(dedupeKey)) return
  warnedBlockingQueryKeys.add(dedupeKey)
  // eslint-disable-next-line no-console
  console.warn(
    `[react-core] Blocking route query "${queryName}" rendered with no cached data — a cold miss. Blocking ` +
      `queries are typed as always-defined, but this one was garbage-collected while unobserved and re-read ` +
      `before its refetch resolved, so it momentarily reads \`undefined\` and can break callers that assume ` +
      `defined data. Enable the \`${BLOCKING_QUERY_SUSPENSE_FLAG}\` flag (with a Suspense boundary wrapping the ` +
      `route) so it suspends and serves cached/persisted data with stale-while-revalidate instead.`,
  )
}

/**
 * Default for the `TData` generic on the route query hooks. Mirrors `ConfigQueryResultData`
 * so callers who do not narrow via `select` get the query's fetched data type unchanged.
 */
type DefaultQueryData<
  Config extends QueryRoute<
    string,
    string,
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Record<string, QueryRouteQueryConfig<string, any, any, any, any, any, any>>
  >,
  QueryName extends string & keyof Config['queries'],
> = ConfigQueryResultData<Config, QueryName>

/**
 * Returns the query configurations for a given route.
 * If called from the wrong route, throws an error.
 */
export function useQueriesConfigs<
  Config extends QueryRoute<
    string,
    string,
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Record<string, QueryRouteQueryConfig<string, any, any, any, any, any, QueryRouteQueryType>>
  >,
>(routeArg: Config, {allowReadFromChildRoutes}: UseQueriesConfigOptions = {}): RouteMatchData<Config>['queries'] {
  const matches = useRouteMatches()
  const argRouteIndex = matches.findIndex(r => r.id === routeArg.id)
  if (argRouteIndex === -1) {
    const validRouteIds = matches.map(m => m.id).join(', ')
    throw new Error(
      `Cannot read data from unmounted route with ID "${routeArg.id}". Mounted route IDs are: ${validRouteIds}`,
    )
  }
  const {routeId: currentRouteId} = useLoaderData()
  const {queries} = useRouteLoaderData(routeArg.id) as RouteMatchData<Config>

  const currentRouteIndex = matches.findIndex(r => r.id === currentRouteId)
  if (!allowReadFromChildRoutes && argRouteIndex > currentRouteIndex) {
    const validRouteIds = matches.map(m => m.id).join(', ')
    throw new Error(
      `Cannot read data from child route with ID "${routeArg.id}" from parent route "${currentRouteId}". Use { allowReadFromChildRoutes: true } option to enable this.  Mounted route IDs are: ${validRouteIds}`,
    )
  }

  return queries
}

/**
 * Returns a single query configuration by name.
 *
 * The returned shape is the loader entry augmented with `queryConfig` (the
 * TanStack Query options to feed into `useQuery` / `useSuspenseQuery`).
 * `queryConfig` is intentionally absent from `RouteMatchData` because it
 * isn't JSON-serializable; we rebuild it on demand from the route
 * definition via `route.buildQueryOptions`, using the serializable
 * `queryKey` from loader data as the source of truth.
 */
export function useQueriesConfig<
  Config extends QueryRoute<
    string,
    string,
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Record<string, QueryRouteQueryConfig<string, any, any, any, any, any, QueryRouteQueryType>>
  >,
  QueryName extends string & keyof Config['queries'],
>(route: Config, queryName: QueryName, options?: UseQueriesConfigOptions) {
  const ctx = useQueriesConfigs(route, options)
  const entry = ctx[queryName]
  const queryConfig = route.buildQueryOptions(queryName, entry.queryKey)
  // `entry.suppressDuringSSR` is set by every loader (canonical loaders use false;
  // `registerRouteWithUIService` sets true for streaming registrations) so we can
  // pass it straight through to `useStreamingCompatibleQuery`.
  return {...entry, queryConfig}
}

/**
 * Given a named route query and a route, returns the
 * result of calling useQuery on the generated route config.
 *
 * Overrides for query configuration can be optionally passed as a third argument
 *
 * When called on a blocking route, data is always defined.
 * When called on a deferred route, data is potentially undefined.
 */
export function useRouteQuery<
  Config extends QueryRoute<
    string,
    string,
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Record<string, QueryRouteQueryConfig<string, any, any, any, any, any, any>>
  >,
  QueryName extends string & keyof Config['queries'],
  TData = DefaultQueryData<Config, QueryName>,
>(route: Config, queryName: QueryName, queryOverrides?: QueryOverridesFor<Config, QueryName, TData>) {
  const {queryConfig, suppressDuringSSR, type} = useQueriesConfig(route, queryName)
  /**
   * If we have a deferred query we don't have initial data always defined, so it potentially
   * could render with `undefined`.  When we have a blocking query, the loader awaits the data
   * so it should never be undefined
   */
  // `useStreamingCompatibleQuery` is a no-op wrapper around `useQuery` when
  // `suppressDuringSSR` is false (the canonical case). Routing through it
  // here lets streaming-capable routes (UI Service-registered ones, where the
  // loader sets `suppressDuringSSR: true` on the loaderData entry) get SSR
  // suppression automatically without a separate code path.
  const result = useStreamingCompatibleQuery(
    // @ts-expect-error not sure
    {...queryConfig, ...queryOverrides},
    suppressDuringSSR,
  )

  const {isServer} = useRuntimeEnvironment()

  // Flag-gated, SWR-preserving suspend on a true cold miss. When the query has
  // no in-memory data yet (garbage-collected while unobserved, then re-read on a
  // soft navigation), rendering would otherwise return `undefined` and break the
  // page. Suspending here does NOT discard data: the thrown promise dedupes with
  // the in-flight fetch and, via the IndexedDB persister, resolves with stale
  // data before revalidating in the background — stale-while-revalidate. When
  // any cached/stale data already exists, `isLoading` is false so we never
  // suspend and serve it immediately. Never runs on the server (blocking data is
  // seeded from the embedded SSR payload there).
  if (!isServer && isFeatureEnabled(BLOCKING_QUERY_SUSPENSE_FLAG) && shouldSuspendBlockingColdMiss({type, result})) {
    // @ts-expect-error queryConfig is loosely typed here, same as the useQuery call above
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- throwing a promise is the React Suspense mechanism.
    throw getQueryClient().ensureQueryData({...queryConfig, ...queryOverrides})
  }

  // When the flag is OFF, surface the same cold miss as a dev-only warning
  // (deduped per queryKey) so we can find callsites that would break — or that
  // need a Suspense boundary — before enabling the flag. The condition mirrors
  // the suspend gate above: if the flag were on, this is exactly where we'd have
  // suspended. When the flag is on, the throw above runs first so this is skipped.
  if (process.env.NODE_ENV !== 'production' && !isServer && shouldSuspendBlockingColdMiss({type, result})) {
    warnBlockingColdMissOnce(String(queryName), queryConfig.queryKey)
  }

  return {
    ...result,
    queryKey: queryConfig.queryKey,
  } as unknown as UseRouteQueryResult<Config['queries'][QueryName], TData> & {
    queryKey: RouteQueryKey
  }
}

/**
 * Given a named route query and a route, returns the
 * result of calling useSuspenseQuery on the generated route config.
 *
 * Overrides for query configuration can be optionally passed as a third argument
 *
 * When called on a blocking route, data is always defined.
 * When called on a deferred route, data is potentially undefined.
 */
export function useSuspenseRouteQuery<
  Config extends QueryRoute<
    string,
    string,
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Record<string, QueryRouteQueryConfig<string, any, any, any, any, any, any>>
  >,
  QueryName extends string & keyof Config['queries'],
  TData = DefaultQueryData<Config, QueryName>,
>(route: Config, queryName: QueryName, queryOverrides?: SuspenseQueryOverridesFor<Config, QueryName, TData>) {
  const {queryConfig} = useQueriesConfig(route, queryName)
  /**
   * If we have a deferred query we don't have initial data always defined, so it potentially
   * could render with `undefined`.  When we have a blocking query, the loader awaits the data
   * so it should never be undefined
   */
  return {
    ...useSuspenseQuery(
      // @ts-expect-error not sure
      {...queryConfig, ...queryOverrides},
    ),
    queryKey: queryConfig.queryKey,
  } as UseSuspenseQueryResult<TData> & {
    queryKey: RouteQueryKey
  }
}

/**
 * Given a named route query and a route, returns the
 * result of calling useQuery on the generated route config.
 *
 * Should be used in scenarios where a parent route's component wants to access data from
 * a child route. The parent component is responsible for ensuring the child route is
 * currently active, otherwise an error will be thrown.
 *
 * Overrides for query configuration can be optionally passed as a third argument
 *
 * Data will always be undefined, as it is not known whether or not the child route
 * is rendered
 */
export function useChildRouteQuery<
  Config extends QueryRoute<
    string,
    string,
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Record<string, QueryRouteQueryConfig<string, any, any, any, any, any, any>>
  >,
  QueryName extends string & keyof Config['queries'],
  TData = DefaultQueryData<Config, QueryName>,
>(route: Config, queryName: QueryName, queryOverrides?: QueryOverridesFor<Config, QueryName, TData>) {
  const {queryConfig, suppressDuringSSR} = useQueriesConfig(route, queryName, {allowReadFromChildRoutes: true})
  /**
   * If we have a deferred query we don't have initial data always defined, so it potentially
   * could render with `undefined`.  When we have a blocking query, the loader awaits the data
   * so it should never be undefined
   */
  // `useStreamingCompatibleQuery` is a no-op wrapper around `useQuery` when
  // `suppressDuringSSR` is false (the canonical case). Routing through it
  // here lets streaming-capable routes (UI Service-registered ones, where the
  // loader sets `suppressDuringSSR: true` on the loaderData entry) get SSR
  // suppression automatically without a separate code path.
  return {
    ...useStreamingCompatibleQuery(
      // @ts-expect-error not sure
      {...queryConfig, ...queryOverrides},
      suppressDuringSSR,
    ),
    queryKey: queryConfig.queryKey,
  } as UseQueryResult<TData> & {
    queryKey: RouteQueryKey
  }
}

/**
 * Given a named route query and a route, returns the
 * result of calling useSuspenseQuery on the generated route config.
 *
 * Should be used in scenarios where a parent route's component wants to access data from
 * a child route. The parent component is responsible for ensuring the child route is
 * currently active, otherwise an error will be thrown.
 *
 * Overrides for query configuration can be optionally passed as a third argument
 */
export function useSuspenseChildRouteQuery<
  Config extends QueryRoute<
    string,
    string,
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Record<string, QueryRouteQueryConfig<string, any, any, any, any, any, any>>
  >,
  QueryName extends string & keyof Config['queries'],
  TData = DefaultQueryData<Config, QueryName>,
>(route: Config, queryName: QueryName, queryOverrides?: SuspenseQueryOverridesFor<Config, QueryName, TData>) {
  const {queryConfig} = useQueriesConfig(route, queryName, {allowReadFromChildRoutes: true})
  /**
   * If we have a deferred query we don't have initial data always defined, so it potentially
   * could render with `undefined`.  When we have a blocking query, the loader awaits the data
   * so it should never be undefined
   */
  return {
    ...useSuspenseQuery(
      // @ts-expect-error not sure
      {...queryConfig, ...queryOverrides},
    ),
    queryKey: queryConfig.queryKey,
  } as UseSuspenseQueryResult<TData> & {
    queryKey: RouteQueryKey
  }
}
