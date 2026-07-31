import type {
  AdaptedTanStackRouteOptions,
  AugmentedTanStackRouteOptions,
  GetRouteOptions,
  ReactRouterRouteObject,
  TanStackRouteOptions,
} from './types'

// Overloaded return type with custom options when getRouteOptions is provided
export function buildTanStackRouteOptions<
  THandle extends object = {},
  TCustomOptions extends TanStackRouteOptions = TanStackRouteOptions,
>(
  routeObj: ReactRouterRouteObject<THandle>,
  getRouteOptions: GetRouteOptions<THandle, TCustomOptions>,
): AugmentedTanStackRouteOptions<THandle, TCustomOptions>
// Overloaded return type when getRouteOptions is potentially undefined
export function buildTanStackRouteOptions<
  THandle extends object = {},
  TCustomOptions extends TanStackRouteOptions = TanStackRouteOptions,
>(
  routeObj: ReactRouterRouteObject<THandle>,
  getRouteOptions?: GetRouteOptions<THandle, TCustomOptions>,
): AdaptedTanStackRouteOptions<THandle> | AugmentedTanStackRouteOptions<THandle, TCustomOptions>
/**
 * Converts a React Router `RouteObject` into the options object passed to TanStack Router's
 * `createRoute` or `createFileRoute`.
 *
 * The adapter auto-converts these TanStack route properties from the React Router route:
 *
 * - `shouldReload`: derived via `shouldReloadAdapter(...)`.
 * - `staticData`: initialized with `{...routeObj.handle, dataRouterId: routeObj.id}`.
 *
 * When `getRouteOptions` is provided, its return value is merged on top of the adapter-generated
 * options. `staticData` is augmented rather than replaced: `staticData` shallow-merges
 * onto `routeObj.handle`. Other overlapping properties override the adapter
 * value.
 *
 * The return type always guarantees non-null `staticData` as it is augmented
 * by the adapter with `{dataRouterId}` and `routeObj.handle`.
 */
export function buildTanStackRouteOptions<
  THandle extends object = {},
  TCustomOptions extends TanStackRouteOptions = TanStackRouteOptions,
>(
  routeObj: ReactRouterRouteObject<THandle>,
  getRouteOptions?: GetRouteOptions<THandle, TCustomOptions>,
): AdaptedTanStackRouteOptions<THandle> | AugmentedTanStackRouteOptions<THandle, TCustomOptions> {
  const customOptions = getRouteOptions ? getRouteOptions(routeObj) : ({} as TCustomOptions)

  const adapterOptions: AdaptedTanStackRouteOptions<THandle> = {
    shouldReload: shouldReloadAdapter(routeObj, customOptions),
    staticData: {
      ...(routeObj.handle ?? ({} as THandle)),
      dataRouterId: routeObj.id,
    },
  }
  if (getRouteOptions) {
    // Merge consumer-provided route options with adapter-generated options.
    const {staticData: customStaticData, ...otherCustomOptions} = customOptions
    return {
      ...adapterOptions,
      ...(customStaticData ? {staticData: {...adapterOptions.staticData, ...customStaticData}} : {}),
      ...otherCustomOptions,
    }
  }

  return adapterOptions
}

/**
 * Passes through the consumer-provided TanStack Router `shouldReload` option.
 * `shouldReload` is optional unless the source React Router route defines
 * `shouldRevalidate`, in which case this adapter throws unless an explicit
 * `shouldReload` adapter is provided.
 *
 * React Router's `shouldRevalidate` receives a richer set of navigation and
 * submission details than TanStack Router's `shouldReload`, so there is no
 * safe generic adapter between the two. Routes that define
 * `routeObj.shouldRevalidate` must therefore provide an explicit
 * `shouldReload` option via the `getRouteOptions` callback.
 *
 * See:
 * https://tanstack.com/router/latest/docs/framework/react/api/router/RouteOptionsType#shouldreload-property
 */
function shouldReloadAdapter(
  routeObj: ReactRouterRouteObject,
  customOptions: TanStackRouteOptions,
): TanStackRouteOptions['shouldReload'] {
  if (routeObj.shouldRevalidate && !('shouldReload' in customOptions)) {
    throw new Error(
      `Route with id "${routeObj.id}" has a shouldRevalidate function but no shouldReload option. ` +
        `React Router's shouldRevalidate cannot be automatically adapted for TanStack. ` +
        `Please configure shouldReload for this route.`,
    )
  }
  return customOptions['shouldReload']
}
