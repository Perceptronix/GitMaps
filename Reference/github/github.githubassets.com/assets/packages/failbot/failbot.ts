// Report uncaught JS errors to Sentry
//   https://sentry.io/github/github-js

import {getOrCreateClientId} from '@github/hydro-analytics-client'
import {isSupported} from '@github/browser-support'
import {isAutomatedBrowser} from '@github-ui/browser-detection/is-automated-browser'
import {formatError, stacktrace} from '@github-ui/error-serialization'
import {requestUri} from '@github-ui/analytics-overrides'
import {bundler} from '@github-ui/runtime-environment'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {getSoftNavReferrer} from '@github-ui/soft-nav/utils'
import {getRecentRequestIds} from '@github-ui/recent-request-ids'

let extensionErrors = false
let errorsReported = 0
const loadTime = Date.now()

export const EXPECTED_NETWORK_ERROR_TYPES = new Set([
  'AbortError',
  'AuthSessionExpiredError',
  'DataRouterAuthError',
  'TypeError',
  'RateLimitError',
  'NotAcceptableError',
  'SecFetchHeaderError',
  'FetchNetworkError',
  'NoiseError',
  'ServiceUnavailableError',
])

// Network error messages are not consistent across browsers. These are known messages from:
//   - Chrome
//   - Firefox
//   - PullRequests::MergeBox::AuthSessionExpiredError
export const EXPECTED_NETWORK_ERROR_MESSAGES = new Set([
  'Failed to fetch',
  'NetworkError when attempting to fetch resource.',
  'Unable to perform this operation. Please try again later.',
])

export type ErrorContext = {
  message?: string
  critical?: boolean
  reactAppName?: string
  reactErrorBoundaryName?: string
}

// Check if an arbitrary object is an error, or at least an object that satisfies the interface of an error,
// with the necessary information to be able to report it to Sentry.
function isError(error: unknown): error is Error {
  // Check if it's a definite instance of an error
  if (error instanceof Error) return true
  // Otherwise, check that it at least satisfies the interface of an error
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    typeof error.name === 'string' &&
    'message' in error &&
    typeof error.message === 'string'
  )
}

/** Tries to serialize an arbitrary error value that is not an Error object, and returns a default message otherwise */
function serializeNonError(error: unknown): string {
  try {
    return JSON.stringify(error)
  } catch {
    return 'Unserializable'
  }
}

/**
 * TanStack Query throws a `CancelledError` when in-flight queries are cancelled
 * (e.g. `removeQueries` during hydration teardown). It is constructed as
 * `super('CancelledError')` with no `name` override and always assigns its own
 * `revert`/`silent` fields (see @tanstack/query-core `retryer.ts`).
 *
 * We fingerprint that shape structurally rather than importing
 * `@tanstack/query-core` into this widely-bundled package, and require the
 * `revert`/`silent` fields so a plain `Error('CancelledError')` is not silenced.
 */
function isTanStackCancelledError(error: Error): boolean {
  return (
    error.message === 'CancelledError' &&
    Object.prototype.hasOwnProperty.call(error, 'revert') &&
    Object.prototype.hasOwnProperty.call(error, 'silent')
  )
}

function isExpectedError(error: Error): boolean {
  if (!error.name) return false

  // We use AbortController to control events and some workflows. When we call `abort()` on it, it will raise an
  // `AbortError` which doesn't represent a real error, so we don't want to report it.
  if (error.name === 'AbortError') return true
  // TanStack Query cancellations (e.g. `removeQueries` during hydration teardown)
  // are benign and typically surface here via the global `unhandledrejection`
  // handler once the owning component has unmounted.
  if (isTanStackCancelledError(error)) return true
  // Auth-lifecycle 401/403s (expired session, org-SSO, lost access on a background
  // refetch) are expected and should not be reported to Sentry
  if (error.name === 'DataRouterAuthError') {
    return true
  }
  // Rate limit errors (429) are expected and should not be reported to Sentry
  if (error.name === 'RateLimitError') {
    return true
  }
  // Not acceptable errors (406) are expected and should not be reported to Sentry
  if (error.name === 'NotAcceptableError') {
    return true
  }
  // Sec-fetch header errors, including UI Service CSRF rejections, are expected and should not be reported to Sentry
  if (error.name === 'SecFetchHeaderError') {
    return true
  }
  // Network errors from fetch-graphql represent user connection issues and should not be reported
  if (error.name === 'FetchNetworkError') {
    return true
  }
  // Noise errors (418 and third-party 403 blocks) are not actionable and should not be reported
  if (error.name === 'NoiseError') {
    return true
  }
  // 503 errors for anonymous users are expected during high load and should not be reported
  if (error.name === 'ServiceUnavailableError' && isAnonymousUser()) {
    return true
  }
  // Failed to fetch errors are usually related to the user's network connection. They also do not represent
  // real errors related to our code, so we will also ignore them.
  if (EXPECTED_NETWORK_ERROR_TYPES.has(error.name) && EXPECTED_NETWORK_ERROR_MESSAGES.has(error.message)) return true
  // For memex we use an ApiError class to represent errors returned from the API
  // Additional details in the format of ApiErrorOpts are affixed to the name as a stringified JSON object
  // so we just need to ensure the error name starts with ApiError
  // see packages/memex/src/client/platform/api-error.ts for more details.
  if (error.name.startsWith('ApiError') && EXPECTED_NETWORK_ERROR_MESSAGES.has(error.message)) return true

  return false
}

// @deprecated Re-throw the caught exception instead.
export function reportError(error: unknown, context: ErrorContext = {}) {
  if (!isError(error)) {
    if (isIgnoredNonError(error)) return

    // Create an error instance so that we can get the stacktrace of how this was reported
    const errorForStackTrace = new Error()
    const serializedErrorValue = serializeNonError(error)
    // Construct a custom error object so we can keep track of anywhere that we report an error that isn't an Error object
    const newError: PlatformJavascriptError = {
      type: 'UnknownError',
      value: `Unable to report error, due to a thrown non-Error type: ${typeof error}, with value ${serializedErrorValue}`,
      stacktrace: stacktrace(errorForStackTrace),
      catalogService: currentCatalogService(),
      catalogServiceHash: currentCatalogServiceHash(),
    }
    report(errorContext(newError, context))
    return
  }
  if (!isExpectedError(error)) {
    report(errorContext(formatError(error), context))
  }
}

// Report context info to Sentry.
async function report(context: PlatformReportBrowserErrorInput) {
  if (!reportable()) return

  const url = document.head?.querySelector<HTMLMetaElement>('meta[name="browser-errors-url"]')?.content
  if (!url) return

  if (isExtensionError(context.error.stacktrace)) {
    extensionErrors = true
    return
  }

  errorsReported++

  try {
    await fetch(url, {method: 'post', body: JSON.stringify({context, target: getUITarget()})})
  } catch {
    // Error reporting failed so do nothing.
  }
}

function errorContext(error: PlatformJavascriptError, context: ErrorContext = {}): PlatformReportBrowserErrorInput {
  const newContext = {...context}
  if (!newContext.reactAppName) {
    newContext.reactAppName = getAppFromStacktrace(error.stacktrace)
  }

  return Object.assign(
    {
      error,
      sanitizedUrl: requestUri() || window.location.href,
      readyState: document.readyState,
      referrer: getSoftNavReferrer(),
      timeSinceLoad: Math.round(Date.now() - loadTime),
      user: pageUser() || undefined,
      actorId: pageActorId(),
      bundler,
      ui: bundler === 'vite-tss' ? true : false,
      release: pageRelease(),
      pastRequestIds: getRecentRequestIds(),
    },
    newContext,
  )
}

const extensions = /(chrome|moz|safari)-extension:\/\//

// Does this stack trace contain frames from browser extensions?
function isExtensionError(stack: PlatformStackframe[]): boolean {
  return stack.some(frame => extensions.test(frame.filename) || extensions.test(frame.function))
}

function pageRelease() {
  return document.head?.querySelector<HTMLMetaElement>('meta[name="release"]')?.content
}

function pageActorId() {
  return document.head?.querySelector<HTMLMetaElement>('meta[name="octolytics-actor-id"]')?.content
}

function getUITarget() {
  return document.head?.querySelector<HTMLMetaElement>('meta[name="ui-target"]')?.content || 'full'
}

export function pageUser() {
  const login = document.head?.querySelector<HTMLMetaElement>('meta[name="user-login"]')?.content
  if (login) return login

  const clientId = getOrCreateClientId()
  return `anonymous-${clientId}`
}

export function isAnonymousUser(): boolean {
  const login = document.head?.querySelector<HTMLMetaElement>('meta[name="user-login"]')?.content
  return !login
}

function currentCatalogService() {
  return document.head?.querySelector<HTMLMetaElement>('meta[name="current-catalog-service"]')?.content
}

function currentCatalogServiceHash() {
  return document.head?.querySelector<HTMLMetaElement>('meta[name="current-catalog-service-hash"]')?.content
}

let unloaded = false
ssrSafeWindow?.addEventListener('pageshow', () => (unloaded = false))
ssrSafeWindow?.addEventListener('pagehide', () => (unloaded = true))

// Errors from tabs open longer than 3 days are not actionable — the asset
// manifest is almost certainly stale and the fix is to reload the page.
const STALE_TAB_MS = 3 * 24 * 60 * 60 * 1000

function reportable() {
  const isStaleTab = Date.now() - loadTime > STALE_TAB_MS
  return (
    !unloaded &&
    !extensionErrors &&
    errorsReported < 10 &&
    isSupportedEnvironment() &&
    !isStaleTab &&
    !isAutomatedBrowser()
  )
}

if (typeof BroadcastChannel === 'function') {
  const sharedWorkerErrorChannel = new BroadcastChannel('shared-worker-error')
  sharedWorkerErrorChannel.addEventListener('message', event => {
    // SharedWorker will emit a formatted error
    reportError(event.data.error)
  })
}

const ignoredErrorMessages = [
  'Object Not Found Matching Id', // from Microsoft Outlook SafeLink crawler
  'Not implemented on this platform', // LastPass Safari extension
  `provider because it's not your default extension`, // MetaMask extension
]

/**
 * We see a fair number of "errors" which are not actually Error objects. This function will return true if the
 * error is one of these known non-Error types and has content which we know can safely be ignored.
 * Most of these errors come from specific browsers or extensions which we can't control, so we just ignore them.
 * @param error An error that is not an Error object
 * @returns boolean
 */
function isIgnoredNonError(error: unknown) {
  if (!error || typeof error === 'boolean' || typeof error === 'number') {
    // Rejected with a type that is not useful to report. Just ignore it.
    return true
  } else if (typeof error === 'string') {
    // rejected with a string. See if it's a known error that we can ignore
    if (ignoredErrorMessages.some(message => error.includes(message))) {
      return true
    }
  } else if (
    typeof error === 'object' &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (error as any).message === 'string' &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (error as any).code === 'number'
  ) {
    // We see an object like {"message":"Not connected","code":4900} from some extension, likely MetaMask. Ignore these
    return true
  }

  return false
}

let _isSupportedEnvironment: boolean | undefined = undefined
function isSupportedEnvironment() {
  return (_isSupportedEnvironment ??= isSupported() && canReplaceHistoryState())
}

function canReplaceHistoryState() {
  // eslint-disable-next-line no-restricted-properties
  const history = ssrSafeWindow?.history
  const location = ssrSafeWindow?.location
  if (!history || !location) return false
  try {
    history.replaceState(history.state, document.title, location.href)
    return true
  } catch {
    return false
  }
}

/**
 * Attempts to determine which app/partial an error belongs to by matching a filename in the stacktrace
 * based on the react apps that exist on the page. Starts at the top of the stack and tries to match an app.
 * If that filename does not match an app, then continue to the next line of the stack trace.
 * @param stack Stacktrace array (PlatformStackframe[])
 */
function getAppFromStacktrace(stack: PlatformStackframe[] | undefined): string | undefined {
  const reactAppsOnPage = getReactAppsOnPage()

  if (!reactAppsOnPage || !reactAppsOnPage.length || !stack || !stack.length) {
    return undefined
  }

  const filenames = new Set<string>()
  for (const frame of stack) {
    if (!frame || !frame.filename) {
      continue
    }

    // Extract the filename (without path)
    const filename = frame.filename.split(/[\\/]/).pop()
    if (!filename) {
      continue
    }

    // Only consider each filename once
    if (filenames.has(filename)) {
      continue
    }
    filenames.add(filename)

    // Try to match the filename to one of the app names
    const foundApp = reactAppsOnPage.find(appName => filename.toLowerCase().includes(appName.toLowerCase()))
    if (foundApp) {
      return foundApp
    }
  }
  return undefined
}

const appAndPartialElementAndAttributes = [
  ['react-app', 'app-name'],
  ['react-partial', 'partial-name'],
] as const

/**
 * Find all of the elements on the page that are either a react-app or react-partial.
 * For each of them, grab their app-name (or partial-name) attribute and return
 * an array containing the unique names.
 */
function getReactAppsOnPage(): string[] {
  const apps = new Set<string>()

  // Add override first for precedence.
  const appNameOverride = document.querySelector('meta[name="react-app-name"]')?.getAttribute('content')
  if (appNameOverride) {
    apps.add(appNameOverride)
  }

  for (const [elementName, attributeName] of appAndPartialElementAndAttributes) {
    for (const el of document.querySelectorAll(elementName)) {
      if (el instanceof HTMLElement) {
        const name = el.getAttribute(attributeName)
        if (name) {
          apps.add(name)
        }
      }
    }
  }

  return Array.from(apps)
}
