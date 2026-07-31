import type {Location, RouteObject} from '@github-ui/react-router'
import {matchRoutes} from '@github-ui/react-router'
import type React from 'react'

import type {ChildRoute, NavigatorRouteRegistration, PreloadableComponent} from './app-routing-types'
import {matchLocation} from './use-navigator'

/**
 * Recursively collect preload promises from route children.
 * Each promise is wrapped with error handling to prevent cascading failures.
 * Components with ssr: false are skipped during SSR preloading.
 */
function collectPreloadPromisesChildren(
  children: Array<{Component?: React.ComponentType; children?: ChildRoute[]}>,
): Array<Promise<unknown>> {
  return children.flatMap(child => {
    const component = child.Component as PreloadableComponent
    const shouldPreload = component?.preload && component.ssr !== false
    return [
      ...(shouldPreload ? [preloadComponentWithErrorHandling(component)] : []),
      ...(child.children ? collectPreloadPromisesChildren(child.children) : []),
    ]
  })
}

/**
 * Recursively collect preload promises from data router RouteObject children.
 * Each promise is wrapped with error handling to prevent cascading failures.
 * Components with ssr: false are skipped during SSR preloading.
 */
function collectPreloadPromisesFromRouteObjects(routes: RouteObject[]): Array<Promise<unknown>> {
  return routes.flatMap(route => {
    const component = route.Component as PreloadableComponent
    const shouldPreloadComponent = component?.preload && component.ssr !== false
    return [
      ...(shouldPreloadComponent ? [preloadComponentWithErrorHandling(component)] : []),
      ...(route.children ? collectPreloadPromisesFromRouteObjects(route.children) : []),
    ]
  })
}

/**
 * Preload a component with error handling.
 * Silently catches errors to prevent individual failures from blocking SSR or client rendering.
 */
async function preloadComponentWithErrorHandling(component: {preload?: () => Promise<unknown>}): Promise<void> {
  try {
    await component.preload?.()
  } catch {
    // Silently ignore preload failures - the component will load on demand
  }
}

/**
 * Preloads components for routes that match the initial location.
 * Uses graceful error handling to ensure individual component failures don't break the entire operation.
 */
export async function preloadMatchedRouteComponents(
  routes: NavigatorRouteRegistration[],
  initialLocation: Location<unknown>,
): Promise<void> {
  const match = matchLocation(routes, initialLocation)
  if (!match) return

  const promises = collectPreloadPromisesChildren([match.route])
  await Promise.allSettled(promises)
}

/**
 * Preloads components for data router routes that match the given path.
 * Uses graceful error handling to ensure individual component failures don't break the entire operation.
 */
export async function preloadMatchedDataRouterComponents(routes: RouteObject[], pathname: string): Promise<void> {
  const matches = matchRoutes(routes, pathname)
  if (!matches || matches.length === 0) return

  // Collect preload promises from all matched routes
  const matchedRoutes = matches.map(match => match.route)
  const promises = collectPreloadPromisesFromRouteObjects(matchedRoutes)
  await Promise.allSettled(promises)
}
