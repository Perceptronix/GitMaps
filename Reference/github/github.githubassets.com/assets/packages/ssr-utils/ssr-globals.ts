// When using SSR, browser globals are not available. If you try to use them, Node.js will throw an error
type SSRSafeLocation = Pick<Location, 'pathname' | 'origin' | 'search' | 'hash' | 'href'>

// Collapse consecutive leading slashes to a single slash to prevent protocol-relative
// URLs (e.g. "//evil.com/...") that browsers would interpret as an external host.
function sanitizePathname(pathname: string): string {
  return pathname.replace(/^\/{2,}/, '/')
}

// In some cases, we want to force the server environment to be used in the browser. This is useful for testing/profiling
const forceServer = typeof FORCE_SERVER_ENV !== 'undefined' ? FORCE_SERVER_ENV : false

// eslint-disable-next-line ssr-friendly/no-dom-globals-in-module-scope
export const ssrSafeDocument = typeof document === 'undefined' || forceServer ? undefined : document
// eslint-disable-next-line ssr-friendly/no-dom-globals-in-module-scope
export const ssrSafeWindow = typeof window === 'undefined' || forceServer ? undefined : window
// eslint-disable-next-line ssr-friendly/no-dom-globals-in-module-scope, no-restricted-globals
export const ssrSafeHistory = typeof history === 'undefined' || forceServer ? undefined : history
// Default location with empty values for when outside ALS context
const defaultLocation: SSRSafeLocation = {pathname: '', origin: '', search: '', hash: '', href: ''}

// Server-specific getter that can be overridden by the server module
let getServerLocation: (() => URL | undefined) | null = null

// Create a location object with getters that check server getter first, then default
function createSSRSafeLocation(): SSRSafeLocation {
  return {
    get pathname() {
      const serverUrl = getServerLocation ? getServerLocation() : undefined
      return sanitizePathname(serverUrl?.pathname ?? defaultLocation.pathname)
    },
    get origin() {
      const serverUrl = getServerLocation ? getServerLocation() : undefined
      return serverUrl?.origin ?? defaultLocation.origin
    },
    get search() {
      const serverUrl = getServerLocation ? getServerLocation() : undefined
      return serverUrl?.search ?? defaultLocation.search
    },
    get hash() {
      const serverUrl = getServerLocation ? getServerLocation() : undefined
      return serverUrl?.hash ?? defaultLocation.hash
    },
    get href() {
      const serverUrl = getServerLocation ? getServerLocation() : undefined
      return serverUrl?.href ?? defaultLocation.href
    },
  }
}

export const ssrSafeLocation: SSRSafeLocation =
  // eslint-disable-next-line ssr-friendly/no-dom-globals-in-module-scope
  typeof location === 'undefined' || forceServer ? createSSRSafeLocation() : location

// This is a special helper method for setting the location getter in the SSR environment only
export function setServerLocationGetter(getter: () => URL | undefined) {
  getServerLocation = getter
}
