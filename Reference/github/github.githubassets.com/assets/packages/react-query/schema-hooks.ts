import type {DescMessage, MessageShape} from '@github-ui/dotcom-schema/protobuf'
import {useAnalytics} from '@github-ui/use-analytics'
import {
  type DefaultError,
  type DefinedInitialDataInfiniteOptions,
  type DefinedInitialDataOptions,
  type DefinedUseInfiniteQueryResult,
  type DefinedUseQueryResult,
  type InfiniteData,
  type QueryClient,
  type QueryKey,
  type UndefinedInitialDataInfiniteOptions,
  type UndefinedInitialDataOptions,
  useInfiniteQuery as baseUseInfiniteQuery,
  type UseInfiniteQueryOptions,
  type UseInfiniteQueryResult,
  useQuery as baseUseQuery,
  type UseQueryOptions,
  type UseQueryResult,
  useSuspenseInfiniteQuery as baseUseSuspenseInfiniteQuery,
  type UseSuspenseInfiniteQueryOptions,
  type UseSuspenseInfiniteQueryResult,
  useSuspenseQuery as baseUseSuspenseQuery,
  type UseSuspenseQueryOptions,
  type UseSuspenseQueryResult,
} from '@tanstack/react-query'

import {resolvePersister, type RoutePersister, type TanstackPersister} from './schema-persister'

export type {RoutePersister, TanstackPersister} from './schema-persister'
export {isPersisterConfig, resolvePersister} from './schema-persister'

type WithSchema<Options, Desc extends DescMessage> = Omit<Options, 'persister' | 'schema'> & {
  schema: Desc
  persister?: RoutePersister
}

type ResolvableOptions = {
  schema?: DescMessage
  persister?: RoutePersister
}

function useResolvedOptions<T extends ResolvableOptions>(
  options: T,
): Omit<T, 'schema' | 'persister'> & {persister?: TanstackPersister} {
  const {sendAnalyticsEvent} = useAnalytics({optional: true})
  const {schema, persister, ...rest} = options
  return {...rest, persister: resolvePersister({schema, persister, sendAnalyticsEvent})}
}

// We re-declare TanStack's overloads (so the wrapper keeps its exact public
// API) plus a trailing schema-aware overload. The plain overloads set
// `schema?: never`, so a call with a `schema` is rejected by all of them and
// matched against the schema overload. TypeScript reports a failed overloaded
// call against the *last* overload, so its parameter is a `schema`-discriminated
// union: schema calls surface the real `MessageShape<Desc>` mismatch, plain
// calls keep TanStack's native errors instead of a misleading "'schema' does
// not exist".
export function useQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey> & {schema?: never},
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError>
export function useQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UndefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey> & {schema?: never},
  queryClient?: QueryClient,
): UseQueryResult<TData, TError>
export function useQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {schema?: never},
  queryClient?: QueryClient,
): UseQueryResult<TData, TError>
// Schema overload: `data` is derived from the proto message, making the schema
// the source of truth for the response, `queryFn`, and `initialData`. A
// `RoutePersisterConfig` object only type-checks here, alongside a `schema`.
export function useQuery<
  Desc extends DescMessage,
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = MessageShape<Desc>,
  TQueryKey extends QueryKey = QueryKey,
>(
  options:
    | WithSchema<UseQueryOptions<MessageShape<Desc>, TError, TData, TQueryKey>, Desc>
    | (UseQueryOptions<TQueryFnData, TError, TQueryFnData, TQueryKey> & {schema?: never}),
  queryClient?: QueryClient,
): UseQueryResult<TData, TError>
export function useQuery(options: ResolvableOptions, queryClient?: QueryClient) {
  return baseUseQuery(useResolvedOptions(options) as UseQueryOptions, queryClient)
}

// Suspense variants have no `initialData` split (suspense always resolves first,
// so `data` is always defined). Same plain-then-schema overload shape as
// `useQuery`.
export function useSuspenseQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseSuspenseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {schema?: never},
  queryClient?: QueryClient,
): UseSuspenseQueryResult<TData, TError>
export function useSuspenseQuery<
  Desc extends DescMessage,
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = MessageShape<Desc>,
  TQueryKey extends QueryKey = QueryKey,
>(
  options:
    | WithSchema<UseSuspenseQueryOptions<MessageShape<Desc>, TError, TData, TQueryKey>, Desc>
    | (UseSuspenseQueryOptions<TQueryFnData, TError, TQueryFnData, TQueryKey> & {schema?: never}),
  queryClient?: QueryClient,
): UseSuspenseQueryResult<TData, TError>
export function useSuspenseQuery(options: ResolvableOptions, queryClient?: QueryClient) {
  return baseUseSuspenseQuery(useResolvedOptions(options) as UseSuspenseQueryOptions, queryClient)
}

// Infinite variants follow `useQuery`'s overload shape, with an extra
// `TPageParam` generic and data wrapped in `InfiniteData<...>`.
export function useInfiniteQuery<
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: DefinedInitialDataInfiniteOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam> & {
    schema?: never
  },
  queryClient?: QueryClient,
): DefinedUseInfiniteQueryResult<TData, TError>
export function useInfiniteQuery<
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: UndefinedInitialDataInfiniteOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam> & {
    schema?: never
  },
  queryClient?: QueryClient,
): UseInfiniteQueryResult<TData, TError>
export function useInfiniteQuery<
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam> & {schema?: never},
  queryClient?: QueryClient,
): UseInfiniteQueryResult<TData, TError>
export function useInfiniteQuery<
  Desc extends DescMessage,
  TQueryFnData = MessageShape<Desc>,
  TError = DefaultError,
  TData = InfiniteData<MessageShape<Desc>>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options:
    | WithSchema<UseInfiniteQueryOptions<MessageShape<Desc>, TError, TData, TQueryKey, TPageParam>, Desc>
    | (UseInfiniteQueryOptions<TQueryFnData, TError, InfiniteData<TQueryFnData>, TQueryKey, TPageParam> & {
        schema?: never
      }),
  queryClient?: QueryClient,
): UseInfiniteQueryResult<TData, TError>
export function useInfiniteQuery(options: ResolvableOptions, queryClient?: QueryClient) {
  return baseUseInfiniteQuery(useResolvedOptions(options) as UseInfiniteQueryOptions, queryClient)
}

// Suspense + infinite: no initial-data split, with the `TPageParam`/
// `InfiniteData` shape of the infinite hooks.
export function useSuspenseInfiniteQuery<
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: UseSuspenseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam> & {
    schema?: never
  },
  queryClient?: QueryClient,
): UseSuspenseInfiniteQueryResult<TData, TError>
export function useSuspenseInfiniteQuery<
  Desc extends DescMessage,
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = InfiniteData<MessageShape<Desc>>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options:
    | WithSchema<UseSuspenseInfiniteQueryOptions<MessageShape<Desc>, TError, TData, TQueryKey, TPageParam>, Desc>
    | (UseSuspenseInfiniteQueryOptions<TQueryFnData, TError, InfiniteData<TQueryFnData>, TQueryKey, TPageParam> & {
        schema?: never
      }),
  queryClient?: QueryClient,
): UseSuspenseInfiniteQueryResult<TData, TError>
export function useSuspenseInfiniteQuery(options: ResolvableOptions, queryClient?: QueryClient) {
  return baseUseSuspenseInfiniteQuery(useResolvedOptions(options) as UseSuspenseInfiniteQueryOptions, queryClient)
}

// `useQueries` and `useSuspenseQueries` are intentionally not wrapped: their
// native tuple inference can't be preserved through a schema wrapper. They flow
// through unchanged from `@tanstack/react-query` via the re-exports in
// `react-query.ts`.
