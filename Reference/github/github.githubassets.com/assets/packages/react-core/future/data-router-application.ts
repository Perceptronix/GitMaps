import {fromJson, type GenMessage, type Message} from '@github-ui/dotcom-schema/protobuf'
import {sendEvent} from '@github-ui/hydro-analytics'
import {
  createProtoPersister,
  isPersisterConfig,
  type RoutePersister,
  type RoutePersisterConfig,
  type TanstackPersister,
} from '@github-ui/react-query-persister'
import type {RouteObject, ShouldRevalidateFunction} from '@github-ui/react-router'

import type {AppRegistration} from '../app-routing-types'
import type {EmbeddedData} from '../embedded-data-types'
import {
  DECODE_EMBEDDED_PROTO,
  type QueryDepsFn,
  type QueryFnRouteQueryConfig,
  type QueryRouteQueryConfigGenerator,
  type QueryRouteQueryType,
  type SchemaRouteQueryConfig,
} from './data-router-types'
import {queryFnFetch} from './query-fn-fetch'
import {QueryRoute, type QueryRouteTanStackOptions} from './query-route'

export type GetRoutesFunction = (args: {isEnabled: (featureName: string) => boolean | undefined}) => RouteObject[]

export interface DataRouterApplicationOptions {
  tanStackRouterEnabled?: boolean | (() => boolean)
}

export interface DataRouterApplicationBuilderOptions {
  /**
   * Resolves the app name embedded in this app's query keys. Defaults to the
   * builder's static `name`.
   *
   * Provide this when the app's routes can be registered under an umbrella app
   * (e.g. `code-view` routes registered under the `repo` app, selected by a
   * feature flag) so the query keys match whichever app is actually handling
   * the request. It is only consulted when a query key is built (runtime),
   * never at module load, so it may safely read per-request state such as
   * feature flags — unlike `name`, which must stay module-load safe because it
   * is read during app registration (including in SSR, where reading client env
   * at module load is not allowed).
   */
  queryKeyAppName?: () => string
}

interface DataRouterAppRegistration extends AppRegistration {
  App?: never
  routes: RouteObject[]
}

export class DataRouterApplication<T extends string> {
  readonly name: T
  readonly tanStackRouterEnabled: boolean | (() => boolean)
  #routesOrGetRoutes: RouteObject[] | GetRoutesFunction
  embeddedData?: EmbeddedData

  constructor(
    name: T,
    routesOrGetRoutes: RouteObject[] | GetRoutesFunction,
    options: DataRouterApplicationOptions = {},
  ) {
    this.name = name
    this.tanStackRouterEnabled = options.tanStackRouterEnabled ?? false
    this.#routesOrGetRoutes = routesOrGetRoutes
    this.registration = this.registration.bind(this)
  }

  registration(opts?: {embeddedData?: EmbeddedData}): DataRouterAppRegistration {
    this.embeddedData = opts?.embeddedData
    const routes = this.#getRoutes()
    return {
      routes,
    }
  }

  #getRoutes() {
    if (typeof this.#routesOrGetRoutes === 'function') {
      const isEnabled = (featureName: string) => {
        const enabledFeatures = this.embeddedData?.appPayload?.enabled_features as Record<string, boolean> | undefined
        if (!enabledFeatures || !(featureName in enabledFeatures)) {
          return undefined
        }
        return enabledFeatures[featureName]
      }
      return this.#routesOrGetRoutes({isEnabled})
    }
    return this.#routesOrGetRoutes
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyQueryConfigGenerator = QueryRouteQueryConfigGenerator<any, any, any, any, any, any, any>

/**
 * A query config constraint that mirrors the discriminated
 * {@link QueryRouteQueryConfig} union at the call site so misconfigurations
 * surface as compile-time errors instead of runtime throws:
 *
 *   1. Neither `queryFn` nor `schema` is provided (both object branches
 *      require one of them).
 *   2. Both `queryFn` and `schema` are provided (each branch marks the
 *      opposite field `?: never`).
 *   3. A {@link RoutePersisterConfig} object is supplied without a `schema`
 *      (the queryFn branch only accepts a `TanstackPersister` function).
 *
 * The `[key: string]: any` index signature keeps the constraint loose enough
 * to accept the looser signatures used by helpers like `mainQuery` and
 * `railsPartialQuery` (e.g. `queryFn` accepting a non-`SerializableQueryDeps`
 * deps shape), while still forcing the discriminating fields to match.
 *
 * `RoutePath` flows through so `queryDeps` is contextually typed.
 */
type QueryConfigConstraintObject<RoutePath extends string> =
  | {
      queryName: string
      queryDeps?: QueryDepsFn<RoutePath>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryFn: (...args: any[]) => any
      schema?: never
      persister?: TanstackPersister
      type?: QueryRouteQueryType
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any
    }
  | {
      queryName: string
      queryDeps?: QueryDepsFn<RoutePath>
      queryFn?: never
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      schema: GenMessage<any & Message>
      persister?: RoutePersister
      type?: QueryRouteQueryType
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any
    }

type QueryConfigConstraint<RoutePath extends string> =
  | QueryConfigConstraintObject<RoutePath>
  | ((routeId: string) => QueryConfigConstraintObject<RoutePath>)

type ResolveLiteralConfig<T> = T extends (...args: never) => infer R ? R : T

type ExtractQueryConfig<T, AppName extends string, RouteId extends string, RoutePath extends string> =
  T extends QueryRouteQueryConfigGenerator<
    AppName,
    string,
    RoutePath,
    infer QueryName extends string,
    // `| undefined` is required because `queryDeps` is optional in `QueryRouteQueryConfig`
    infer QueryDeps extends QueryDepsFn<RoutePath> | undefined,
    infer QueryRes,
    infer QueryType extends QueryRouteQueryType
  >
    ? {
        // Branch on whether the literal carries a schema so `QueryConfigData`
        // sees a single discriminated union member (not the full union, which
        // would conflate the QueryFn and Schema data types).
        // Intersect with the literal's own `select` so its narrowed return type
        // survives the rewrap; `QueryConfigData` then infers the post-`select`
        // data type for consumers.
        [K in QueryName]: (ResolveLiteralConfig<T> extends {schema: infer Sch}
          ? Omit<SchemaRouteQueryConfig<RoutePath, QueryName, QueryDeps, QueryRes, QueryType>, 'schema'> & {
              schema: Sch
            }
          : QueryFnRouteQueryConfig<AppName, RouteId, RoutePath, QueryName, QueryDeps, QueryRes, QueryType>) &
          (ResolveLiteralConfig<T> extends {select: infer Sel}
            ? Sel extends (data: never) => infer S
              ? {__userSelectResult: S}
              : unknown
            : unknown)
      }
    : never

type MergeQueryConfigs<
  Queries extends readonly AnyQueryConfigGenerator[],
  AppName extends string,
  RouteId extends string,
  RoutePath extends string,
> = Queries extends readonly [infer First, ...infer Rest extends AnyQueryConfigGenerator[]]
  ? ExtractQueryConfig<First, AppName, RouteId, RoutePath> & MergeQueryConfigs<Rest, AppName, RouteId, RoutePath>
  : {}

// NOTE: if this classname changes from `DataRouterApplicationBuilder`, also update the react-app-name ESLint rule
// /packages/eslint-plugin-github-monorepo/rules/react-app-name.js
export class DataRouterApplicationBuilder<T extends string> {
  // NOTE: if this method name changes from `create`, also update the react-app-name ESLint rule
  // /packages/eslint-plugin-github-monorepo/rules/react-app-name.js
  static create<T extends string>(name: T, options?: DataRouterApplicationBuilderOptions) {
    return new DataRouterApplicationBuilder<T>(name, options)
  }

  readonly name: T
  readonly #resolveAppName?: () => string
  #app?: DataRouterApplication<T>

  private constructor(name: T, options?: DataRouterApplicationBuilderOptions) {
    this.name = name
    this.#resolveAppName = options?.queryKeyAppName
  }

  getEmbeddedData = () => {
    if (!this.#app) {
      throw new Error('getEmbeddedData should only be called after createDataRouterAppFromRoutes')
    }
    return this.#app.embeddedData
  }

  createDataRouterAppFromRoutes(routes: RouteObject[] | GetRoutesFunction, options?: DataRouterApplicationOptions) {
    this.#app = new DataRouterApplication(this.name, routes, options)
    return this.#app
  }

  // #region createQueryRouteConfig

  /**
   * Creates a query route config with a variadic list of queries.
   * Each query's name, deps, response type, and query type are inferred from the provided config.
   * The returned QueryRoute merges all query configs into a single keyed record type.
   */
  createQueryRouteConfig<
    RouteId extends string,
    RoutePath extends string,
    const Queries extends ReadonlyArray<QueryConfigConstraint<RoutePath>>,
    TanStackValidateSearch extends QueryRouteTanStackOptions['validateSearch'] = never,
  >(
    /** RouteId must be a valid JavaScript camelCase Identifier */
    id: RouteId,
    {
      path,
      index,
      queries,
      shouldRevalidate,
      tanStackRouterOptions,
    }: {
      path: RoutePath
      index?: boolean
      queries?: [...Queries]
      shouldRevalidate?: ShouldRevalidateFunction
      /**
       * Optional TanStack Router route options merged into the generated route.
       *
       * By default, the adapter layer automatically derives the following from the
       * query route config returned by `QueryRoute#toRoute()`:
       * - `loader`: adapted from `loader`.
       * - `component`: adapted from `Component` or `element`.
       * - `errorComponent`: adapted from `ErrorBoundary` or `errorElement`.
       * - `staticData`: initialized to return `{...handle, dataRouterId: id}`.
       * - `ssr`: derived from the route component.
       * - `loaderDeps`: derived from the route's `queryDeps`.
       *
       * Use `tanStackRouterOptions` to augment that generated route-options object with
       * supported TanStack Router fields such as `beforeLoad`, `shouldReload`, and `staticData`.
       * `staticData` augment the default generated value, while
       * other overlapping fields override the adapter value.
       */
      tanStackRouterOptions?: QueryRouteTanStackOptions<RoutePath, TanStackValidateSearch>
    },
  ): QueryRoute<
    string,
    RouteId,
    RoutePath,
    MergeQueryConfigs<Queries, string, RouteId, RoutePath>,
    TanStackValidateSearch
  > {
    const resolvedQueries = (queries ?? []) as AnyQueryConfigGenerator[]
    assertCamelCase(id)

    return new QueryRoute({
      appName: this.name,
      getAppName: this.#resolveAppName,
      id,
      path,
      queries: toKeyedQueries(resolvedQueries, id),
      index: index ?? false,
      getEmbeddedData: this.getEmbeddedData,
      shouldRevalidate,
      tanStackRouterOptions,
    })
  }

  // #endregion createQueryRouteConfig
}

class DuplicateRouteQueryNameError extends Error {
  constructor(queryName: string) {
    super(`query names cannot be duplicated: \`${queryName}\` has already been defined for this route.`)
    this.name = 'DuplicateRouteQueryNameError'
  }
}

function toKeyedQueries(queries: AnyQueryConfigGenerator[], id: string) {
  const registeredQueryNames = new Set<string>()

  return Object.fromEntries(
    queries.map(configOrGenerator => {
      let query

      if (typeof configOrGenerator === 'function') {
        query = configOrGenerator(id)
      } else {
        query = configOrGenerator
      }

      const {queryName, ...config} = query

      if (registeredQueryNames.has(queryName)) {
        throw new DuplicateRouteQueryNameError(queryName)
      }
      registeredQueryNames.add(queryName)

      const {schema, persister: persisterConfig} = config

      if (!config.queryFn && !schema) {
        throw new Error(`Route query "${queryName}" must define either \`queryFn\` or \`schema\`.`)
      }

      if (schema && config.queryFn) {
        throw new Error(`Route query "${queryName}" cannot define both \`schema\` and \`queryFn\`.`)
      }

      if (!schema && isPersisterConfig(persisterConfig)) {
        throw new Error(`Route query "${queryName}" cannot define a persister config without a schema.`)
      }

      if (schema) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queryFn = async (queryKey: any) => queryFnFetch(queryKey, {schema})
        let persister = persisterConfig

        if (isPersisterConfig(persisterConfig)) {
          persister = createProtoPersister({
            ...persisterConfig,
            schema,
            sendAnalyticsEvent: (eventType, target?, payload = {}) => {
              sendEvent(eventType, {queryName, routeId: id, ...payload, target})
            },
          })
        }

        return [
          queryName,
          {
            ...config,
            queryFn,
            persister,
            // Decode first-paint embedded proto3-JSON for keys the backend flags
            // in `meta.protoRoutes`, matching the fetch queryFn's decode.
            [DECODE_EMBEDDED_PROTO]: (raw: unknown, routeId: string) => fromJson({schema, raw, routeId, queryName}),
          },
        ] as const
      }

      return [queryName, config] as const
    }),
  )
}

function assertCamelCase(str: string) {
  // Regular expression to validate camel case
  const camelCasePattern = /^[a-z][a-zA-Z0-9]*$/
  if (!camelCasePattern.test(str)) throw new InvalidIdentifierError(str)
}

export class InvalidIdentifierError extends Error {
  constructor(str: string) {
    super(`\`${str}\` must be camel cased`)
    this.name = 'InvalidIdentifierError'
  }
}
