import {useSyncExternalStore} from 'react'

const browserEnvironment = {
  type: 'browser',
  isBrowser: true,
  isServer: false,
} as const

const serverEnvironment = {
  type: 'server',
  isBrowser: false,
  isServer: true,
} as const

export type RuntimeEnvironment = typeof browserEnvironment | typeof serverEnvironment

// The runtime environment never changes after initial load, so we use a no-op subscribe
function subscribe() {
  return () => {}
}

function getSnapshot(): RuntimeEnvironment {
  return browserEnvironment
}

function getServerSnapshot(): RuntimeEnvironment {
  return serverEnvironment
}

/**
 * A React hook that returns the current runtime environment.
 *
 * This hook uses `useSyncExternalStore` to properly handle SSR and hydration,
 * ensuring consistent behavior across server and client rendering.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const {isBrowser, isServer, type} = useRuntimeEnvironment()
 *
 *   if (isServer) {
 *     return <ServerPlaceholder />
 *   }
 *
 *   return <BrowserOnlyContent />
 * }
 * ```
 *
 * @returns RuntimeEnvironment object containing:
 *   - `type`: 'browser' | 'server'
 *   - `isBrowser`: boolean
 *   - `isServer`: boolean
 */
export function useRuntimeEnvironment(): RuntimeEnvironment {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
