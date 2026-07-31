import {useRouteLoaderData} from '@github-ui/react-router'

import type {RouteQueryKey} from '../query-key'
import type {AnyQueryRoute, RouteMatchData} from './query-route'

/**
 * Returns the {@link RouteQueryKey} for a named query on the given route, or
 * `undefined` if the route is not currently mounted.
 *
 * This reads directly from the (serializable) loader data emitted by
 * {@link QueryRoute}'s loader. Prefer this over building a `queryConfig`
 * via `useQueriesConfig` when all you need is the key (e.g. for
 * `queryClient.getQueryData(queryKey)` or `invalidateQueries({queryKey})`).
 *
 * Use cases:
 * - Looking up cached data via `queryClient.getQueryData(queryKey)` from a
 *   component that lives above (or beside) the owning route, where calling
 *   `useRouteQuery` isn't appropriate.
 */
export function useRouteQueryKey<Config extends AnyQueryRoute, QueryName extends string & keyof Config['queries']>(
  route: Config,
  queryName: QueryName,
): RouteQueryKey | undefined {
  const data = useRouteLoaderData<RouteMatchData<Config> | undefined>(route.id)
  return data?.queries?.[queryName]?.queryKey
}
