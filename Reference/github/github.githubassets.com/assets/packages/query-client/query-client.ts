// eslint-disable-next-line @github-ui/github-monorepo/prefer-github-ui-react-query
import {QueryClient, type QueryClientConfig} from '@tanstack/react-query'

import {queryKeyHashFn} from './query-key-hash-fn'

let browserQueryClient: QueryClient | null = null
let serverQueryClientGetter: (() => QueryClient) | null = null

const QueryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      networkMode: 'always',
      queryKeyHashFn,
    },
    mutations: {
      networkMode: 'always',
    },
  },
}

/**
 * Creates a new QueryClient with default configuration. Can be customized via `queryConfig`.
 *
 * @param queryConfig - Partial options to customize the QueryClient
 * @returns A new QueryClient instance
 */
export function createQueryClient(queryConfig?: Partial<QueryClientConfig>): QueryClient {
  return new QueryClient({...QueryClientConfig, ...queryConfig})
}

/**
 * Get the QueryClient instance for the current environment.
 *
 * On the server, if a custom getter has been set via `setServerQueryClientGetter`,
 * it will be used to retrieve the QueryClient (typically from AsyncLocalStorage).
 *
 * On the browser (or if no server getter is set), returns a singleton QueryClient
 * instance that is lazily created on first access.
 *
 * @returns The QueryClient instance for the current environment
 */
export function getQueryClient(): QueryClient {
  if (serverQueryClientGetter) {
    return serverQueryClientGetter()
  }

  return (browserQueryClient ??= createQueryClient())
}

/**
 * Set a custom getter function for retrieving the QueryClient on the server.
 *
 * This allows server-side code to use AsyncLocalStorage or other request-scoped
 * mechanisms to provide per-request QueryClient instances, ensuring data isolation
 * between concurrent requests.
 *
 * @example
 * ```ts
 * // In server initialization
 * setServerQueryClientGetter(() => getServerQueryClient())
 * ```
 *
 * @param getter - A function that returns the QueryClient for the current request
 */
export function setServerQueryClientGetter(getter: () => QueryClient): void {
  serverQueryClientGetter = getter
}

/**
 * Resets the browser singleton query client by clearing all cached queries.
 *
 * On the server, each request gets its own fresh QueryClient via `runWithQueryClientContext`,
 * so this only needs to clear the browser singleton. This avoids going through the server
 * getter which would require an active AsyncLocalStorage context.
 */
export function resetQueryClient(): void {
  browserQueryClient?.clear()
}

export async function resetQueryClientCancellingInFlight(): Promise<void> {
  await browserQueryClient?.cancelQueries()
  resetQueryClient()
}

// This is for tests only
export function _resetForTests() {
  browserQueryClient = null
  // Note: we don't reset serverQueryClientGetter here because it's set once at module load time
  // by query-client.server.ts and should persist across test resets
}
