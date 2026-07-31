import {useQuery, type UseQueryOptions, type UseQueryResult} from '@github-ui/react-query'
import {useRuntimeEnvironment} from '@github-ui/ssr-utils/use-runtime-environment'

/**
 * Suppressible queries should not render data on the server render pass.
 */
function useShouldSuppressDuringSSR(suppressDuringSSR: boolean): boolean {
  const {isServer} = useRuntimeEnvironment()

  // useRuntimeEnvironment() uses useSyncExternalStore(getSnapshot, getServerSnapshot),
  // so isServer is true during SSR and on the hydration render pass before React
  // switches to the browser snapshot. We suppress data for that whole window to
  // avoid rendering server-side data for queries the caller has marked as
  // SSR-suppressible (today, streaming queries registered via the UI Service).
  return suppressDuringSSR && isServer
}

/**
 * Normalizes useQuery result shape for suppressed SSR renders.
 *
 * We construct a self-consistent "pending/loading" state and explicitly
 * clear any success/error-related flags or metadata that may be present
 * on the underlying result.
 */
function toSuppressedQueryResult<TData>(result: UseQueryResult<TData>) {
  return {
    // Preserve structural fields and methods (e.g. refetch, remove, etc.)
    ...result,
    // Hide any data during SSR suppression
    data: undefined,
    // Normalize core state to a coherent "pending & fetching" snapshot
    status: 'pending',
    fetchStatus: 'fetching',
    isPending: true,
    isLoading: true,
    isFetching: true,
    // Clear success/error indicators so cached state doesn't leak through
    isSuccess: false,
    isError: false,
    error: null,
    isFetched: false,
    isFetchedAfterMount: false,
    isRefetching: false,
    // Reset timestamps and failure metadata if present on the result
    dataUpdatedAt: 0,
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
  } as UseQueryResult<TData>
}

/**
 * useQuery-compatible path for queries whose data should be hidden during the
 * SSR / hydration render pass, while preserving regular client behavior
 * after hydration.
 *
 * When `suppressDuringSSR` is false, behaves identically to a plain `useQuery`
 * call.
 */
export function useStreamingCompatibleQuery<TData>(
  options: UseQueryOptions<TData>,
  suppressDuringSSR: boolean,
): UseQueryResult<TData> {
  const shouldSuppress = useShouldSuppressDuringSSR(suppressDuringSSR)
  const result = useQuery(options)

  if (shouldSuppress) {
    return toSuppressedQueryResult(result)
  }

  return result
}
