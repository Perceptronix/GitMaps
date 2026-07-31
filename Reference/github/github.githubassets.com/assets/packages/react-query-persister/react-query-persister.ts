import type {SendAnalyticsEventFunction} from '@github-ui/use-analytics'

import {createQueryPersister} from './create-query-persister'
import {createSafeIndexedDbPersister, type DataValidator, type Validator} from '@github-ui/safe-indexed-db-storage'
import type {PersistedQuery, Persister} from './types'
import type {
  Query,
  QueryFunction,
  QueryFunctionContext,
  QueryKey,
  queryOptions,
  QueryState,
} from '@tanstack/react-query'
import {IS_SERVER} from '@github-ui/ssr-utils'
import {schemaHash, type DescMessage} from '@github-ui/dotcom-schema/protobuf'
import {createProtoValidator} from './protobuf/validator'
import {isFeatureEnabled} from '@github-ui/feature-flags'
import type {JSFeatureFlag} from '@github-ui/feature-flags/client-feature-flags'

/**
 * The default TanStack persister type, extracted from `queryOptions` so we
 * don't have to import it from `@tanstack/react-query` directly (it isn't
 * re-exported from the top-level entry).
 */
export type TanstackPersister = NonNullable<Parameters<typeof queryOptions>[0]['persister']>

export type RoutePersister = TanstackPersister | RoutePersisterConfig

export type RoutePersisterConfig = {
  prefix?: string
  maxAgeMs?: number
  alwaysRefetch?: boolean
  enabled?: boolean
  /**
   * Optional validator for the actual cached data values (not just its shape).
   * Its `isValid` predicate runs after the structural shape validator passes;
   * returning `false` evicts the entry and reports a `DATA_INVALID` event,
   * forcing a fresh fetch. `name` must be a stable string (see {@link DataValidator}).
   */
  dataValidator?: DataValidator
  flag?: JSFeatureFlag
}

export type PersisterProps = RoutePersisterConfig & {
  validator: Validator
  sendAnalyticsEvent: SendAnalyticsEventFunction
}

const THREE_DAYS = 1000 * 60 * 60 * 24 * 3

export function isPersisterConfig(persister: RoutePersister | undefined): persister is RoutePersisterConfig {
  return typeof persister === 'object'
}

/**
 * Test-only override for whether query persistence may be enabled. `undefined`
 * means "no override" — the test-environment default (below) and each call's own
 * `enabled` option decide. When set, it gates persistence for the test but still
 * honors each call's own `enabled` option, so an opted-in file can exercise both
 * the enabled and disabled paths (e.g. a feature-flag-gated `enabled: false`).
 *
 * Set this via `enableQueryPersistence()` from
 * `@github-ui/react-query-persister/test-utils` so persistence-focused tests can
 * opt back in without mocking this module.
 */
let testPersistenceEnabledOverride: boolean | undefined

/** @internal Test seam — prefer `enableQueryPersistence()` from `./test-utils`. */
export function setPersistenceEnabledForTests(enabled: boolean | undefined): void {
  testPersistenceEnabledOverride = enabled
}

/**
 * In the test environment, the shared test bootstrap (`@github-ui/tests`) sets
 * this global so query persistence is OFF by default: real IndexedDB persistence
 * leaks state across tests/runs and performs async work that races the harness.
 * Tests that exercise persistence opt back in via `enableQueryPersistence()`.
 *
 * The global is never set in production, so this is a no-op outside tests.
 */
function isPersistenceDisabledByTestDefault(): boolean {
  return (
    typeof globalThis !== 'undefined' &&
    (globalThis as {__GITHUB_UI_TEST_QUERY_PERSISTENCE_DISABLED__?: boolean})
      .__GITHUB_UI_TEST_QUERY_PERSISTENCE_DISABLED__ === true
  )
}

// `query` is accepted (and ignored) so callers may invoke it with or without
// the trailing argument, matching how TanStack invokes a persister.
export async function noOpPersister<T, TQueryKey extends QueryKey = QueryKey, TPageParam = never>(
  queryFn: QueryFunction<T, TQueryKey, TPageParam>,
  context: QueryFunctionContext<TQueryKey>,
  _query?: Query,
): Promise<T> {
  // `context` is the base context; `queryFn` may expect the page-param-aware
  // context for infinite queries. We forward it unchanged.
  return await queryFn(context as QueryFunctionContext<TQueryKey, TPageParam>)
}

export const createPersister = ({
  validator,
  sendAnalyticsEvent,
  prefix = 'key',
  maxAgeMs = THREE_DAYS,
  alwaysRefetch = true,
  enabled = true,
  dataValidator,
  flag,
}: PersisterProps): Persister => {
  const effectiveEnabled =
    testPersistenceEnabledOverride !== undefined
      ? testPersistenceEnabledOverride && enabled
      : isPersistenceDisabledByTestDefault()
        ? false
        : enabled
  if (IS_SERVER || !effectiveEnabled) return noOpPersister

  const storage = createSafeIndexedDbPersister<QueryState, PersistedQuery>({
    validator,
    sendAnalyticsEvent,
    dataValidator,
  })

  // Pre-open the IndexedDB connection at boot so the first real query read
  // doesn't pay the one-time DB-open cost on the critical path. Mirrors the
  // Relay path in `@github-ui/relay-query-cache`, which covers pages that go
  // through `createCache()`; this covers the TanStack-only pages that never do.
  // Fired eagerly rather than on requestIdleCallback: opening the connection is
  // cheap on the main thread (the actual I/O is async/off-thread), and deferring
  // to idle risks the first query's read firing first — turning warmup into a
  // no-op in exactly the busy-boot tail case it's meant to cover. `warmup()` is
  // idempotent (guarded by the persister singleton), so the per-route
  // createPersister calls only open once. Flagged for independent rollout.
  if (isFeatureEnabled('offline_cache_preheat_on_boot')) {
    void storage.warmup()
  }

  const persist = createQueryPersister({
    storage,
    sendAnalyticsEvent,
    prefix,
    maxAgeMs,
    // always refetch when loading, or refetch with data is stale
    refetchOnRestore: alwaysRefetch ? 'always' : true,
    flag,
  })

  return persist.persisterFn
}

type ProtoPersisterProps = Omit<PersisterProps, 'validator'> & {schema: DescMessage}

export function createProtoPersister({schema, prefix, ...rest}: ProtoPersisterProps) {
  try {
    // Both of these resolve the schema's hash, which throws if the schema's
    // generated module was never imported (so its hash was never registered).
    const fingerprint = schemaHash(schema)
    const validator = createProtoValidator(schema)
    return createPersister({
      ...rest,
      validator,
      prefix: `${prefix ?? 'proto'}::${fingerprint}`,
    })
  } catch (error) {
    // Fail soft: a missing hash only means we can't safely version the cache
    // for this query, so skip persistence rather than breaking the render
    // (this runs synchronously during render, and on the server). Re-throw
    // asynchronously so the error reporter still surfaces it without blocking.
    setTimeout(() => {
      throw error
    })
    return noOpPersister
  }
}
