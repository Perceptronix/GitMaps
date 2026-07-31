import type {RouteObject as ReactRouterRouteObject} from '../react-router'

export function convertToTanStackPath(path: string): string {
  return path
    .replace(/:([a-zA-Z_][a-zA-Z0-9_]*)\?/g, '{-$$$1}') // optional :param? → {-$param}
    .replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, '$$$1') // required :param → $param
    .replace(/\*$/g, '$') // splat * → $
}

/**
 * Converts a React Router `RouteObject` into the path string expected by TanStack Router.
 *
 * - Index routes (`{index: true}`) return `'/'`, which is TanStack Router's relative path
 *   convention for index routes. TSR resolves this relative to the parent's full path.
 * - Pathless layout routes (no `path` property) return `undefined`, causing the caller to assign
 *   an `id` instead.
 * - Parent routes with relative path of `'/'` are normalized as pathless layouts (i.e., path: undefined)
 * - All other routes are forwarded to `normalizeToRelativePath`.
 */
export function routePathAdapter(routeObj: ReactRouterRouteObject, parentFullPath = ''): string | undefined {
  if (routeObj.index === true) {
    return '/'
  }

  if (routeObj.path && routeObj.path !== '') {
    const normalizedPath = normalizeToRelativePath(routeObj.path, parentFullPath)
    // A normalized path of '/' must be treated as a pathless layout if it has children
    // to avoid route identifier conflicts.
    if (normalizedPath !== '/' || !routeObj.children || routeObj.children?.length === 0) {
      return normalizedPath
    }
  }

  // Should resolve as a pathless layout route
  return undefined
}

/**
 * React Router allows both absolute and relative paths. TanStack Router (TSR) expects
 * relative paths for child routes — it resolves them against the parent's full path.
 *
 * For routes with a parent, we always strip the parent prefix so TSR doesn't double-prepend it.
 * For root-level routes (no parent), the path is used as-is with a leading slash.
 */
export function normalizeToRelativePath(reactRouterPath: string, parentFullPath = ''): string {
  const convertedPath = convertToTanStackPath(reactRouterPath)

  const convertedParent = convertToTanStackPath(parentFullPath)

  if (convertedParent) {
    // For absolute paths: strip parent prefix
    if (convertedPath.startsWith('/')) {
      if (convertedPath.startsWith(convertedParent)) {
        const relative = convertedPath.slice(convertedParent.length)
        return relative.startsWith('/') ? relative : `/${relative}`
      }
      // Absolute path doesn't share prefix with parent — shouldn't happen in well-formed trees
      return convertedPath
    }

    // For relative paths: prefix with leading slash (TSR relative paths start with /)
    return convertedPath.startsWith('/') ? convertedPath : `/${convertedPath}`
  }

  // Root-level route (no parent): ensure leading slash
  return convertedPath.startsWith('/') ? convertedPath : `/${convertedPath}`
}
