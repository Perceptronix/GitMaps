import {controller} from '@github/catalyst'
import {generateAppId, registerAppId} from '@github-ui/app-uuid'
import {create} from '@github-ui/dotcom-schema/protobuf'
import {SafeHtmlSchema} from '@github-ui/dotcom-schema/types/common/v1/safe_html'
import {currentState, updateCurrentState} from '@github-ui/history'
import {getQueryClient} from '@github-ui/query-client'
import {
  type AnyTanStackRouter,
  createBrowserRouter,
  type RouteObject,
  RouterProvider,
  type RouterProviderProps,
  TanStackRouterProvider,
} from '@github-ui/react-router'
import type {QueryClient} from '@tanstack/react-query'

import type {NavigatorRouteRegistration} from './app-routing-types'
import {createBrowserHistory, type GitHubBrowserHistory} from './create-browser-history'
import type {EmbeddedData} from './embedded-data-types'
import {wrapRouterNavigateForTurboAndSoftNavs} from './future/apply-router-navigate-override'
import type {DataRouterAppRegistrationObject} from './future/data-router-app-registry'
import {getReactDataRouterApp, isTanStackRouterEnabled} from './future/data-router-app-registry'
import {routesWithProviders, tanStackRouterWithProviders} from './future/RoutesWithProviders'
import {wrapWithAppShell} from './future/wrap-with-app-shell'
import {getReactNavigatorApp, type NavigatorAppRegistrationFn} from './navigator-app-registry'
import {NavigatorClientEntry} from './NavigatorClientEntry'
import {preloadMatchedDataRouterComponents, preloadMatchedRouteComponents} from './preload-matched-route-components'
import {AppProfiler, ProfilerProvider} from './ProfilerContext'
import {ReactBaseElement} from './ReactBaseElement'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'react-app': React.DetailedHTMLProps<React.HTMLAttributes<ReactAppElement>, ReactAppElement>
    }
  }
}

export type RouterContext = {queryClient: QueryClient; embeddedData: EmbeddedData}
export type RouterOrHistory = RouterProviderProps['router'] | GitHubBrowserHistory | AnyTanStackRouter

// TanStack Router instances have history.destroy(); React Router instances have dispose()
export function isTanStackRouter(routerOrHistory: RouterOrHistory): routerOrHistory is AnyTanStackRouter {
  const history = 'history' in routerOrHistory ? routerOrHistory.history : null
  return typeof history?.destroy === 'function' && !('dispose' in routerOrHistory)
}

// Copied from React Router
const createKey = () => Math.random().toString(36).substr(2, 8)

// What is this silliness? Is it react or a web component?!
// It's a web component we use to bootstrap react apps within the monolith.
@controller('react-app')
export class ReactAppElement extends ReactBaseElement<EmbeddedData> {
  nameAttribute = 'app-name'
  declare uuid: string
  declare routerOrHistory: RouterOrHistory
  appRoutes: NavigatorRouteRegistration[] = []

  get enabledFeatures() {
    if (!this.embeddedDataJSON) return []
    const features = this.embeddedDataJSON.appPayload?.enabled_features || {}
    return Object.keys(features).filter(key => features[key as keyof typeof features])
  }

  get routes() {
    if ((this.appRoutes ?? []).length > 0) {
      return this.appRoutes
    }

    return (this.routerOrHistory as RouterProviderProps['router'])?.routes ?? []
  }

  get navigate() {
    if ('push' in this.routerOrHistory) {
      return this.routerOrHistory.push
    }

    if ('navigate' in this.routerOrHistory) {
      return this.routerOrHistory.navigate
    }
  }

  override connectedCallback() {
    super.connectedCallback()
    this.uuid = generateAppId()
    registerAppId(this.uuid)

    window.addEventListener('popstate', this.popStateListener, true)
  }

  popStateListener = (e: PopStateEvent) => {
    // not having a new state means it's a hash navigation
    if (e.state && this.uuid !== currentState().appId) this.#disposeRouter()
  }

  override disconnectedCallback() {
    window.removeEventListener('popstate', this.popStateListener, true)
    this.#disposeRouter()
    super.disconnectedCallback()
  }

  /**
   * Disposes the current router or history instance.
   * Handles different cleanup methods for different router types:
   * - React Router: dispose()
   * - Navigator history: dispose()
   * - TanStack Router: history.destroy()
   */
  #disposeRouter() {
    if (!this.routerOrHistory) return

    // TanStack Router uses history.destroy() for cleanup
    if (isTanStackRouter(this.routerOrHistory)) {
      this.routerOrHistory.history.destroy()
    } else if ('dispose' in this.routerOrHistory) {
      // React Router and Navigator history use dispose()
      this.routerOrHistory.dispose()
    }
  }

  // The component that wraps this React app will know if the app should be rendered with
  // date router (instead of navigator router) and it does this by setting
  // a `data-data-router-enabled="true"` attribute on this `<react-app>` element.
  // Remember we might have two apps called `some-cool-app`, because it started as a navigator app
  // (i.e. jsonRoute) and now also exists a data router app (i.e. queryRoute). At runtime, we might
  // toggle between which to use based on feature flags.
  get isDataRouterEnabled() {
    return this.getAttribute('data-data-router-enabled') === 'true'
  }

  get includeAppShell() {
    return this.getAttribute('data-app-shell') === 'true'
  }

  async getReactNode(embeddedData: EmbeddedData, onError: (error: Error) => void): Promise<React.ReactElement> {
    if (this.isDataRouterEnabled) {
      const app = await getReactDataRouterApp(this.name)
      return this.#getDataRouterNode(embeddedData, onError, app, isTanStackRouterEnabled(app.tanStackRouterEnabled))
    }

    const app = await getReactNavigatorApp(this.name)
    return this.#getNavigatorNode(embeddedData, onError, app.registration)
  }

  async #getDataRouterNode(
    embeddedData: EmbeddedData,
    onError: (error: Error) => void,
    app: DataRouterAppRegistrationObject,
    withTanStackRouter: boolean = false,
  ) {
    if (embeddedData) {
      this.#extractRailsPartials(embeddedData)

      const queryClient = getQueryClient()
      queryClient.removeQueries({queryKey: [this.name]})
    }
    let {routes} = app.registration({
      // when we hydrated the queryClient directly, we don't want to add initialData again
      embeddedData,
    })

    if (this.includeAppShell) {
      routes = await wrapWithAppShell(routes, embeddedData)
    }

    const routerProvider = withTanStackRouter
      ? await this.#createTanStackRouter(embeddedData, routes)
      : await this.#createReactRouter(embeddedData, routes)

    return (
      <ProfilerProvider appName={this.name} isDataRouterEnabled>
        <AppProfiler id={this.name}>{routerProvider}</AppProfiler>
      </ProfilerProvider>
    )
  }

  async #createReactRouter(embeddedData: EmbeddedData, routes: RouteObject[]) {
    this.routerOrHistory = wrapRouterNavigateForTurboAndSoftNavs(
      createBrowserRouter(
        routesWithProviders(routes, {
          appPayload: embeddedData.appPayload,
          ssrError: this.ssrError,
          appName: this.name,
          dataRouterEnabled: true,
        }),
      ),
    )

    await preloadMatchedDataRouterComponents(this.routerOrHistory.routes, this.routerOrHistory.state.location.pathname)

    return <RouterProvider router={this.routerOrHistory} />
  }

  async #createTanStackRouter(embeddedData: EmbeddedData, routes: RouteObject[]) {
    const queryClient = getQueryClient()
    const router = tanStackRouterWithProviders(routes, {
      appPayload: embeddedData.appPayload,
      ssrError: this.ssrError,
      appName: this.name,
      context: {embeddedData, queryClient},
    })
    this.routerOrHistory = router
    // Pre-resolve matched route data/code before first render to prevent suspense flash,
    // similar to preloadMatchedDataRouterComponents for React Router path.
    await router.load()
    if (this.hasSSRContent) {
      // SSR markup only needs the post-hydration router flag here.
      // router.load() has already populated the matched route data from embedded data,
      // so a truthy router.ssr is enough for the first client render to match the SSR output.
      router.ssr = {manifest: undefined}
    }
    return <TanStackRouterProvider router={router} />
  }

  async #getNavigatorNode(
    embeddedData: EmbeddedData,
    onError: (error: Error) => void,
    registration: NavigatorAppRegistrationFn,
  ) {
    const {App, routes} = registration()
    const initialPath = this.getAttribute('initial-path') as string

    if (this.isLazy) {
      const request = await fetch(initialPath, {
        mode: 'no-cors',
        cache: 'no-cache',
        credentials: 'include',
      })
      const {payload} = await request.json()

      embeddedData.payload = payload
    }

    const window = globalThis.window as Window | undefined

    // Initial path is set by ruby. Anchors are not sent to the server.
    // Therefore anchors must be set explicitly by the client.
    const {pathname, search, hash} = new URL(
      `${initialPath}${window?.location.hash ?? ''}`,
      window?.location.href ?? 'https://github.com',
    )

    // set the `key` property to avoid using `default` as the initial location's `key`.
    updateCurrentState({key: createKey()})

    const history = createBrowserHistory({window})
    this.routerOrHistory = history
    this.appRoutes = routes
    const {key, state} = history.location
    const initialLocation = {
      pathname,
      search,
      hash,
      key,
      state,
    }

    // need to await/preload to avoid suspense flash on initial render
    await preloadMatchedRouteComponents(routes, initialLocation)

    return (
      <ProfilerProvider appName={this.name} isDataRouterEnabled={false}>
        <AppProfiler id={this.name}>
          <NavigatorClientEntry
            appName={this.name}
            initialLocation={initialLocation}
            history={history}
            embeddedData={embeddedData}
            routes={routes}
            App={App}
            ssrError={this.ssrError}
            onError={onError}
          />
        </AppProfiler>
      </ProfilerProvider>
    )
  }

  #extractRailsPartials(embeddedData: EmbeddedData) {
    if (!embeddedData.payload) return

    const embeddedRailsPartials = this.querySelectorAll('rails-partial')

    for (const railsPartial of embeddedRailsPartials) {
      const name = railsPartial.getAttribute('data-partial-name')

      if (!name) continue

      const payload = embeddedData.payload as Record<string, unknown>

      payload[name] = create(SafeHtmlSchema, {value: railsPartial.innerHTML})
    }
  }

  get isLazy() {
    return this.getAttribute('data-lazy') === 'true'
  }
}
