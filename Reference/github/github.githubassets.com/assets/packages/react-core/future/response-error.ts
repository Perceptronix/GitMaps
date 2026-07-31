import {classifyHttpError} from '@github-ui/failbot/http-error-classification'

/**
 * Stores a Response object within an Error, so that the application
 * can access the response when an error is thrown.
 *
 * For example, a `queryFn` can throw the error like so:
 *
 * if (!response.ok) throw new ResponseError(response.statusText, response)
 *
 * which should cause the Error to be thrown from within the loader.
 *
 * Then an ErrorBoundary can consume the route error and access the response, like so:
 *
 * const routeError = useRouteError()
 * const responseStatus = isResponseError(routeError) ? routeError.response.status : undefined
 *
 */
export class ResponseError extends Error {
  readonly response: Response
  constructor(message: string, response: Response) {
    super(message)
    this.response = response
    // Keep the prototype.name fixed even after minification.
    this.name = 'ResponseError'
  }
}

/**
 * Type guard for checking to see if a parameter is a ResponseError object
 */
export function isResponseError(e: unknown): e is ResponseError {
  return e instanceof ResponseError
}

/**
 * Named `ResponseError` subclasses whose `.name` matches the expected-error
 * allowlist in `@github-ui/failbot`. Throwing these instead of a bare
 * `ResponseError` lets failbot silence content-negotiation and environmental
 * responses (406, 429, 503, CSRF rejections, proxy/CDN noise) that would
 * otherwise be reported to Sentry as critical errors.
 *
 * They remain `instanceof ResponseError`, so the route error boundary UI and
 * document-title logic are unaffected. This mirrors the status→error mapping
 * already used by the GraphQL fetch path (`packages/fetch-graphql/fetch-graphql.ts`).
 *
 * The `name` is assigned explicitly (rather than relying on the class name) so
 * it survives minification, since failbot matches on the string value.
 */
export class NotAcceptableError extends ResponseError {
  constructor(response: Response) {
    super(response.statusText, response)
    this.name = 'NotAcceptableError'
  }
}

export class RateLimitError extends ResponseError {
  constructor(response: Response) {
    super(response.statusText, response)
    this.name = 'RateLimitError'
  }
}

export class ServiceUnavailableError extends ResponseError {
  constructor(response: Response) {
    super(response.statusText, response)
    this.name = 'ServiceUnavailableError'
  }
}

export class SecFetchHeaderError extends ResponseError {
  constructor(response: Response) {
    super(response.statusText, response)
    this.name = 'SecFetchHeaderError'
  }
}

/**
 * Non-actionable infrastructure noise, not a GitHub error: a deprecated/bot
 * status (410, 418) or a recognized third-party proxy block page (a 403 whose
 * body matches `NOISE_BODY_MARKERS`, e.g. Cloudflare or Zscaler). Failbot
 * silences these instead of reporting them to Sentry.
 */
export class NoiseError extends ResponseError {
  constructor(response: Response) {
    super(response.statusText, response)
    this.name = 'NoiseError'
  }
}

/**
 * A 401/403 response that is not a CSRF rejection or a recognized third-party proxy block. At
 * scale these are auth-lifecycle events (expired session, org-SSO re-auth, lost
 * access on a background refetch) rather than credential bugs, so failbot
 * silences them instead of reporting them to Sentry as critical.
 *
 * The name is prefixed `DataRouter` so failbot only silences this data-router
 * error, not the unrelated `AuthError` from `@azure/msal-common` (which uses the
 * same bare `name`) that failbot's global handler also forwards.
 */
export class DataRouterAuthError extends ResponseError {
  constructor(response: Response) {
    super(response.statusText, response)
    this.name = 'DataRouterAuthError'
  }
}

/**
 * Maps a non-OK `Response` to the most specific {@link ResponseError} subclass,
 * so failbot can silence expected/non-actionable statuses. Unmapped statuses
 * (e.g. 500) fall back to the base `ResponseError`, which is still reported.
 *
 * The status→category decision is shared with the GraphQL fetch path via
 * `@github-ui/failbot`'s {@link classifyHttpError}; this function only maps the
 * category to a `ResponseError` subclass and preserves the lazy body read (the
 * body is only consumed for the 403-non-CSRF and 422 cases that need it).
 */
export async function responseErrorForStatus(response: Response): Promise<ResponseError> {
  const rejectReason = response.headers.get('X-Reject-Reason')
  // Read the body only for the categories that need it: a 403 CSRF rejection is
  // classified from the header alone, and other statuses never touch the body.
  const needsBody = (response.status === 403 && rejectReason !== 'csrf') || response.status === 422
  const bodyText = needsBody ? await safeResponseText(response) : undefined

  switch (classifyHttpError({status: response.status, rejectReason, bodyText})) {
    case 'rate-limit':
      return new RateLimitError(response)
    case 'service-unavailable':
      return new ServiceUnavailableError(response)
    case 'not-acceptable':
      return new NotAcceptableError(response)
    case 'sec-fetch':
      return new SecFetchHeaderError(response)
    case 'noise':
      return new NoiseError(response)
    case 'auth':
      return new DataRouterAuthError(response)
    case 'generic':
      // Genuine 5xx server errors and 404s fall through to the base
      // ResponseError, which failbot still reports.
      return new ResponseError(response.statusText, response)
  }
}

/**
 * Reads a clone of the response body as text without consuming the original
 * response (which stays attached to the thrown error). Returns an empty string
 * if the body cannot be read.
 */
async function safeResponseText(response: Response): Promise<string> {
  try {
    return await response.clone().text()
  } catch {
    return ''
  }
}
