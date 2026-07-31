import {Activity, type ReactNode} from 'react'

export interface ActivityBoundaryProps {
  /**
   * Whether to wrap children in an `<Activity>` boundary. When false, children render unchanged.
   * Callers typically pass a feature-flag check, e.g. `enabled={isFeatureEnabled('my_flag')}`, so
   * the boundary can be rolled out (or rolled back) per surface.
   */
  enabled: boolean
  /**
   * Activity visibility mode. Defaults to `'visible'`, which keeps content on screen but lets React
   * deprioritize its hydration. Use `'hidden'` only for content that is inert while off screen.
   */
  mode?: 'visible' | 'hidden'
  children: ReactNode
}

/**
 * Wraps children in a React `<Activity>` boundary when `enabled` is true, and otherwise forwards
 * them untouched. Centralizing the wrap keeps selective-hydration boundaries consistent while
 * leaving the enable/disable decision (typically a feature flag) to each caller.
 */
export function ActivityBoundary({enabled, mode = 'visible', children}: ActivityBoundaryProps): ReactNode {
  if (!enabled) {
    return children
  }

  return <Activity mode={mode}>{children}</Activity>
}
