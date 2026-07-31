import type {RouteObject} from '@github-ui/react-router'

import type {EmbeddedData} from '../embedded-data-types'
import {getReactDataRouterApp} from './data-router-app-registry'

export async function wrapWithAppShell(routes: RouteObject[], embeddedData: EmbeddedData): Promise<RouteObject[]> {
  const app = await getReactDataRouterApp('app-shell')
  const {routes: appShellRoutes} = app.registration({embeddedData})

  if (appShellRoutes.length !== 1) {
    throw new Error('Expected app shell routes to have a single entry')
  }
  const [appShellRouteObject] = appShellRoutes
  const wrappedRoutes: RouteObject[] = [{...appShellRouteObject, children: routes, index: false}]
  return wrappedRoutes
}
