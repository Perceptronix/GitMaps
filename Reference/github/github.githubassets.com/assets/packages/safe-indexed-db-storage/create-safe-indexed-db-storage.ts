import {createStore, del, delMany, entries, get, set, clear} from 'idb-keyval'

import {getCurrentUserLogin} from '@github-ui/client-env'
import {trackStorage} from './track-storage'
import {isFeatureEnabled} from '@github-ui/feature-flags'
import {yieldToMain} from '@github-ui/yield-to-main'
import type {SendAnalyticsEventFunction} from './types'
export type {SendAnalyticsEventFunction} from './types'

/**
 * Validates the *shape* (structure) of a cached value, not its actual contents.
 * `Check` asserts the value matches the expected schema/proto structure; it does
 * not inspect individual field values. For value-level checks, use the
 * caller-provided {@link DataValidator} (`dataValidator`), which runs after this.
 */
export interface Validator {
  Check(value: unknown): boolean
  Code(): string
  Errors(value: unknown): unknown[]
}

/**
 * Optional, caller-provided validator for the *actual data values* of a cached
 * entry (business rules, version gates, etc.) — as opposed to the structural
 * {@link Validator} shape check. `isValid` runs *after* the shape `validator`
 * passes; returning `false` marks the entry as invalid, which evicts it and
 * reports a `DATA_INVALID` event.
 *
 * `name` is a stable, caller-supplied string that uniquely identifies this
 * validator. Persister instances are cached and keyed in part by this `name`,
 * so two callers sharing a db/store/shape-validator but using different data
 * validators get separate instances. Keep `name` stable across calls (define it
 * once at module/route setup) and unique per distinct `isValid` behaviour.
 */
export type DataValidator = {
  name: string
  isValid: (data: unknown) => boolean
}

type Props = {
  validator: Validator
  sendAnalyticsEvent: SendAnalyticsEventFunction
  storeName?: string
  dataValidator?: DataValidator
}

export const SIMPLE_VALIDATOR = {
  Check(value: unknown): boolean {
    return typeof value === 'object' && value !== null
  },
  Code() {
    return 'simple-validator'
  },
  Errors() {
    return []
  },
}

export const CACHE_EVENTS = {
  CACHE_HIT: 'offline_cache.cache_hit',
  CACHE_MISS: 'offline_cache.cache_miss',
  CACHE_EVICT: 'offline_cache.cache_evict',
  CACHE_INVALID: 'offline_cache.stale_structure',
  DATA_INVALID: 'offline_cache.data_invalid',
  CACHE_EXPIRED: 'offline_cache.expired_item',
  CACHE_SET: 'offline_cache.cache_set',
  CACHE_TIMEOUT: 'offline_cache.cache_timeout',
  CACHE_SESSION_DISABLED: 'offline_cache.session_disabled',
  CACHE_READ_ERROR: 'offline_cache.read_error',
  CACHE_EVICT_ERROR: 'offline_cache.evict_error',
  CACHE_WRITE_ERROR: 'offline_cache.write_error',
  CLEANUP_STARTED: 'offline_cache.cleanup_started',
  CLEANUP_COMPLETED: 'offline_cache.cleanup_completed',
  CLEANUP_ERROR: 'offline_cache.cleanup_error',
  CLEANUP_ITEM_ERROR: 'offline_cache.cleanup_item_error',
  WARMUP: 'offline_cache.warmup',
  WARMUP_ERROR: 'offline_cache.warmup_error',
  ENTRIES_READ: 'offline_cache.entries_read',
  ANY: 'offline_cache.*',
  NONE: 'offline_cache.none',
} as const

const INDEXEDDB_READ_TIMEOUT_MS = 500
const INDEXEDDB_WRITE_TIMEOUT_MS = 2000

// Key used only to force the lazy idb-keyval connection open during warmup. It is
// never written, so the probe read is always a cheap miss.
const WARMUP_PROBE_KEY = '__offline_cache_warmup_probe__'

const NOT_AVAILABLE = 'N/A'
let isIndexedDbDisabledForSession = false

function isFatalIndexedDbError(error: unknown): error is DOMException {
  if (!(error instanceof Error)) return false

  // In environments where DOMException is available, check for it explicitly
  // In other environments, don't treat errors as fatal DOMExceptions
  const isDOMException = typeof DOMException !== 'undefined' ? error instanceof DOMException : false

  if (isDOMException && 'name' in error) {
    const errorName = (error as DOMException).name
    return (
      errorName === 'SecurityError' ||
      errorName === 'UnknownError' ||
      errorName === 'AbortError' ||
      errorName === 'QuotaExceededError' ||
      errorName === 'NotFoundError' ||
      errorName === 'VersionError'
    )
  }

  return false
}

export function isIndexedDbAvailable(): boolean {
  try {
    return typeof globalThis !== 'undefined' && typeof globalThis.indexedDB !== 'undefined'
  } catch {
    return false
  }
}

class IndexedDbTimeoutError extends Error {
  constructor(operation: 'read' | 'write', key: string, timeoutMs: number) {
    super(`IndexedDB ${operation} operation timed out after ${timeoutMs}ms for key: ${key}`)
    this.name = 'IndexedDbTimeoutError'
  }
}

export type CacheEvent = (typeof CACHE_EVENTS)[keyof typeof CACHE_EVENTS]
export type ANY_CACHE_EVENT = typeof CACHE_EVENTS.ANY
export type NO_CACHE_EVENTS = typeof CACHE_EVENTS.NONE

export const DBNAME_PREFIX = 'offline_cache::'
export const CACHE_VERSION = 1
export const getDbName = () => DBNAME_PREFIX + getCurrentUserLogin()

type SafeIndexedDbPersister<TPersistedQuery> = {
  cleanupIntervalId: number | undefined
  isCleanupRunning: boolean
  getItem(key: string, attributes?: {[key: string]: unknown}): Promise<TPersistedQuery | undefined>
  setItem(
    key: string,
    value: TPersistedQuery,
    dataUpdatedAt?: number,
    ttl?: number,
    attributes?: {[key: string]: unknown},
  ): Promise<void>
  removeItem(key: string, attributes?: {[key: string]: unknown}): Promise<void>
  isBustedOrExpired(persistedQuery: TPersistedQuery): boolean
  entries(): Promise<Array<[string, TPersistedQuery]>>
  cleanupExpiredEntries(): Promise<void>
  stopPeriodicCleanup(): void
  warmup(): Promise<void>
}

// Singleton cache to ensure only one persister instance per store
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const persisters = new Map<string, SafeIndexedDbPersister<any>>()

// Cleanup is a whole-store operation, but persisters are keyed by validator, so
// many instances share a single IndexedDB object store. Without this shared
// state each instance would schedule and run its own full-store scan. Keyed by
// `${dbName}::${storeName}`.
//
// `intervalId` doubles as the "is scheduled" flag. Keeping the timer here rather
// than on the persister instance matters: if the flag lived in shared state
// while the timer lived on whichever instance happened to start it, a *different*
// instance calling `stopPeriodicCleanup()` would clear the flag without clearing
// the live timer, and the next `startPeriodicCleanup()` would add a second one.
const cleanupStates = new Map<string, {running: boolean; intervalId: number | undefined}>()

function getCleanupState(cleanupKey: string) {
  let state = cleanupStates.get(cleanupKey)
  if (!state) {
    state = {running: false, intervalId: undefined}
    cleanupStates.set(cleanupKey, state)
  }
  return state
}

export function clearPersisterCache() {
  for (const persister of persisters.values()) {
    if (persister && typeof persister.stopPeriodicCleanup === 'function') {
      persister.stopPeriodicCleanup()
    }
  }
  persisters.clear()
  cleanupStates.clear()
  resetSessionState()
}

export function resetSessionState() {
  isIndexedDbDisabledForSession = false
}

declare global {
  interface Window {
    __SAFE_INDEXED_DB_CLEAR_PERSISTERS__?: () => void
  }
}

// Expose a global cleanup hook so tests can stop persister periodic-cleanup
// timers and clear the singleton registry without importing this module
// (avoids vi.mock issues). Mirrors `__SAFE_STORAGE_CLEAR_ALL_CACHES__` in
// @github-ui/use-safe-storage.
if (typeof window !== 'undefined') {
  window.__SAFE_INDEXED_DB_CLEAR_PERSISTERS__ = () => {
    clearPersisterCache()
  }
}

export function createSafeIndexedDbPersister<
  TState extends {
    data: unknown | null
    dataUpdatedAt?: number
    ttl?: number
    preheatSource?: string
    cacheVersion?: number
    variables?: Record<string, unknown>
  },
  TPersistedQuery extends {state: TState; queryKey?: readonly unknown[]; queryHash: string},
>({validator, sendAnalyticsEvent, storeName = 'queries', dataValidator}: Props) {
  // Persisters are cached and shared per id, so the id captures everything baked
  // into the instance: db name, store, shape-validator `Code()`, and the data
  // validator's `name` (so callers with different data validators don't share).
  // The data validator segment is prefixed when present and empty when absent, so
  // a caller can't impersonate the "no validator" case by naming theirs `none`.
  const dataValidatorKey = dataValidator ? `data:${dataValidator.name}` : ''
  const persisterId = `${getDbName()}:${storeName}:${validator.Code()}:${dataValidatorKey}`
  const cleanupKey = `${getDbName()}::${storeName}`

  // Return existing instance if available
  const existingPersister = persisters.get(persisterId)
  if (existingPersister) {
    return existingPersister
  }

  function isExpired(persistedQuery: TPersistedQuery) {
    // Treat null/undefined records or records without state as expired (should be cleaned up)
    if (!persistedQuery || !persistedQuery.state) {
      return true
    }

    if (persistedQuery.state.dataUpdatedAt && persistedQuery.state.ttl) {
      const queryAge = Date.now() - persistedQuery.state.dataUpdatedAt
      if (queryAge > persistedQuery.state.ttl) {
        return true
      }
    }
    if (persistedQuery.state.cacheVersion !== undefined && persistedQuery.state.cacheVersion !== CACHE_VERSION) {
      return true
    }

    // Treat queries without dataUpdatedAt or ttl as never expiring
    return false
  }

  let idbStore: ReturnType<typeof createStore> | undefined
  try {
    idbStore = createStore(getDbName(), storeName)
  } catch (error) {
    if (isFatalIndexedDbError(error)) {
      isIndexedDbDisabledForSession = true
      sendAnalyticsEvent(CACHE_EVENTS.CACHE_SESSION_DISABLED, '', {
        reason: 'fatal_error_on_init',
        error_name: error.name,
      })
    }
  }

  // Ensures the connection is only warmed once per persister instance.
  let hasWarmedUp = false

  function isIndexedDbDisabled(): boolean {
    return isFeatureEnabled('disable-indexdb-operations') || isIndexedDbDisabledForSession
  }

  async function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    operation: 'read' | 'write',
    key: string,
  ): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const timeoutPromise = new Promise<T>((_, reject) => {
      timeoutId = setTimeout(() => {
        sendAnalyticsEvent(CACHE_EVENTS.CACHE_TIMEOUT, key, {operation})
        reject(new IndexedDbTimeoutError(operation, key, timeoutMs))
      }, timeoutMs)
    })

    try {
      const result = await Promise.race([promise, timeoutPromise])
      // Clear timeout if promise resolves successfully
      if (timeoutId) clearTimeout(timeoutId)
      return result
    } catch (error) {
      // Clear timeout if promise rejects
      if (timeoutId) clearTimeout(timeoutId)
      throw error
    }
  }

  /**
   * Walks the object store with a read-only cursor and collects the keys of
   * expired records.
   *
   * Deliberately avoids `entries()`/`getAll()`: reading `request.result` for a
   * `getAll` structured-clone-deserializes *every* cached payload inside a single
   * task, which on a warm cache is routinely 80-100ms of blocking main-thread
   * time. A cursor deserializes one record per IDB success event, so the same
   * total work is spread across many short tasks and never blocks a frame.
   */
  function scanForExpiredKeys(store: NonNullable<typeof idbStore>) {
    return store('readonly', objectStore => {
      return new Promise<{expiredKeys: IDBValidKey[]; totalEntries: number}>((resolve, reject) => {
        const expiredKeys: IDBValidKey[] = []
        let totalEntries = 0
        const request = objectStore.openCursor()

        request.onsuccess = () => {
          const cursor = request.result
          if (!cursor) {
            resolve({expiredKeys, totalEntries})
            return
          }

          totalEntries++
          try {
            if (isExpired(cursor.value as TPersistedQuery)) {
              expiredKeys.push(cursor.key)
            }
          } catch (error) {
            sendAnalyticsEvent(CACHE_EVENTS.CLEANUP_ITEM_ERROR, cursor.key.toString(), {
              error: String(error),
            })
          }
          cursor.continue()
        }

        request.onerror = () => reject(request.error)
      })
    })
  }

  async function cleanupExpiredEntries() {
    const cleanupState = getCleanupState(cleanupKey)
    if (cleanupState.running) return
    cleanupState.running = true
    const startTime = Date.now()
    try {
      sendAnalyticsEvent(CACHE_EVENTS.CLEANUP_STARTED, '', {})

      if (!isIndexedDbAvailable() || !idbStore) {
        return
      }

      const {expiredKeys, totalEntries} = await scanForExpiredKeys(idbStore)

      // One transaction for all deletes rather than one per expired key.
      if (expiredKeys.length > 0) {
        await delMany(expiredKeys, idbStore)
      }

      for (const key of expiredKeys) {
        sendAnalyticsEvent(CACHE_EVENTS.CACHE_EVICT, key.toString(), {
          reason: 'periodic_cleanup',
        })
      }

      sendAnalyticsEvent(CACHE_EVENTS.CLEANUP_COMPLETED, '', {
        removed_count: expiredKeys.length,
        total_entries: totalEntries,
        duration_ms: Date.now() - startTime,
      })
    } catch (error) {
      try {
        sendAnalyticsEvent(CACHE_EVENTS.CLEANUP_ERROR, '', {
          error: String(error),
        })
      } catch {
        // Swallow analytics errors to prevent unhandled rejections during cleanup
      }
    } finally {
      cleanupState.running = false
    }
  }

  function startPeriodicCleanup(intervalMs: number = 60 * 60 * 1000) {
    if (typeof window === 'undefined') return

    // Only one persister per (db, store) owns the schedule. Otherwise every
    // validator-specific persister on the page kicks off its own full-store scan.
    const cleanupState = getCleanupState(cleanupKey)
    if (cleanupState.intervalId !== undefined) return

    const scheduleCleanup = () => {
      const windowWithIdleCallback = window as Window & {requestIdleCallback?: typeof requestIdleCallback}
      if (typeof windowWithIdleCallback.requestIdleCallback === 'function') {
        windowWithIdleCallback.requestIdleCallback(() => void cleanupExpiredEntries(), {timeout: 10000})
      } else {
        setTimeout(() => void cleanupExpiredEntries(), 10000)
      }
    }

    scheduleCleanup()

    cleanupState.intervalId = window.setInterval(() => void cleanupExpiredEntries(), intervalMs)
  }

  function stopPeriodicCleanup() {
    const cleanupState = getCleanupState(cleanupKey)
    if (cleanupState.intervalId !== undefined) {
      clearInterval(cleanupState.intervalId)
      cleanupState.intervalId = undefined
    }
  }

  const persister = {
    // Schedule state is shared by every persister targeting the same object store.
    get cleanupIntervalId() {
      return getCleanupState(cleanupKey).intervalId
    },
    // Cleanup state is shared by every persister targeting the same object store.
    get isCleanupRunning() {
      return getCleanupState(cleanupKey).running
    },
    async getItem(
      key: string,
      attributes?: {
        [key: string]: unknown
      },
    ) {
      if (isIndexedDbDisabled() || !isIndexedDbAvailable()) {
        return
      }

      const startTime = Date.now()
      try {
        const item = await withTimeout(get<TPersistedQuery>(key, idbStore), INDEXEDDB_READ_TIMEOUT_MS, 'read', key)
        const readDurationMs = Date.now() - startTime
        if (!item?.state?.data) {
          sendAnalyticsEvent(CACHE_EVENTS.CACHE_MISS, key.toString(), {
            ...attributes,
            read_duration_ms: readDurationMs,
          })
          return
        }

        if (isExpired(item)) {
          this.removeItem(key)
          sendAnalyticsEvent?.('offline_cache.expired_item', key.toString(), {
            ...attributes,
            read_duration_ms: readDurationMs,
          })
          return
        }

        // Shape validation: `validator.Check` only asserts the cached value has
        // the expected *structure* (e.g. matches the schema/proto shape). It does
        // not inspect the actual field values.
        //
        // Yield before this synchronous validation so a large cached payload's
        // shape + data validation runs in its own task rather than extending the
        // one that resolved the read. This keeps hydration from forming a single
        // long main-thread block (see INP work on the PR MergeBox/ChecksSection).
        // Gated so it can be rolled out and measured independently.
        //
        // `yieldToMain` deliberately never waits for idle: this runs on the
        // hydration path, which overlaps app boot, so deferring the continuation
        // would cancel out the "restore sooner" work it exists to enable.
        if (isFeatureEnabled('offline_cache_restore_yield')) {
          await yieldToMain()
        }

        const hasValidShape = validator.Check(item.state.data)
        if (!hasValidShape) {
          this.removeItem(key)
          sendAnalyticsEvent(CACHE_EVENTS.CACHE_INVALID, key.toString(), {
            ...attributes,
            errors: validator.Errors(item.state.data),
            read_duration_ms: readDurationMs,
          })
          return
        }

        // Data validation: the caller-provided `dataValidator` inspects the
        // actual data values (business rules, version gates, etc.). It runs only
        // after the shape check passes. A `false` result evicts the entry and
        // reports a distinct event.
        if (dataValidator && !dataValidator.isValid(item.state.data)) {
          this.removeItem(key)
          sendAnalyticsEvent(CACHE_EVENTS.DATA_INVALID, key.toString(), {
            ...attributes,
            read_duration_ms: readDurationMs,
          })
          return
        }

        const age = item.state.dataUpdatedAt ? Date.now() - item.state.dataUpdatedAt : NOT_AVAILABLE
        const ttl = item.state.ttl ?? NOT_AVAILABLE
        sendAnalyticsEvent(CACHE_EVENTS.CACHE_HIT, key.toString(), {
          ...attributes,
          age,
          ttl,
          preheat_source: item.state.preheatSource,
          read_duration_ms: readDurationMs,
        })
        return item
      } catch (error) {
        const readDurationMs = Date.now() - startTime
        if (error instanceof IndexedDbTimeoutError) {
          sendAnalyticsEvent(CACHE_EVENTS.CACHE_MISS, key.toString(), {
            ...attributes,
            read_duration_ms: readDurationMs,
            timeout: true,
          })
          return undefined
        }
        if (isFatalIndexedDbError(error)) {
          isIndexedDbDisabledForSession = true
          sendAnalyticsEvent(CACHE_EVENTS.CACHE_SESSION_DISABLED, key.toString(), {
            reason: 'fatal_error',
            error_name: error.name,
            read_duration_ms: readDurationMs,
          })
          sendAnalyticsEvent(CACHE_EVENTS.CACHE_READ_ERROR, key.toString(), {
            ...attributes,
            session_disabled: true,
            error_name: error.name,
            read_duration_ms: readDurationMs,
          })
          return undefined
        }
        throw error
      }
    },
    async setItem(
      key: string,
      value: TPersistedQuery,
      dataUpdatedAt?: number,
      ttl?: number,
      attributes?: {
        [key: string]: unknown
      },
    ) {
      if (isIndexedDbDisabled() || !isIndexedDbAvailable()) {
        return Promise.resolve()
      }

      const effectiveTtl = ttl ?? value.state.ttl
      const valueToStore = {
        ...value,
        state: {
          ...value.state,
          dataUpdatedAt: dataUpdatedAt ?? value.state.dataUpdatedAt,
          ttl: effectiveTtl,
          cacheVersion: CACHE_VERSION,
        },
      }
      trackStorage(key, sendAnalyticsEvent)
      sendAnalyticsEvent(CACHE_EVENTS.CACHE_SET, key.toString(), {
        ...attributes,
        ttl: effectiveTtl,
      })

      try {
        await withTimeout(set(key, valueToStore, idbStore), INDEXEDDB_WRITE_TIMEOUT_MS, 'write', key)
      } catch (error) {
        if (error instanceof IndexedDbTimeoutError) {
          return
        }
        if (isFatalIndexedDbError(error)) {
          isIndexedDbDisabledForSession = true
          sendAnalyticsEvent(CACHE_EVENTS.CACHE_SESSION_DISABLED, key.toString(), {
            reason: 'fatal_error',
            error_name: error.name,
          })
          sendAnalyticsEvent(CACHE_EVENTS.CACHE_WRITE_ERROR, key.toString(), {
            ...attributes,
            session_disabled: true,
            error_name: error.name,
          })
          return
        }
        throw error
      }
    },
    async removeItem(key: string, attributes?: {[key: string]: unknown}) {
      sendAnalyticsEvent(CACHE_EVENTS.CACHE_EVICT, key.toString(), attributes)

      if (!isIndexedDbAvailable()) {
        return
      }

      return del(key, idbStore)
    },
    isBustedOrExpired(persistedQuery: TPersistedQuery) {
      return isExpired(persistedQuery)
    },
    async entries() {
      if (!isIndexedDbAvailable()) {
        return []
      }

      const startTime = Date.now()
      const things = await entries(idbStore)
      const durationMs = Date.now() - startTime
      sendAnalyticsEvent(CACHE_EVENTS.ENTRIES_READ, '', {
        duration_ms: durationMs,
        entry_count: things.length,
      })
      return things as Array<[string, TPersistedQuery]>
    },
    cleanupExpiredEntries,
    stopPeriodicCleanup,
    // Pre-opens the IndexedDB connection off the critical path (e.g. during idle
    // boot) so the first real getItem() during query resolution only pays the
    // read cost, not the one-time DB-open cost. idb-keyval opens the database
    // lazily on first use, so a single cheap probe read is enough to trigger it.
    // Best-effort and idempotent: failures are swallowed and leave the connection
    // to be opened by a later real read.
    async warmup() {
      if (hasWarmedUp) return

      if (isIndexedDbDisabled() || !isIndexedDbAvailable()) {
        return
      }

      hasWarmedUp = true

      const startTime = Date.now()
      try {
        await withTimeout(get(WARMUP_PROBE_KEY, idbStore), INDEXEDDB_READ_TIMEOUT_MS, 'read', WARMUP_PROBE_KEY)
        sendAnalyticsEvent(CACHE_EVENTS.WARMUP, '', {duration_ms: Date.now() - startTime})
      } catch (error) {
        const isTimeout = error instanceof IndexedDbTimeoutError

        // Report a dedicated warmup_error for every failure so warmup telemetry is
        // complete and independent. Timeouts additionally emit the generic
        // CACHE_TIMEOUT event via withTimeout; we keep that and attribute the
        // timeout to warmup here via the `timeout` flag.
        sendAnalyticsEvent(CACHE_EVENTS.WARMUP_ERROR, '', {
          error: String(error),
          duration_ms: Date.now() - startTime,
          timeout: isTimeout,
        })

        if (isFatalIndexedDbError(error)) {
          // Preserve the fatal-error session-disable contract used by real reads.
          isIndexedDbDisabledForSession = true
          sendAnalyticsEvent(CACHE_EVENTS.CACHE_SESSION_DISABLED, '', {
            reason: 'fatal_error',
            error_name: error.name,
          })
          return
        }

        // Allow a later warmup or real read to retry the open.
        hasWarmedUp = false

        // A non-timeout rejection means indexedDB.open itself failed. idb-keyval
        // caches the rejected open promise inside the store closure, so every later
        // real read would reuse that poisoned promise and reject too. Recreate the
        // store to drop the poisoned connection so subsequent reads can retry.
        // Timeouts leave the in-flight open promise intact (it may still resolve),
        // so the store is preserved in that case.
        if (!isTimeout) {
          try {
            idbStore = createStore(getDbName(), storeName)
          } catch {
            // If recreation itself throws, leave the store as-is; a later real read
            // will surface and handle the failure through its own error path.
          }
        }
      }
    },
  }

  persisters.set(persisterId, persister)

  startPeriodicCleanup()

  return persister
}

export async function clearIndexedDBPersisterData() {
  if (!isIndexedDbAvailable()) {
    return
  }

  try {
    const databases = await globalThis.indexedDB?.databases?.()
    if (!databases) return

    const clearPromises = databases
      .filter(db => db.name?.startsWith(DBNAME_PREFIX))
      .map(async db => {
        if (!db.name) return

        try {
          const openRequest = globalThis.indexedDB.open(db.name, db.version)
          const database = await new Promise<IDBDatabase>((resolve, reject) => {
            openRequest.onsuccess = () => resolve(openRequest.result)
            openRequest.onerror = () => reject(openRequest.error)
            openRequest.onupgradeneeded = () => {
              openRequest.transaction?.abort()
              reject(new Error('Unexpected upgrade needed'))
            }
          })

          const storeNames = Array.from(database.objectStoreNames)
          database.close()

          const storeClearPromises = storeNames.map(async storeName => {
            if (!db.name) return
            try {
              const store = createStore(db.name, storeName)
              await clear(store)
            } catch (error) {
              // Handle fatal errors (like SecurityError) gracefully
              if (isFatalIndexedDbError(error)) {
                return
              }
            }
          })

          await Promise.all(storeClearPromises)
        } catch (error) {
          if (isFatalIndexedDbError(error)) {
            return
          }
        }
      })

    await Promise.allSettled(clearPromises)
  } catch {
    // no-op
  }
}
