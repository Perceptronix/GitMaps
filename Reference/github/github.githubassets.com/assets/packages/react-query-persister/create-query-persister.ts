// inspired by https://github.com/TanStack/query/blob/main/packages/query-persist-client-core/src/createPersister.ts
// which was originally designed to handle persisting to localstorage or react-native async storage. Since we are only
// going to be using it for IndexedDB with object shape validation, un-used code paths were removed to prevent incorrect usage.

import type {Query, QueryClient, QueryFunction, QueryFunctionContext, QueryKey} from '@tanstack/react-query'
import {notifyManager} from '@tanstack/react-query'
import type {PersistedQuery} from './types'
import type {createSafeIndexedDbPersister} from '@github-ui/safe-indexed-db-storage'
import type {SendAnalyticsEventFunction} from '@github-ui/use-analytics'
import {fastDeepEqual} from './fast-deep-equal'
import type {JSFeatureFlag} from '@github-ui/feature-flags/client-feature-flags'
import {isFeatureEnabled} from '@github-ui/feature-flags'

export type {PersistedQuery}

type Storage = ReturnType<typeof createSafeIndexedDbPersister>

export interface StoragePersisterOptions {
  /** The storage client used for setting and retrieving items from cache.
   * For SSR pass in `undefined`.
   */
  storage: Storage | undefined | null
  /**
   * Optional function to send analytics events for cache performance tracking
   */
  sendAnalyticsEvent?: SendAnalyticsEventFunction
  /**
   * The max-allowed age of the cache in milliseconds.
   * If a persisted cache is found that is older than this
   * time, it will be discarded
   * @default 24 hours
   */
  maxAgeMs?: number
  /**
   * Prefix to be used for storage key.
   * Storage key is a combination of prefix and query hash in a form of `prefix-queryHash`.
   * @default 'tanstack-query'
   */
  prefix?: string
  /**
   * If set to `true`, the query will refetch on successful query restoration if the data is stale.
   * If set to `false`, the query will not refetch on successful query restoration.
   * If set to `'always'`, the query will always refetch on successful query restoration.
   * Defaults to `true`.
   */
  refetchOnRestore?: boolean | 'always'
  /**
   * A feature flag to control the behavior of the persister.
   */
  flag?: JSFeatureFlag
}

export const PERSISTER_KEY_PREFIX = 'tanstack-query'

type PersistedQueryFromStorage = NonNullable<Awaited<ReturnType<NonNullable<Storage>['getItem']>>>
/**
 * This utility function enables fine-grained query persistence.
 * Simple add it as a `persister` parameter to `useQuery` or `defaultOptions` on `queryClient`.
 */
export function createQueryPersister({
  storage,
  sendAnalyticsEvent,
  maxAgeMs = 1000 * 60 * 60 * 24,
  prefix = PERSISTER_KEY_PREFIX,
  refetchOnRestore = true,
  flag,
}: StoragePersisterOptions) {
  async function retrieveQuery<T>(
    queryHash: string,
    afterRestoreMacroTask?: (persistedQuery: PersistedQueryFromStorage) => void,
  ) {
    if (flag && !isFeatureEnabled(flag)) {
      return
    }

    if (storage != null) {
      const storageKey = `${prefix}-${queryHash}`
      try {
        const persistedQuery = await storage.getItem(storageKey)
        if (persistedQuery) {
          if (afterRestoreMacroTask) {
            // Just after restoring we want to get fresh data from the server if it's stale
            notifyManager.schedule(() => afterRestoreMacroTask(persistedQuery))
          }
          // We must resolve the promise here, as otherwise we will have `loading` state in the app until `queryFn` resolves
          return persistedQuery.state.data as T
        }
      } catch {
        await storage.removeItem(storageKey)
      }
    }

    return
  }

  async function persistQueryByKey(queryKey: QueryKey, queryClient: QueryClient) {
    if (flag && !isFeatureEnabled(flag)) {
      return
    }
    if (storage != null) {
      const query = queryClient.getQueryCache().find({queryKey})
      if (query) {
        await persistQuery(query)
      }
    }
  }

  async function persistQuery(query: Query) {
    if (flag && !isFeatureEnabled(flag)) {
      return
    }

    if (storage != null) {
      const storageKey = `${prefix}-${query.queryHash}`
      storage.setItem(
        storageKey,
        {
          state: query.state,
          queryKey: query.queryKey,
          queryHash: query.queryHash,
        },
        query.state.dataUpdatedAt,
        maxAgeMs,
      )
    }
  }

  async function persisterFn<T, TQueryKey extends QueryKey, TPageParam = never>(
    queryFn: QueryFunction<T, TQueryKey, TPageParam>,
    ctx: QueryFunctionContext<TQueryKey>,
    query: Query,
  ) {
    if (flag && !isFeatureEnabled(flag)) {
      return queryFn(ctx as QueryFunctionContext<TQueryKey, TPageParam>)
    }

    const storageKey = `${prefix}-${query.queryHash}`

    // Check if this is a background refresh (data already exists in query state)
    const isBackgroundRefresh = query.state.data !== undefined

    const indexedDbStartTime = performance.now()

    // Try to restore only if we do not have any data in the cache and we have persister defined
    if (query.state.data === undefined && storage != null) {
      const restoredData = await retrieveQuery(query.queryHash, persistedQuery => {
        const indexedDbEndTime = performance.now()
        const indexeddb_duration_ms = Math.round(indexedDbEndTime - indexedDbStartTime)

        // Set proper updatedAt, since resolving in the first pass overrides those values
        query.setState({
          dataUpdatedAt: persistedQuery.state.dataUpdatedAt,
        })

        const is_always_restore = refetchOnRestore === 'always'
        const is_stale_data = refetchOnRestore === true && query.isStale()
        // A speculative preload (hover/focus intent) marks its fetch via
        // `meta.isPreload` (set by the Data Router `QueryRoute.preload` and the
        // UI Service loader). For those we restore from IndexedDB only and skip
        // the background revalidation, so hovering a link doesn't fire a network
        // request when the cache is already warm. The real navigation re-runs
        // without the flag and revalidates as usual.
        const is_preload = query.meta?.['isPreload'] === true
        const should_refetch = !is_preload && (is_always_restore || is_stale_data)
        const analyticsPayload = {is_always_restore, is_stale_data, is_preload, indexeddb_duration_ms}

        if (should_refetch) {
          // intentionally not blocking while background api fetch, but need to measure API time
          const timedFetch = async () => {
            const cachedData = persistedQuery.state.data
            const apiStartTime = performance.now()
            try {
              await query.fetch()
            } catch {
              // query.fetch() already dispatches error state to TanStack Query internally.
              // We only need to avoid bubbling a rejected promise from this fire-and-forget path.
              return
            }
            const apiEndTime = performance.now()
            const serverData = query.state.data

            // Compare cached data with server data using fast deep equality
            // Wrap in try-catch to handle any unexpected errors gracefully
            let cached_data_matches_server: boolean
            try {
              cached_data_matches_server = fastDeepEqual(cachedData, serverData)
            } catch {
              // If comparison fails for any reason, report as not matching
              cached_data_matches_server = false
            }

            sendAnalyticsEvent?.('offline_cache.stale_while_revalidate', storageKey, {
              ...analyticsPayload,
              stale_visible_ms: Math.round(apiEndTime - indexedDbEndTime),
              api_duration_ms: Math.round(apiEndTime - apiStartTime),
              total_ms: Math.round(apiEndTime - indexedDbStartTime),
              cached_data_matches_server,
            })
          }

          void timedFetch()
        } else {
          sendAnalyticsEvent?.('offline_cache.cache_hit', storageKey, analyticsPayload)
        }
      })

      if (restoredData !== undefined) {
        return Promise.resolve(restoredData as T)
      }
    }

    // If we did not restore, or restoration failed - fetch
    const apiStartTime = performance.now()
    // `ctx` is the base context TanStack passes the persister; `queryFn` may
    // expect the page-param-aware context for infinite queries. We forward it
    // unchanged, so widen to `queryFn`'s parameter type.
    const queryFnResult = await queryFn(ctx as QueryFunctionContext<TQueryKey, TPageParam>)
    const api_duration_ms = Math.round(performance.now() - apiStartTime)

    // Track cache miss if this was the initial query
    if (!isBackgroundRefresh) {
      sendAnalyticsEvent?.('offline_cache.cache_miss', storageKey, {
        api_duration_ms,
        total_ms: Math.round(performance.now() - indexedDbStartTime),
      })
    }

    if (storage != null) {
      // Persist if we have storage defined, we use timeout to get proper state to be persisted
      notifyManager.schedule(() => {
        persistQuery(query)
      })
    }

    return Promise.resolve(queryFnResult)
  }

  // Currently it seems that this is only used in tests
  // If this is required, it might be better to move it inside createSafeIndexedDbPersister (so it can be reused by the relay query cache)
  async function persisterGc() {
    if (storage?.entries) {
      const entries = await storage.entries()
      for (const [key, value] of entries) {
        if (key.startsWith(prefix)) {
          const persistedQuery = value

          if (storage.isBustedOrExpired(persistedQuery)) {
            await storage.removeItem(key)
          }
        }
      }
    } else if (process.env.NODE_ENV === 'development') {
      throw new Error(
        'Provided storage does not implement `entries` method. Garbage collection is not possible without ability to iterate over storage items.',
      )
    }
  }

  // Currently it seems that this is only used in tests
  // If this is required, it might be better to move it inside createSafeIndexedDbPersister (so it can be reused by the relay query cache)
  async function restoreQueries(queryClient: QueryClient): Promise<void> {
    if (storage?.entries) {
      const entries = await storage.entries()
      for (const [key, value] of entries) {
        if (key.startsWith(prefix)) {
          const persistedQuery = value

          if (storage.isBustedOrExpired(persistedQuery)) {
            await storage.removeItem(key)
            continue
          }

          queryClient.setQueryData(persistedQuery.queryKey, persistedQuery.state.data, {
            updatedAt: persistedQuery.state.dataUpdatedAt,
          })
        }
      }
    } else if (process.env.NODE_ENV === 'development') {
      throw new Error(
        'Provided storage does not implement `entries` method. Restoration of all stored entries is not possible without ability to iterate over storage items.',
      )
    }
  }

  return {
    persisterFn,
    persistQuery,
    persistQueryByKey,
    retrieveQuery,
    persisterGc,
    restoreQueries,
  }
}
