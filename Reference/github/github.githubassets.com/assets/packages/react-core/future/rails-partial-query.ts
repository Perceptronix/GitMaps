import {reportTraceData} from '@github-ui/api-insights-tracing'
import {create, fromJson} from '@github-ui/dotcom-schema/protobuf'
import {type SafeHtml, SafeHtmlSchema} from '@github-ui/dotcom-schema/types/common/v1/safe_html'
import type {Params, PathParam} from '@github-ui/react-router'

import {
  DECODE_EMBEDDED_PROTO,
  type NonNullableType,
  type QueryDepsFn,
  type QueryFnRouteQueryConfig,
  QueryRouteQueryType,
} from './data-router-types'
import {fetchWithSafeHTMLNonceAndProtoSignal} from './query-fn-fetch'

type RailsQueryDepsFn<RoutePath extends string> = (args: {
  pathname: string
  params: NonNullableType<Params<PathParam<RoutePath>>>
  searchParams: URLSearchParams
}) => {pathname: string}

type RailsPartialQueryOptions = Omit<
  QueryFnRouteQueryConfig<string, string, string, string, QueryDepsFn<string>, SafeHtml, QueryRouteQueryType>,
  'queryDeps' | 'queryFn' | 'queryName'
> & {
  partialName?: string
  queryDeps?: RailsQueryDepsFn<string>
}

type JSONResponse = {
  payload: Record<string, SafeHtml | string>
}

type RailsPartialQueryConfig = QueryFnRouteQueryConfig<
  string,
  string,
  string,
  string,
  RailsQueryDepsFn<string>,
  SafeHtml,
  QueryRouteQueryType
>

export function railsPartialQuery({
  partialName,
  queryDeps,
  type,
  navigationBehavior,
  ...opts
}: RailsPartialQueryOptions): (routeId: string) => RailsPartialQueryConfig {
  return (routeId: string) => {
    const queryName = `${routeId}.${partialName || 'RailsPartial'}`
    return {
      queryName,
      queryDeps: queryDeps
        ? queryDeps
        : ({pathname}) => {
            return {pathname: `${pathname}/partial`}
          },
      queryFn: async queryKey => {
        const {json, isProtoJson} = await fetchWithSafeHTMLNonceAndProtoSignal(queryKey)

        const html = (json as JSONResponse).payload?.[queryName]
        if (html === undefined || html === null) {
          throw new Error(`Unable to find payload for query: ${queryName}`)
        }

        reportTraceData(json)

        if (isProtoJson) {
          return fromJson({schema: SafeHtmlSchema, raw: html, routeId, queryName})
        } else {
          return create(SafeHtmlSchema, {value: html as string})
        }
      },
      // `railsPartialQuery` uses a custom `queryFn` (not `schema`), so the route
      // runtime can't auto-attach the first-paint embedded-proto decoder the way
      // it does for schema-based queries (see `toKeyedQueries`). Attach it here
      // by hand so the SSR-embedded marker/resolved payload — flagged under
      // `meta.protoRoutes` by the backend — is decoded into a real `SafeHtml`
      // message too, matching what this `queryFn` returns on fetch/soft-nav.
      [DECODE_EMBEDDED_PROTO]: (raw: unknown, embeddedRouteId: string) => {
        return fromJson({schema: SafeHtmlSchema, raw, routeId: embeddedRouteId, queryName})
      },
      type: type || QueryRouteQueryType.Blocking,
      navigationBehavior: navigationBehavior || 'network-first',
      ...opts,
    }
  }
}
