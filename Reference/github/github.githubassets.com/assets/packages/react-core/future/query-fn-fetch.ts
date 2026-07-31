import {reportTraceData} from '@github-ui/api-insights-tracing'
import {type DescMessage, fromJson, type MessageShape, PROTO_JSON_HEADER} from '@github-ui/dotcom-schema/protobuf'
import {getDocumentHtmlSafeNonces, verifyResponseHtmlSafeNonce} from '@github-ui/html-safe-nonce'
import {sendCustomMetric} from '@github-ui/stats'
import {type JSONRequestInit, reactFetchJSON} from '@github-ui/verified-fetch'
import {versionMismatchDetector} from '@github-ui/version-mismatch-detector'

import {responseErrorForStatus} from './response-error'

type QueryFnPartialQueryKey = {
  /** Forwarded to `fromJson` as a parse-metric tag when a schema is provided. */
  routeId?: string
  /** Forwarded to `fromJson` as a parse-metric tag when a schema is provided. */
  queryName?: string
  queryDeps: {
    pathname: string
    searchParams?:
      | ConstructorParameters<typeof URLSearchParams>[0]
      | Record<string, string | null>
      | Array<[string, string | null]>
    init?: JSONRequestInit
  }
}

type SchemaOptions<Desc extends DescMessage> = {
  /**
   * Protobuf schema for the response. When provided and the response carries
   * the `X-Proto-JSON: true` header, the parsed body is decoded via
   * `fromJson(schema, ...)`. Without the header the body is returned as-is
   * so endpoints can migrate to proto-JSON one path at a time.
   */
  schema: Desc
}

/**
 * Intended for use by `queryFn`s that need to make fetch requests.
 * In addition to calling `reactFetchJSON` to add the appropriate react headers to the request,
 * this function will also check the response status and throw a `ResponseError` if necessary,
 * as well as hooking into `reportTraceData`.
 */
export async function queryFnFetch<Response>(queryKey: QueryFnPartialQueryKey): Promise<Response>
export async function queryFnFetch<Desc extends DescMessage, Legacy = MessageShape<Desc>>(
  queryKey: QueryFnPartialQueryKey,
  opts: SchemaOptions<Desc>,
): Promise<MessageShape<Desc> | Legacy>
export async function queryFnFetch<Desc extends DescMessage>(
  queryKey: QueryFnPartialQueryKey,
  opts?: SchemaOptions<Desc>,
): Promise<unknown> {
  const {result} = opts ? await queryFnFetchWithHeaders(queryKey, opts) : await queryFnFetchWithHeaders(queryKey)
  return result
}

/**
 * Lower-level variant of {@link queryFnFetch} that exposes the `X-Proto-JSON`
 * header signal alongside the parsed JSON. Use this when validation needs to
 * run on a sub-tree of the response (e.g. `mainQuery`'s `payload[routeId]`)
 * rather than the whole body.
 */
export async function queryFnFetchWithProtoSignal<Res>(
  queryKey: QueryFnPartialQueryKey,
): Promise<{json: Res; isProtoJson: boolean}> {
  const {json, isProtoJson} = await fetchJsonWithProtoSignal(queryKey)
  reportTraceData(json)
  return {json: json as Res, isProtoJson}
}

/**
 * Variant of {@link queryFnFetch} that returns the proto-verified result
 * alongside the response headers. Use this when the caller needs to read
 * response headers (e.g. pagination or cursor metadata) in addition to the
 * parsed body.
 */
export async function queryFnFetchWithHeaders<Response>(
  queryKey: QueryFnPartialQueryKey,
): Promise<{result: Response; headers: Headers}>
export async function queryFnFetchWithHeaders<Desc extends DescMessage, Legacy = MessageShape<Desc>>(
  queryKey: QueryFnPartialQueryKey,
  opts: SchemaOptions<Desc>,
): Promise<{result: MessageShape<Desc> | Legacy; headers: Headers}>
export async function queryFnFetchWithHeaders<Desc extends DescMessage>(
  queryKey: QueryFnPartialQueryKey,
  opts?: SchemaOptions<Desc>,
): Promise<{result: unknown; headers: Headers}> {
  const start = performance.now()
  const {json, isProtoJson, headers} = await fetchJsonWithProtoSignal(queryKey)
  sendCustomMetric({
    name: 'REACT_QUERY_TIME',
    value: performance.now() - start,
    tags: {
      routeId: queryKey.routeId ?? 'unknown',
      queryName: queryKey.queryName ?? 'unknown',
    },
  })
  const result =
    opts && isProtoJson
      ? fromJson({
          schema: opts.schema,
          raw: json,
          routeId: queryKey.routeId ?? 'unknown',
          queryName: queryKey.queryName ?? 'unknown',
        })
      : json
  reportTraceData(result)
  return {result, headers}
}

async function fetchJsonWithProtoSignal({
  queryDeps: {pathname, searchParams, init},
}: QueryFnPartialQueryKey): Promise<{json: unknown; isProtoJson: boolean; headers: Headers}> {
  const path = serializePath(pathname, searchParams)

  const response = await reactFetchJSON(path, init)

  // Check for version mismatch before processing the response
  // This will check if the detector is registered and trigger the callback if configured
  versionMismatchDetector.checkResponse(response)

  if (!response.ok) {
    throw await responseErrorForStatus(response)
  }

  const isProtoJson = response.headers.get(PROTO_JSON_HEADER) === 'true'
  const json = await response.json()
  return {json, isProtoJson, headers: response.headers}
}

export async function fetchWithSafeHTMLNonceAndProtoSignal({
  queryDeps: {pathname, searchParams, init},
}: QueryFnPartialQueryKey): Promise<{json: unknown; isProtoJson: boolean; headers: Headers}> {
  const path = serializePath(pathname, searchParams)

  const response = await reactFetchJSON(path, init)

  // Check for version mismatch before processing the response
  // This will check if the detector is registered and trigger the callback if configured
  versionMismatchDetector.checkResponse(response)

  if (!response.ok) {
    throw await responseErrorForStatus(response)
  }

  verifyResponseHtmlSafeNonce(getDocumentHtmlSafeNonces(document), response, true)

  const isProtoJson = response.headers.get(PROTO_JSON_HEADER) === 'true'
  const json = await response.json()
  return {json, isProtoJson, headers: response.headers}
}
/**
 * Intended for use by `queryFn`s that need to make fetch requests and verify HTML safe nonces.
 */
export async function queryFnFetchWithSafeHTMLNonce<Response>(queryKey: QueryFnPartialQueryKey): Promise<Response>
export async function queryFnFetchWithSafeHTMLNonce<Desc extends DescMessage, Legacy = MessageShape<Desc>>(
  queryKey: QueryFnPartialQueryKey,
  opts: SchemaOptions<Desc>,
): Promise<MessageShape<Desc> | Legacy>
export async function queryFnFetchWithSafeHTMLNonce<Desc extends DescMessage>(
  {queryDeps: {pathname, searchParams, init}, routeId, queryName}: QueryFnPartialQueryKey,
  opts?: SchemaOptions<Desc>,
): Promise<unknown> {
  const {json, isProtoJson} = await fetchWithSafeHTMLNonceAndProtoSignal({
    queryDeps: {pathname, searchParams, init},
    routeId,
    queryName,
  })
  const result =
    opts && isProtoJson
      ? fromJson({schema: opts.schema, raw: json, routeId: routeId ?? '', queryName: queryName ?? ''})
      : json
  reportTraceData(result)
  return result
}

/**
 * Serializes the given `pathname` and `searchParams` to a string.
 */
function serializePath(pathname: string, searchParams?: QueryFnPartialQueryKey['queryDeps']['searchParams']) {
  const path = [pathname]
  const search = removeNils(searchParams).toString()
  if (search) {
    path.push(search.toString())
  }
  return path.join('?')
}

/**
 * Removes any search-params with a value of `null` or `undefined` from the given `searchParams` object.
 * This is necessary as we construct `queryDeps.searchParams` with code like `{page: searchParams.get('page')}`,
 * which will result in a value of `null` if the key is not present in the `searchParams` object and
 * URLSeachParams.toString() will serialize `null` values as the string "null", which is not the desired behavior.
 */
function removeNils(searchParams: QueryFnPartialQueryKey['queryDeps']['searchParams']): URLSearchParams {
  if (searchParams instanceof URLSearchParams) {
    return searchParams
  }
  if (typeof searchParams === 'string') {
    return new URLSearchParams(searchParams)
  }

  const result = new URLSearchParams()
  if (searchParams === undefined || searchParams === null) {
    return result
  }
  for (const [key, value] of Array.isArray(searchParams) ? searchParams : Object.entries(searchParams)) {
    if (value !== undefined && value !== null) {
      result.append(key, value)
    }
  }
  return result
}
