import {type Variables, type GraphQLResponse, stableCopy, type GraphQLResponseWithoutData} from 'relay-runtime'
import type {Sink} from 'relay-runtime/lib/network/RelayObservable'
import {getInsightsUrl, reportTraceData} from '@github-ui/api-insights-tracing'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
// eslint-disable-next-line no-restricted-imports
import {reportError, isAnonymousUser} from '@github-ui/failbot'
import {classifyHttpError} from '@github-ui/failbot/http-error-classification'
import {isFeatureEnabled} from '@github-ui/feature-flags'
import {NOT_REPORTED_ERRORS} from './constants/values'
import {getBaseFetchHeaders} from '@github-ui/fetch-headers'
import {filterSensitiveData} from './helpers'
import {versionMismatchDetector} from '@github-ui/version-mismatch-detector'

type Json = string | number | boolean | null | {[property: string]: Json} | Json[]

type JsonRoot = {[property: string]: Json}

export type GraphQLError = {type: string; message: string; path: Array<string | number>}
type GraphQLSuccessfulResult = {
  serverCacheTTL?: number
  __trace?: JsonRoot
  data: JsonRoot
  timestamp?: number
  extensions?: Record<string, Record<string, JsonRoot>>
}
type GraphQLErrorResult = {
  serverCacheTTL?: number
  errors: GraphQLError[]
  data?: JsonRoot
  timestamp?: number
  extensions: Record<string, string>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ErrorTypeCallbacks = Record<string, (params?: any) => void>
export type ErrorCallbacks = Record<number, ErrorTypeCallbacks>

export const IssuesShowRegex = new RegExp(/^\/[\w-_]*\/[\w-_]*\/issues\/\d*$/)

export type GraphQLResult = GraphQLSuccessfulResult | GraphQLErrorResult
export type GraphQLSubscriptionResult = {subscriptionId: string | null; response: GraphQLResponse}

function reportErrorsToSentry(decoded: GraphQLResult, requestId: string, persistedQueryId: string) {
  const errorsToReport = removeErrorsForReporting('errors' in decoded ? decoded.errors : [])
  if ('errors' in decoded && errorsToReport.length) {
    const formatted = errorsToReport
      .map(error => `GraphQL error: ${error.type}: ${error.message} (path: ${error.path})`)
      .join(', ')
    const error = new ValidationError(
      `${formatted} (Persisted query id: ${persistedQueryId})`,
      {cause: errorsToReport},
      decoded.extensions?.query_owning_catalog_service,
    )
    reportError(error)
  }
  if (!('data' in decoded)) {
    const responseData = filterSensitiveData(decoded)
    const error = new Error(
      `Expected data property in response: ${JSON.stringify(
        responseData,
      )}. persistedQueryId: ${persistedQueryId}, requestId: ${requestId}`,
    )
    reportError(error)
  }
}

class ValidationError extends Error {
  catalogService: string | undefined
  constructor(message: string, options: ErrorOptions, catalogService?: string) {
    super(message, options)
    this.catalogService = catalogService
    this.name = 'ValidationError'
  }
}

class RateLimitError extends Error {
  retryAfter?: number
  resetTime?: number
  constructor(retryAfter?: number, resetTime?: number, ...args: ConstructorParameters<typeof Error>) {
    super(...args)
    this.retryAfter = retryAfter
    this.resetTime = resetTime
    this.name = 'RateLimitError' // name necessary to avoid minification of the class name
  }
}

class ServiceUnavailableError extends Error {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args)
    this.name = 'ServiceUnavailableError' // name necessary to avoid minification of the class name
  }
}

class NotAcceptableError extends Error {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args)
    this.name = 'NotAcceptableError' // name necessary to avoid minification of the class name
  }
}

class SecFetchHeaderError extends Error {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args)
    this.name = 'SecFetchHeaderError' // name necessary to avoid minification of the class name
  }
}

class FetchNetworkError extends Error {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args)
    this.name = 'FetchNetworkError' // name necessary to avoid minification of the class name
  }
}

class NoiseError extends Error {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args)
    this.name = 'NoiseError' // name necessary to avoid minification of the class name
  }
}

function isExpectedError(error: unknown): boolean {
  const errorName = (error as Error | undefined)?.name
  return (
    errorName === 'RateLimitError' ||
    errorName === 'SecFetchHeaderError' ||
    errorName === 'NotAcceptableError' ||
    errorName === 'FetchNetworkError' ||
    errorName === 'NoiseError' ||
    (errorName === 'ServiceUnavailableError' && isAnonymousUser())
  )
}

function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  // TypeError with "Failed to fetch" is a network error
  return error.name === 'TypeError' && error.message === 'Failed to fetch'
}

async function assertNoHttpErrors(
  response: Response,
  persistedQueryId: string,
  persistedQueryName: string,
): Promise<void> {
  // 404 is handled by GraphQL
  // 401 is caused by a forbidden anonymous query, which is reported to datadog
  if (response.status > 401 && response.status !== 404) {
    const text = await response.text()
    const errorInfo = {
      url: response.url,
      timestamp: new Date().toISOString(),
      persistedQueryId,
      persistedQueryName,
      failureRequestId: response.headers.get('X-Github-Request-Id'),
    }

    const errorDetails = `HTTP error (${response.status}): ${text ? text : 'No additional text'}.
    Error Info: ${JSON.stringify(errorInfo)}`

    // Classify the status the same way as react-core's responseErrorForStatus,
    // then map the shared category onto this path's local Error subclasses so
    // failbot can identify and silence the expected/non-actionable ones.
    const cause = {cause: response.status}
    const category = classifyHttpError({
      status: response.status,
      rejectReason: response.headers.get('X-Reject-Reason'),
      bodyText: text,
    })
    switch (category) {
      case 'rate-limit':
        throw new RateLimitError(
          Number(response.headers.get('Retry-After')),
          Number(response.headers.get('X-RateLimit-Reset')),
          errorDetails,
          cause,
        )
      case 'service-unavailable':
        throw new ServiceUnavailableError(errorDetails, cause)
      case 'not-acceptable':
        throw new NotAcceptableError(errorDetails, cause)
      case 'sec-fetch':
        throw new SecFetchHeaderError(errorDetails, cause)
      case 'noise':
        throw new NoiseError(errorDetails, cause)
      case 'auth':
        throw new Error(errorDetails, cause)
      case 'generic':
        throw new Error(errorDetails, cause)
      default:
        // This function returns void, so an unhandled category would silently
        // let a non-ok response through. Fail the type check if one is added.
        category satisfies never
        throw new Error(errorDetails, cause)
    }
  }
}

function removeErrorsForReporting(errors: GraphQLError[]): GraphQLError[] {
  // Filter out errors that are traditionally allowed OR that should be swallowed by the new logic
  return errors.filter(error => {
    const isTraditionallyAllowed = NOT_REPORTED_ERRORS.includes(error.type)

    // Keep errors that are NOT traditionally allowed AND NOT to be swallowed
    return !isTraditionallyAllowed
  })
}

// Fetch GraphQL from the server and return a decoded result.
export default async function fetchGraphQL(
  persistedQueryId: string,
  persistedQueryName: string,
  variables: Variables,
  method: 'GET' | 'POST' = 'GET',
  baseUrl?: string,
  enabledFeatures?: {[key: string]: boolean},
  observer?: Sink<GraphQLResponse>,
  isCacheRefresh?: boolean,
  preheatSource?: string,
): Promise<GraphQLResponse> {
  const result = await fetchGraphQLWithSubscription(
    persistedQueryId,
    persistedQueryName,
    variables,
    method,
    {
      isSubscription: false,
      scope: undefined,
      preheatSource,
    },
    baseUrl,
    enabledFeatures,
    observer,
    isCacheRefresh,
  )
  return result.response
}

// Fetch GraphQL from the server and return a response promise along with an
// optional subscriptionId if the query is a subscription.
export async function fetchGraphQLWithSubscription(
  persistedQueryId: string,
  persistedQueryName: string,
  variables: Variables,
  method: 'GET' | 'POST' = 'POST',
  options: {
    isSubscription?: boolean
    subscriptionTopic?: string
    dispatchTime?: number
    scopeObject?: Record<string, unknown>
    scope?: string
    preheatSource?: string
  } = {},
  baseUrl?: string,
  enabledFeatures?: {[key: string]: boolean},
  observer?: Sink<GraphQLResponse>,
  isCacheRefresh?: boolean,
): Promise<GraphQLSubscriptionResult> {
  const canonicalizedPayload = JSON.stringify(
    // stableCopy will alphabetize the keys in the variable payload.
    // Necessary to ensure a match against early-hinted/preloaded requests.
    stableCopy({
      persistedQueryName,
      query: persistedQueryId,
      variables,
      ...(options.scopeObject ? {scopeObject: options.scopeObject} : {}),
    }),
  )

  const {isSubscription, scope, subscriptionTopic, dispatchTime} = options

  // Validate baseUrl to prevent GraphQL requests from being sent to non-GraphQL endpoints
  let validatedBaseUrl = baseUrl
  if (baseUrl !== undefined && (baseUrl === '' || !baseUrl.endsWith('/_graphql'))) {
    reportError(
      new Error(
        `fetchGraphQL received invalid baseUrl - must end with /_graphql persistedQueryId: ${persistedQueryId}, persistedQueryName: ${persistedQueryName}, invalidBaseUrl: ${baseUrl}`,
      ),
    )
    // Use default GraphQL endpoint to prevent requests to wrong routes
    validatedBaseUrl = undefined
  }

  const url = constructUrl(
    method,
    encodeURIComponent(canonicalizedPayload),
    isSubscription,
    subscriptionTopic,
    scope,
    dispatchTime,
    validatedBaseUrl,
  )
  let subscriptionId = null

  try {
    const {
      subscriptionId: currentSubscriptionId,
      requestId,
      json,
    } = await getGraphQLQuery(
      url,
      method,
      persistedQueryId,
      persistedQueryName,
      canonicalizedPayload,
      enabledFeatures,
      options.preheatSource,
    )
    subscriptionId = currentSubscriptionId

    reportErrorsToSentry(json as GraphQLResult, requestId, persistedQueryId)
    if (json) {
      if (isCacheRefresh) {
        const traceData = {
          __trace: {
            ...json?.__trace,
            cache_result: 'refresh',
          },
        }
        reportTraceData(traceData)
      } else {
        reportTraceData(json)
      }
    }
    return {subscriptionId, response: json}
  } catch (error) {
    if (observer) {
      const errorName = (error as Error | undefined)?.name
      if (!isExpectedError(error)) {
        reportError(error)
      }
      let extensions = {}
      if (errorName === 'RateLimitError' || errorName === 'ServiceUnavailableError') {
        extensions = {backoff: true, errorType: errorName}
        if (errorName === 'RateLimitError') {
          const retryAfter = (error as RateLimitError).retryAfter
          if (retryAfter !== undefined && !isNaN(retryAfter)) {
            extensions = {...extensions, retryAfter}
          }
          const resetTime = (error as RateLimitError).resetTime
          if (resetTime !== undefined && !isNaN(resetTime)) {
            extensions = {...extensions, resetTime}
          }
        }
      }
      observer.error(error as Error)
      const errorResponse = {
        errors: [{message: 'An error occurred while fetching data. Please try again later.'}],
        extensions,
      } as GraphQLResponseWithoutData
      return {subscriptionId, response: errorResponse}
    } else {
      throw error
    }
  }
}

function constructUrl(
  method: 'GET' | 'POST',
  content: string,
  isSubscription?: boolean,
  subscriptionTopic?: string,
  scope?: string,
  dispatchTime?: number,
  baseUrl = '/_graphql',
) {
  const queryParameters = []
  if (method === 'GET') {
    queryParameters.push(`body=${content}`)
  }
  if (isSubscription) {
    queryParameters.push('subscription=1')
  }
  if (scope) {
    queryParameters.push(`scope=${encodeURIComponent(scope)}`)
  }
  if (subscriptionTopic) {
    queryParameters.push(`subscriptionTopic=${encodeURIComponent(subscriptionTopic)}`)
  }
  if (dispatchTime) {
    queryParameters.push(`dispatchTime=${encodeURIComponent(dispatchTime)}`)
  }

  // grab and forward any feature flags from the URL
  if (ssrSafeWindow) {
    const url = new URL(ssrSafeWindow.location.href, ssrSafeWindow.location.origin)
    const features = url.searchParams.get('_features')
    if (features) {
      queryParameters.push(`_features=${features}`)
    }
  }

  return queryParameters.length > 0 ? `${baseUrl}?${queryParameters.join('&')}` : baseUrl
}

async function getGraphQLQuery(
  url: string,
  method: string,
  persistedQueryId: string,
  persistedQueryName: string,
  body?: string,
  enabledFeatures?: {[key: string]: boolean},
  preheatSource?: string,
) {
  const effectiveUrl = getInsightsUrl(url)
  return getGraphQLData(
    effectiveUrl,
    method,
    persistedQueryId,
    persistedQueryName,
    body,
    enabledFeatures,
    preheatSource,
  )
}

async function getGraphQLData(
  url: string,
  method: string,
  persistedQueryId: string,
  persistedQueryName: string,
  body?: string,
  enabledFeatures?: {[key: string]: boolean},
  preheatSource?: string,
) {
  let httpResponse: Response

  const bodyInit = body ? {body} : undefined

  const headers: {[key: string]: string} = {
    ...getBaseFetchHeaders(),
    ...(preheatSource ? {'X-GITHUB-PREHEAT': preheatSource} : {}),
  }

  if (method === 'GET') {
    httpResponse = await fetch(url, {
      method,
      cache: 'no-cache',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...headers,
      },
    })
  } else {
    httpResponse = await verifiedFetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        ...headers,
      },
      ...bodyInit,
    })
  }

  // Store headers and status before consuming the response body
  const subscriptionId = httpResponse.headers.get('X-Subscription-ID')
  const requestId = httpResponse.headers.get('X-Github-Request-Id') || ''
  const status = httpResponse.status

  // Check for version mismatch before processing the response
  // This will check if the detector is registered and trigger the callback if configured
  versionMismatchDetector.checkResponse(httpResponse)

  await assertNoHttpErrors(httpResponse, persistedQueryId, persistedQueryName)

  if (status === 404 && method === 'POST') {
    // 404 for a mutation means the user is not logged in
    // reload the page to trigger the login flow
    ssrSafeWindow?.location.reload()
    throw new Error('Reloading page due to 404 on GraphQL mutation for unauthenticated user.')
  }

  let json
  try {
    json = await httpResponse.json()
  } catch (e) {
    const cause = {
      error: e instanceof Error ? `${e.name}: ${e.message}` : String(e),
      status,
      url,
      requestId,
    }

    if (isNetworkError(e)) {
      // Don't report network errors - they're user connection issues we can't control
      throw new FetchNetworkError(
        `Network error while reading response. Please check your connection and try again. ${JSON.stringify(cause)}`,
      )
    }

    // Filter 404 GET requests with unparseable JSON as noise
    // These indicate the script is running on domains without the /_graphql endpoint
    // This is a case we see in the wild with custom domains + scraper activity
    if (status === 404 && method === 'GET' && isFeatureEnabled('fetch_graphql_filter_404_noise')) {
      throw new NoiseError(`Failed to parse server response. Please try again later. ${JSON.stringify(cause)}`, {
        cause: status,
      })
    }

    // Report the error for proper monitoring
    reportError(new Error(`Failed to parse server JSON response ${JSON.stringify(cause)}`))

    // Provide a graceful fallback
    throw new Error(`Failed to parse server response. Please try again later. ${JSON.stringify(cause)}`)
  }

  return {subscriptionId, requestId, json, status}
}
