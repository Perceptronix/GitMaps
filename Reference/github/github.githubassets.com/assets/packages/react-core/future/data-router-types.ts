import type {GenMessage, Message} from '@github-ui/dotcom-schema/protobuf'
import type {RoutePersister, RoutePersisterConfig, TanstackPersister} from '@github-ui/react-query-persister'
import type {Params, PathParam} from '@github-ui/react-router'
import type {
  DefinedUseQueryResult,
  QueryMeta,
  queryOptions,
  UseQueryOptions,
  UseQueryResult,
  UseSuspenseQueryOptions,
} from '@tanstack/react-query'

export const QueryRouteQueryType = {
  /**
   * A blocking query will resolve _prior to navigation_
   */
  Blocking: 'Blocking',
  /**
   * A Deferred query will begin during navigation, but may resolve after navigation completes
   */
  Deferred: 'Deferred',
} as const
export type QueryRouteQueryType = (typeof QueryRouteQueryType)[keyof typeof QueryRouteQueryType]

/**
 * Symbol key for the internal first-paint embedded-proto decoder attached by
 * `mainQuery`. Keying this with a `unique symbol` (rather than a string) keeps
 * it fully typed at the single write site (`mainQuery`) and read site
 * (`QueryRoute`) while keeping it out of property-name autocomplete when users
 * author a query config by hand — symbol-keyed fields never surface there.
 */
export const DECODE_EMBEDDED_PROTO = Symbol('decodeEmbeddedProto')

export type ComponentRenderingProperties =
  | 'Component'
  | 'ErrorBoundary'
  | 'HydrateFallback'
  | 'children'
  | 'element'
  | 'hydrateFallbackElement'
  | 'handle'

/**
 * A JSON-serializable value. Query deps must be serializable so that query keys remain
 * stable across server/client boundaries and produce consistent cache lookups. Values like
 * `URLSearchParams` instances are intentionally excluded — they are not structurally
 * comparable and serialize unpredictably.
 */
export type SerializableQueryDepValue =
  | string
  | number
  | boolean
  | null
  | SerializableQueryDepValue[]
  | {[key: string]: SerializableQueryDepValue}

export type SerializableQueryDeps = {[key: string]: SerializableQueryDepValue}

export type QueryDepsFn<RoutePath extends string> = (args: {
  pathname: string
  params: NonNullableType<Params<PathParam<RoutePath>>>
  searchParams: URLSearchParams
}) => SerializableQueryDeps

export type NavigationBehavior = 'stale-while-revalidate' | 'network-first'

export type QueryRouteQueryConfigGenerator<
  AppName extends string,
  RouteId extends string,
  RoutePath extends string,
  Name extends string,
  Deps extends QueryDepsFn<RoutePath> | undefined,
  Res,
  Type extends QueryRouteQueryType,
> =
  | QueryRouteQueryConfig<AppName, RouteId, RoutePath, Name, Deps, Res, Type>
  | ((routeId: RouteId) => QueryRouteQueryConfig<AppName, RouteId, RoutePath, Name, Deps, Res, Type>)

/**
 * Fields shared by every route query config, regardless of whether the data
 * source is a `queryFn` or a Protobuf `schema`. Specialised configs
 * ({@link QueryFnRouteQueryConfig}, {@link SchemaRouteQueryConfig}) intersect
 * this with their own discriminating fields.
 */
type BaseQueryRouteQueryConfig<
  RoutePath extends string,
  Name extends string,
  Deps extends QueryDepsFn<RoutePath> | undefined,
  Res,
  Type extends QueryRouteQueryType,
> = Omit<Parameters<typeof queryOptions>[0], 'queryFn' | 'queryKey' | 'enabled' | 'persister' | 'select'> & {
  queryName: Name
  /**
   * QueryDeps is an optional function that defines which parts of a page view the `queryFn` relies on.
   */
  queryDeps?: Deps
  /**
   * Optional transform applied to the fetched data before it is exposed to consumers.
   * `data` is typed as the query's fetched type (the schema's message shape when
   * `schema` is set, otherwise the return type of `queryFn`).
   *
   * The `[Res] extends [never] ? unknown : Res` guard keeps queries whose `queryFn`
   * only throws (Res = `never`) assignable to the loose
   * `QueryRouteQueryConfig<..., any, ...>` constraints used at framework boundaries —
   * a `(data: never) => unknown` value fails the contravariant param check against
   * `(data: any) => unknown` under `strictFunctionTypes`.
   */
  select?: (data: [Res] extends [never] ? unknown : Res) => unknown
  /**
   * Decodes first-paint embedded proto3-JSON (`embeddedData.payload[key]`) into
   * a Protobuf message. Attached to any query created with a `schema`; the route
   * runtime invokes it for keys listed in `embeddedData.meta.protoRoutes`. Keyed
   * by a symbol so it stays off the public (string-keyed) config surface.
   */
  [DECODE_EMBEDDED_PROTO]?: (raw: unknown, routeId: string) => unknown
  /**
   * The {@link QueryRouteQueryType} type of query to initiate
   */
  type?: Type

  /**
   * A staleTime override for navigation
   * When this is configured, navigation staleTimes can be controlled separately
   * from rendering staleTimes
   * @default 200
   */
  staleTimeForNavigation?: number
  /**
   * How the request should behave during navigation.
   * @default stale-while-revalidate
   */
  navigationBehavior?: NavigationBehavior

  /**
   * Whether the query should be enabled. Can be a boolean or a function that returns a boolean.
   * This is useful for conditionally enabling queries based on feature flags or other runtime conditions.
   * @default true
   */
  enabled?: boolean | (() => boolean)
}

/**
 * A route query backed by a user-provided `queryFn`. `schema` is forbidden in
 * this branch (use {@link SchemaRouteQueryConfig} instead) and `persister`
 * must be a TanStack `Persister` function — proto-persister configs require a
 * schema and are only accepted by the schema branch.
 */
export type QueryFnRouteQueryConfig<
  AppName extends string,
  RouteId extends string,
  RoutePath extends string,
  Name extends string,
  Deps extends QueryDepsFn<RoutePath> | undefined,
  Res,
  Type extends QueryRouteQueryType,
> = BaseQueryRouteQueryConfig<RoutePath, Name, Deps, Res, Type> & {
  /**
   * The queryFn to call.
   * This accepts dependencies returned from the queryDeps function if one exists and returns a response to cache.
   */
  queryFn: (
    queryKey: {
      appName: AppName
      routeId: RouteId
      routePath: RoutePath
      queryName: Name
      queryDeps: Deps extends QueryDepsFn<RoutePath> ? ReturnType<Deps> : Record<string, never>
    },
    opts: {signal: AbortSignal; meta: QueryMeta | undefined},
  ) => Res | Promise<Res>
  /** Forbidden in this branch — define a {@link SchemaRouteQueryConfig} instead. */
  schema?: never
  /**
   * A TanStack `Persister` function (full control, same as `useQuery`).
   * Proto-persister config objects require a schema and are rejected here.
   */
  persister?: TanstackPersister
}

/**
 * A route query backed by a Protobuf `schema`. The framework synthesises a
 * default fetch-based queryFn that decodes the response with
 * `fromJson(schema, ...)`. `queryFn` is forbidden in this branch. `persister`
 * accepts either a TanStack `Persister` function or a {@link RoutePersisterConfig}
 * object that the route runtime expands into a proto-persister keyed by the
 * schema's wire-format hash.
 */
export type SchemaRouteQueryConfig<
  RoutePath extends string,
  Name extends string,
  Deps extends QueryDepsFn<RoutePath> | undefined,
  Res,
  Type extends QueryRouteQueryType,
> = BaseQueryRouteQueryConfig<RoutePath, Name, Deps, Res, Type> & {
  /**
   * Protobuf message schema. The response is validated and decoded with
   * `fromJson(schema, ...)` before being cached.
   */
  schema: GenMessage<Res & Message>
  /** Forbidden in this branch — define a {@link QueryFnRouteQueryConfig} instead. */
  queryFn?: never
  /**
   * Either a TanStack `Persister` function or a {@link RoutePersisterConfig}
   * object that the route runtime expands into a proto-persister.
   */
  persister?: RoutePersister
}

/**
 * A route query configuration. Exactly one of `queryFn` or `schema` must be
 * provided — the discriminated union enforces this at compile time.
 */
export type QueryRouteQueryConfig<
  AppName extends string,
  RouteId extends string,
  RoutePath extends string,
  Name extends string,
  Deps extends QueryDepsFn<RoutePath> | undefined,
  Res,
  Type extends QueryRouteQueryType,
> =
  | QueryFnRouteQueryConfig<AppName, RouteId, RoutePath, Name, Deps, Res, Type>
  | SchemaRouteQueryConfig<RoutePath, Name, Deps, Res, Type>

export type NonNullableType<Original extends object> = {
  [K in keyof Original]: NonNullable<Original[K]>
}

/**
 * Extracts the resolved data type for a single query config: prefers the
 * Protobuf `schema`'s message shape when present, otherwise falls back to the
 * return type of `queryFn`.
 *
 * The `[M] extends [never]` guard handles `QueryFnRouteQueryConfig`, where
 * `schema?: never` makes `schema`'s type `never`. Without the guard, the
 * `schema extends GenMessage<infer M>` conditional matches (because `never`
 * extends everything) and yields `M = never`, collapsing the data type.
 */
export type QueryConfigData<Config> = 0 extends 1 & Config // pass `any` through unchanged
  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  : Config extends {__userSelectResult: infer S}
    ? S
    : Config extends {schema: GenMessage<infer M extends Message>}
      ? [M] extends [never]
        ? QueryFnData<Config>
        : M
      : QueryFnData<Config>

type QueryFnData<Config> = Config extends {queryFn?: infer F}
  ? NonNullable<F> extends (...args: never) => infer R
    ? Awaited<R>
    : never
  : never

/** Infers the data type returned by a route query's queryFn (or schema) */
export type ConfigQueryResultData<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Config extends {queries: Record<string, QueryRouteQueryConfig<string, any, any, any, any, any, any>>},
  QueryName extends string & keyof Config['queries'],
> = QueryConfigData<Config['queries'][QueryName]>

/**
 * Options that can override a route query's useQuery configuration, excluding queryKey and queryFn.
 *
 * `TData` defaults to the query's fetched data type and may be narrowed by the caller (for example
 * via `select`), in which case the resulting query data will be of the narrowed type.
 */
export type QueryOverridesFor<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Config extends {queries: Record<string, QueryRouteQueryConfig<string, any, any, any, any, any, any>>},
  QueryName extends string & keyof Config['queries'],
  TData = ConfigQueryResultData<Config, QueryName>,
> = Omit<UseQueryOptions<ConfigQueryResultData<Config, QueryName>, Error, TData>, 'queryKey' | 'queryFn'>

/**
 * Options that can override a route query's useSuspenseQuery configuration, excluding queryKey and queryFn.
 *
 * `TData` defaults to the query's fetched data type and may be narrowed by the caller (for example
 * via `select`), in which case the resulting query data will be of the narrowed type.
 */
export type SuspenseQueryOverridesFor<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Config extends {queries: Record<string, QueryRouteQueryConfig<string, any, any, any, any, any, any>>},
  QueryName extends string & keyof Config['queries'],
  TData = ConfigQueryResultData<Config, QueryName>,
> = Omit<UseSuspenseQueryOptions<ConfigQueryResultData<Config, QueryName>, Error, TData>, 'queryKey' | 'queryFn'>

/**
 * This type returns a version of `UseQuery` that considers `initialData` as defined when we have a blocking query
 * otherwise assumes initialData was undefined for deferred queries
 *
 * It uses the return types of `useQuery` in each of these cases, however typescript can't easily infer this
 * for us because of how generic the responses from `useQueriesConfig` is.
 *
 * `TData` defaults to the query's fetched data type but may be narrowed by the caller via `select`.
 */
export type UseRouteQueryResult<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Config extends QueryRouteQueryConfig<any, any, any, string, any, any, any>,
  TData = QueryConfigData<Config>,
> = Config extends {
  type?: typeof QueryRouteQueryType.Blocking
}
  ? DefinedUseQueryResult<TData>
  : UseQueryResult<TData>

/**
 * Options accepted by `useQueriesConfigs` / `useQueriesConfig` to opt into reading data from a child route.
 */
export type UseQueriesConfigOptions = {
  allowReadFromChildRoutes?: boolean
}

/**
 * Query modes for route queries that participate in streaming-compatible execution.
 *
 * Determines whether data is fetched with streaming (non-blocking) or blocking (ensureQueryData) semantics.
 *
 * - 'streaming': Uses prefetchQuery, doesn't block rendering. Component should use useSuspenseRouteQuery.
 * - 'blocking': Uses ensureQueryData, blocks until data is loaded.
 */
export type QueryMode = 'streaming' | 'blocking'
