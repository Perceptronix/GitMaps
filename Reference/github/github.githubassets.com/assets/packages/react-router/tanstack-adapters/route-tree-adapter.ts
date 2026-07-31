import {createRoute, type AnyRoute} from '@tanstack/react-router'
import type {RouteObject as ReactRouterRouteObject} from '../react-router'
import {routeOptionsAdapter} from './route-options-adapter'
import type {GetRouteOptions} from './types'

/**
 * Recursively converts an array of React Router `RouteObject`s into TanStack Router route
 * instances, preserving parent–child hierarchy.
 */
export function routeTreeAdapter(
  routes: ReactRouterRouteObject[],
  parentRoute: AnyRoute,
  options: {
    parentFullPath: string
    getRouteOptions?: GetRouteOptions
  } = {parentFullPath: ''},
): AnyRoute[] {
  const {parentFullPath, getRouteOptions} = options
  return routes.map(routeObj => {
    const {normalizedRelativePath, routeIdentifier, ...routeOptions} = routeOptionsAdapter(
      routeObj,
      parentFullPath,
      getRouteOptions,
    )

    const route = createRoute({
      getParentRoute: () => parentRoute,
      ...('path' in routeIdentifier ? {path: routeIdentifier.path} : {id: routeIdentifier.id}),
      ...routeOptions,
    })

    if (routeObj.children && routeObj.children.length > 0) {
      // Use normalizedRelativePath to build the new parent path because route.fullPath
      // won't be available until the route is added to the tree
      const newParentPath = `${parentFullPath}/${normalizedRelativePath ?? ''}`.replace(/\/+/g, '/')
      const childRoutes = routeTreeAdapter(routeObj.children, route, {
        parentFullPath: newParentPath,
        getRouteOptions,
      })
      route.addChildren(childRoutes)
    }

    return route
  })
}
