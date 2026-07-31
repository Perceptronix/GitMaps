/**
 * Shared HTTP status → error category classifier for GitHub's fetch paths.
 *
 * Both `@github-ui/react-core`'s `responseErrorForStatus` and
 * `@github-ui/fetch-graphql`'s `assertNoHttpErrors` run a non-OK response
 * through this classifier to agree on _what_ the condition is. Each package then
 * maps the category onto its own `Error` class and chooses its own reporting
 * policy: most categories map to a named subclass on the expected-error
 * allowlist in `EXPECTED_NETWORK_ERROR_TYPES` (see `./failbot`) so failbot
 * silences them, but a consumer may instead map a category to a reported error
 * (e.g. fetch-graphql keeps reporting `'auth'` as a base `Error`).
 *
 * This module owns only the pure status → category decision, keeping "how a
 * status is classified" a single source of truth while leaving error reporting
 * (e.g. `critical`, silence the error, etc.) to the consumer.
 */
export type HttpErrorCategory =
  | 'rate-limit'
  | 'service-unavailable'
  | 'not-acceptable'
  | 'sec-fetch'
  | 'noise'
  | 'auth'
  | 'generic'

export type ClassifyHttpErrorInput = {
  /** HTTP status code of the response. */
  status: number
  /** Value of the `X-Reject-Reason` header, if present. */
  rejectReason?: string | null
  /**
   * Response body text, when it has already been read. Lazy paths may omit it.
   * Falls back to empty string if unable to read.
   */
  bodyText?: string
}

/**
 * Substrings that identify third-party block pages returned on the way to
 * GitHub: Cloudflare bot-protection on custom domains, and corporate
 * secure-web-gateway proxies (e.g. Zscaler) that answer the JSON endpoint with
 * their own HTML 403. These are non-actionable infrastructure noise, not GitHub
 * responses. Matched case-insensitively against the response body.
 */
export const NOISE_BODY_MARKERS = new Set(['cloudflare', 'zscaler'])

/**
 * Maps an HTTP status (plus a couple of header/body signals) to the most
 * specific error category. Pure and `Response`-free, so it works for both eager
 * (fetch-graphql) and lazy (react-core) body reads.
 */
export function classifyHttpError({status, rejectReason, bodyText}: ClassifyHttpErrorInput): HttpErrorCategory {
  switch (status) {
    case 429:
      return 'rate-limit'
    case 503:
      return 'service-unavailable'
    case 406:
      return 'not-acceptable'
    // 410 Gone and 418 are non-actionable environmental noise
    // (deprecated endpoints, bots).
    case 410:
    case 418:
      return 'noise'
    // A 401 is likely an auth-lifecycle condition; unlike a 403 (below) it has no
    // body-dependent sibling to disambiguate.
    case 401:
      return 'auth'
  }

  if (status === 403) {
    // 1. Third-party block pages returned on the way to GitHub are non-actionable infrastructure noise.
    // Checked before the CSRF header to preserve fetch-graphql's original
    // ordering (isNoiseError ran first).
    const lowerBody = bodyText?.toLowerCase()
    if (lowerBody && [...NOISE_BODY_MARKERS].some(marker => lowerBody.includes(marker))) {
      return 'noise'
    }
    // 2. UI Service CSRF rejections surface via the X-Reject-Reason header, so
    // they're identifiable without the body.
    if (rejectReason === 'csrf') {
      return 'sec-fetch'
    }
    // 3. Only silence a 403 as auth when a readable body with no recognized
    // noise marker provides positive evidence it's an auth-lifecycle
    // condition (expired session, org-SSO re-auth, lost access on a
    // background refetch).
    //
    // e.g. react-core's `safeResponseText` returns '' for both an empty
    // and an unreadable body, so the two are indistinguishable here.
    // A missing, empty, or unreadable body is not positive evidence,
    // so it stays reported as `'generic'`.
    return bodyText ? 'auth' : 'generic'
  }

  if (status === 422 && (bodyText?.includes('sec-fetch-dest') || bodyText?.includes('sec-fetch-site'))) {
    return 'sec-fetch'
  }

  return 'generic'
}
