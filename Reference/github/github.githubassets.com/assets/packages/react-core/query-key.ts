import type {SerializableQueryDeps} from './future/data-router-types'

interface RouteQueryKeyObject<
  AppName extends string = string,
  RouteId extends string = string,
  RoutePath extends string = string,
  QueryName extends string = string,
  QueryDeps extends SerializableQueryDeps = SerializableQueryDeps,
> {
  appName: AppName
  routeId: RouteId
  routePath: RoutePath
  queryName: QueryName
  queryDeps: QueryDeps
}

// Since the queryDeps object is optional, we exclude it from the QueryKey type if it is not provided or mark as non-nullable otherwise.
export type RouteQueryKey = [
  AppName: RouteQueryKeyObject['appName'],
  RouteId: RouteQueryKeyObject['routeId'],
  RoutePath: RouteQueryKeyObject['routePath'],
  QueryName: RouteQueryKeyObject['queryName'],
  QueryDeps: RouteQueryKeyObject['queryDeps'],
]

/**
 * Generates an app-unique react-query query key based on the data provided.
 * This is used to interact with the query client that powers queryRoute.
 * @param appName Name of the app that the query is for. This is the top level name of the react app.
 * @param routeId The unique identifier for the route that the current router matched.
 * @param path The path that the router matched. This is the path match pattern (ie `/path/:id`), not the path that was generated for the route (ie `/path/123`).
 * @param queryName The key of the QueryConfig in the route.queries object in the query route registration.
 * @param queryDeps An object that uniquely identifies a query's fetch function. In a `QueryRoute`'s `QueryConfig`, this is the return value from `queryDeps`.
 * @returns A unique query key that can be used to interact with the query client. In the form of [appName, path, queryName, queryDeps?].
 */
export function makeQueryKey({appName, routeId, routePath, queryName, queryDeps}: RouteQueryKeyObject): RouteQueryKey {
  return [appName, routeId, routePath, queryName, queryDeps] as const
}

/**
 * Converts a RouteQueryKey array into an object with named properties.
 * This is used to provide type safety to the queryFn of a QueryRoute's QueryConfig.
 * @param queryKey The query key to convert. This is in the form of [appName, path, queryName, queryDeps?].
 * @returns An object with named properties for each part of the query key.
 */
export function queryKeyObjFromKey<
  AppName extends string,
  RouteId extends string,
  RoutePath extends string,
  QueryName extends string,
  QueryDeps extends SerializableQueryDeps,
>(queryKey: RouteQueryKey): RouteQueryKeyObject<AppName, RouteId, RoutePath, QueryName, QueryDeps> {
  return {
    appName: queryKey[0] as AppName,
    routeId: queryKey[1] as RouteId,
    routePath: queryKey[2] as RoutePath,
    queryName: queryKey[3] as QueryName,
    queryDeps: queryKey[4] as QueryDeps,
  } as const
}
