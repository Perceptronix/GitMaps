import type {ReactNode} from 'react'

import type {PreloadableComponent} from '../app-routing-types'
import {RouteProfiler} from '../ProfilerContext'

/**
 * Creates a wrapper Component that renders the content inside a RouteProfiler.
 * Preserves the original Component's preload and ssr properties for SSR preloading.
 */
export function wrapComponentWithProfiler(
  profilerId: string,
  {element, Component}: {element: ReactNode; Component: PreloadableComponent | null | undefined},
): PreloadableComponent | undefined {
  if (!element && !Component) return undefined

  const ProfilerWrapper: PreloadableComponent = () => {
    let node: null | React.ReactElement = null
    if (element !== undefined) {
      node = <>{element}</>
    } else if (Component) {
      node = <Component />
    }

    if (!node) return null

    return <RouteProfiler id={profilerId}>{node}</RouteProfiler>
  }

  // Preserve preload and ssr properties from the original Component for SSR
  if (Component?.preload) {
    ProfilerWrapper.preload = Component.preload
  }
  if (Component?.ssr !== undefined) {
    ProfilerWrapper.ssr = Component.ssr
  }

  return ProfilerWrapper
}
