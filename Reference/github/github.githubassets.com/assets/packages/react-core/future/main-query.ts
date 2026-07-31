import {type DescMessage, fromJson} from '@github-ui/dotcom-schema/protobuf'
import {getAppTypeHeader} from '@github-ui/fetch-headers'
import type {TanstackPersister} from '@github-ui/react-query-persister'
import type {QueryMeta, queryOptions} from '@tanstack/react-query'

import type {EmbeddedData} from '../embedded-data-types'
import {
  DECODE_EMBEDDED_PROTO,
  type NavigationBehavior,
  type QueryDepsFn,
  QueryRouteQueryType,
  type SerializableQueryDeps,
} from './data-router-types'
import {queryFnFetchWithProtoSignal} from './query-fn-fetch'

// note the `any` for `RoutePath` here means we don't get fully typed `params` object in the queryDeps function
// but that should be fine since that's only internal to reusable query configs.
//
// The intersection with `{pathname: string}` ensures the user-supplied callback satisfies both
// the SerializableQueryDeps contract enforced by QueryDepsFn (no URLSearchParams etc.) and the
// internal mainQuery queryFn which fetches via `queryDeps.pathname`.
type RelaxedQueryDepsFn = (...args: Parameters<QueryDepsFn<string>>) => SerializableQueryDeps & {pathname: string}

type QueryOptions = Omit<Parameters<typeof queryOptions>[0], 'queryFn' | 'queryKey' | 'enabled' | 'persister'> & {
  /**
   * Specialized version of query deps that returns the `string` url path from which to request data
   */
  queryDeps?: RelaxedQueryDepsFn
} & {
  staleTimeForNavigation?: number
  navigationBehavior?: NavigationBehavior
  encodeFetchPath?: boolean
  enabled?: boolean | (() => boolean)
  /**
   * `mainQuery` always provides its own `queryFn`, so the route runtime's
   * `QueryFnRouteQueryConfig` branch applies — only TanStack `Persister`
   * functions are accepted here (proto-persister configs require a top-level
   * route `schema`, which `mainQuery` does not expose).
   */
  persister?: TanstackPersister
}

export type JsonResponse = {
  meta: EmbeddedData['meta']
  payload: Record<string, unknown>
}
/**
 * A relaxed version of {@link QueryRouteQueryConfig} that allows for a more independent API
 * at the cost of some type safety. Specifically, it relaxes many of the generics from `QueryRouteQueryConfig`
 */
type RelaxedQueryRouteQueryConfig<Res, QueryName extends string> = QueryOptions & {
  queryName: QueryName
  /**
   * The queryFn to call.
   * This accepts dependencies returned from the queryDeps function if one exists and returns a response to cache.
   */
  queryFn: (
    queryKey: {
      appName: string
      routeId: string
      routePath: string
      queryName: QueryName
      queryDeps: QueryFnFetchDeps
    },
    opts: {signal: AbortSignal; meta: QueryMeta | undefined},
  ) => Promise<Res> // This is not entirely true for mainQuery, but it's there to match QueryRouteQueryConfig
  /**
   * The {@link QueryRouteQueryType} type of query to initiate
   */
  type: typeof QueryRouteQueryType.Blocking
  /**
   * `mainQuery` always defines a `queryFn`, so the route runtime requires the
   * `QueryFnRouteQueryConfig` branch — top-level `schema` is forbidden here.
   * `MainQueryOptions.schema` is a *decoding* option consumed internally by
   * `mainQuery` and is intentionally not re-emitted on the returned config.
   */
  schema?: never
  /**
   * Internal hook used by the route runtime to decode first-paint embedded
   * proto3-JSON (`embeddedData.payload[routeId]`) into a Protobuf message via
   * `fromJson(schema, ...)`. Only attached when a `schema` is provided; the
   * runtime calls it for routes listed in `embeddedData.meta.protoRoutes`.
   * Keyed by a symbol so it stays off the public config surface.
   */
  [DECODE_EMBEDDED_PROTO]?: (raw: unknown, routeId: string) => unknown
}

type QueryFnFetchDeps = Parameters<typeof queryFnFetchWithProtoSignal>[0]['queryDeps']

type MainQueryOptions<Res> = QueryOptions & {
  /**
   * Optional custom queryFn to override the default fetch-and-extract behavior.
   * Receives the same query key shape as the default implementation.
   */
  queryFn?: RelaxedQueryRouteQueryConfig<Res, 'mainQuery'>['queryFn']
  /**
   * Optional Protobuf schema for the route's payload (i.e. `payload[routeId]`,
   * not the full `{meta, payload}` envelope). When provided, the extracted
   * route payload is decoded via `fromJson(schema, ...)` so consumers get a
   * validated, typed value.
   */
  schema?: DescMessage
  /**
   * Optional transform applied when the route payload is *not* already a
   * decoded Protobuf message — i.e. the response is legacy plain JSON (proto
   * flag off) on either ingest path (soft-nav fetch or first-paint embedded).
   * Use it to normalize the legacy shape up to the proto shape so consumers
   * always observe one canonical type. When the payload is already a proto
   * message (decoded via `schema`), `adapt` is skipped and the message passes
   * through unchanged.
   */
  adapt?: (legacyPayload: unknown) => Res
}

/**
 * Provides a shorthand for creating a `QueryConfig` that reads `payload[routeId].mainQuery` from `embeddedData` on
 * page load and via `json` request to the current matched route on soft-navigation. This is the most common use
 * case for route-bound query data and should be all that is needed to provide data for most pages.
 */
export function mainQuery<Res>({...opts}: MainQueryOptions<Res> = {}): RelaxedQueryRouteQueryConfig<Res, 'mainQuery'> {
  const {schema, adapt, ...restOpts} = opts
  return {
    queryName: 'mainQuery',
    queryDeps: ({pathname}) => ({pathname}),
    queryFn:
      opts.queryFn ??
      (async ({routeId, queryDeps}) => {
        // Merge the appTypeHeader into any existing headers in queryDeps.init, if present
        const appTypeHeader = getAppTypeHeader('dataRouter')
        const mergedQueryDeps = {
          ...queryDeps,
          pathname: opts.encodeFetchPath ? encodeParts(queryDeps.pathname) : queryDeps.pathname,
          init: {
            ...queryDeps?.init,
            headers: {...appTypeHeader, ...queryDeps?.init?.headers},
          },
        }

        const {json, isProtoJson} = await queryFnFetchWithProtoSignal<JsonResponse>({queryDeps: mergedQueryDeps})
        return responseJsonToQueryData(json, routeId, {schema, isProtoJson})
      }),
    type: QueryRouteQueryType.Blocking,
    select: makeSelectDataFromQueryData(adapt),
    // First-paint embedded payloads arrive as raw proto3-JSON; decode them with
    // the schema during hydration so they match the fetch path (which decodes
    // via `fromJson`). The route runtime gates this on `meta.protoRoutes`.
    [DECODE_EMBEDDED_PROTO]: schema
      ? (raw, routeId) => fromJson({schema, raw, routeId, queryName: 'mainQuery'})
      : undefined,
    ...restOpts,
  }
}

function responseJsonToQueryData<Res>(
  json: JsonResponse,
  routeId: string,
  {schema, isProtoJson}: {schema?: DescMessage; isProtoJson: boolean} = {isProtoJson: false},
): Res {
  const routePayload = json.payload?.[routeId]
  if (!routePayload) {
    throw new Error(`Unable to find payload for route Id: ${routeId}`)
  }

  return {
    meta: json.meta,
    payload:
      schema && isProtoJson ? fromJson({schema, raw: routePayload, routeId, queryName: 'mainQuery'}) : routePayload,
  } as Res
}

function isProtoMessage(value: unknown): boolean {
  return typeof value === 'object' && value !== null && '$typeName' in value
}

/**
 * Builds the `select` transform shared by both ingest paths. The cached value
 * is the `{meta, payload}` envelope; consumers only want `payload`. When an
 * `adapt` is supplied and the payload is *not* already a decoded proto message
 * (legacy plain JSON), it is normalized up to the proto shape first.
 */
export function makeSelectDataFromQueryData<Res>(adapt?: (legacyPayload: unknown) => Res) {
  return (data: unknown): Res => {
    const typedData = data as JsonResponse
    const payload = typedData.payload
    if (isProtoMessage(payload) || !adapt) {
      return payload as Res
    }
    return adapt(payload)
  }
}

function encodeParts(part: string): string {
  return part.split('/').map(encodeURIComponent).join('/')
}
