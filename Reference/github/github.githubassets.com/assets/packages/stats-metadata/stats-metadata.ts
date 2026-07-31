import {ssrSafeDocument} from '@github-ui/ssr-utils'

export function getCurrentReactAppName() {
  const injectedAppName = ssrSafeDocument?.querySelector('meta[name="react-app-name"]')?.getAttribute('content')

  if (injectedAppName) return injectedAppName

  // special case for memex
  if (ssrSafeDocument?.querySelector('projects-v2')) return 'memex'
  // special case for repos-overview that is a partial
  if (ssrSafeDocument?.querySelector('react-partial[partial-name="repos-overview"]')) return 'repos-overview'

  return ssrSafeDocument?.querySelector('react-app')?.getAttribute('app-name')
}
