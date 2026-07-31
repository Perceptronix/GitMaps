import {type AnyTanStackRoute, DEFAULT_INTENT_PRELOAD_DELAY, type TanStackRouterOptions} from '@github-ui/react-router'

import {DEFAULT_STALE_TIME_FOR_PRELOAD} from './query-route'

/**
 * Default options for TanStack Router used in GitHub UI.
 *
 * These options are shared across Data Router apps, whether they are served by
 * the UI Service or by Rails in TanStack Router mode.
 *
 * @link https://tanstack.com/router/latest/docs/api/router/RouterOptionsType
 */
export const TANSTACK_ROUTER_OPTIONS = {
  scrollRestoration: true,
  // Preserve trailing slashes to maintain URL consistency across navigations
  trailingSlash: 'preserve' as const,
  // We're not using the cached loader data (we're using TSQ, so the loader is really
  // only the entrypoint into the router lifecycle to kick off and ensure query data),
  // so we never really want to re-use the cached routes. Setting this to blocking
  // fixes a number of bugs related to the blob-layout route in code-view, and also
  // gives us a closer representation to how React Router works in Data Router today.
  defaultStaleReloadMode: 'blocking' as const,
  defaultPreloadStaleTime: DEFAULT_STALE_TIME_FOR_PRELOAD,
  defaultPreloadDelay: DEFAULT_INTENT_PRELOAD_DELAY,
} satisfies TanStackRouterOptions<AnyTanStackRoute, 'preserve'>
