import {shouldIgnoreUrl} from './fetch-url-utils'

export type FetchActivityListener = () => void

/**
 * Interceptor that receives the extracted URL and the original response promise.
 * Used by ICV to track pending requests and detect completion.
 */
export type FetchInterceptor = (url: string, responsePromise: Promise<Response>) => void

const listeners = new Set<FetchActivityListener>()
const interceptors = new Set<FetchInterceptor>()
let patched = false

/**
 * Subscribe to fetch initiation events. The listener fires synchronously
 * when window.fetch is called (before the request is sent), allowing
 * consumers like dead-click detection to react instantly rather than
 * waiting for the response via PerformanceObserver.
 *
 * Telemetry URLs (analytics, stats) are filtered out via the same
 * shouldIgnoreUrl logic used by the ICV fetch patch.
 *
 * The fetch wrapper is installed lazily on the first subscription.
 */
export function onFetchInitiated(listener: FetchActivityListener): () => void {
  listeners.add(listener)
  ensurePatched()
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Register a fetch interceptor that receives the URL and response promise.
 * Interceptors fire synchronously on initiation and can chain on the
 * response promise to detect completion (e.g. ICV pending request tracking).
 *
 * Telemetry URLs are filtered out before interceptors are called.
 */
export function addFetchInterceptor(interceptor: FetchInterceptor): () => void {
  interceptors.add(interceptor)
  ensurePatched()
  return () => {
    interceptors.delete(interceptor)
  }
}

function ensurePatched(): void {
  if (patched) return
  patched = true

  const original = window.fetch
  // eslint-disable-next-line no-restricted-syntax -- intentional runtime fetch instrumentation, not a test mock
  window.fetch = createPatchedFetch(original, listeners, interceptors)
}

/**
 * Creates a patched fetch that filters telemetry URLs, notifies initiation
 * listeners synchronously, then calls interceptors with the URL and response
 * promise. Applied once via ensurePatched().
 */
export function createPatchedFetch(
  originalFetch: typeof window.fetch,
  initListeners: ReadonlySet<FetchActivityListener>,
  fetchInterceptors: ReadonlySet<FetchInterceptor>,
): typeof window.fetch {
  return function (this: typeof globalThis, ...args: Parameters<typeof fetch>): Promise<Response> {
    const input = args[0]
    const url =
      typeof input === 'string' ? input : input instanceof Request ? input.url : input instanceof URL ? input.href : ''

    if (shouldIgnoreUrl(url)) {
      return originalFetch.apply(this, args)
    }

    // Notify listeners before the request is sent so consumers like
    // dead-click detection can react synchronously on initiation.
    for (const fn of initListeners) {
      try {
        fn()
      } catch {
        // Instrumentation must not break the caller's fetch
      }
    }

    const responsePromise = originalFetch.apply(this, args)

    for (const fn of fetchInterceptors) {
      try {
        fn(url, responsePromise)
      } catch {
        // Instrumentation must not break the caller's fetch
      }
    }

    return responsePromise
  }
}
