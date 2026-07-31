import {noop} from '@github-ui/noop'
import {createContext, memo, Profiler as ReactProfiler, type ProfilerOnRenderCallback, use} from 'react'

import {useAppScopedProfilerCollector} from './profiler-collector'

interface ProfilerContextValue {
  onAppRender: ProfilerOnRenderCallback
  onRouteRender: ProfilerOnRenderCallback
  isEnabled: boolean
}

const ProfilerContext = createContext<ProfilerContextValue | null>(null)

// eslint-disable-next-line @typescript-eslint/no-shadow -- named function expression intentionally shares the outer name
export const ProfilerProvider = memo(function ProfilerProvider({
  isDataRouterEnabled,
  appName,
  children,
}: {
  isDataRouterEnabled: boolean
  appName: string
  children: React.ReactNode
}) {
  const contextValue = useAppScopedProfilerCollector({appName, isDataRouterEnabled})
  return <ProfilerContext value={contextValue}>{children}</ProfilerContext>
})

const useProfilerOnRender = (profilerType: 'app' | 'route') => {
  const contextValue = use(ProfilerContext)
  if (!contextValue) return noop
  return profilerType === 'app' ? contextValue.onAppRender : contextValue.onRouteRender
}

/**
 * Profiler wrapper that conditionally renders React's Profiler component.
 * When profiling is disabled, children are rendered directly without any Profiler overhead.
 * This ensures zero performance impact for users without profiling enabled.
 */
// eslint-disable-next-line @typescript-eslint/no-shadow -- named function expression intentionally shares the outer name
const Profiler = memo(function Profiler({
  id,
  children,
  profilerType,
}: {
  id: string
  children: React.ReactNode
  profilerType: 'app' | 'route'
}) {
  const onRender = useProfilerOnRender(profilerType)
  return (
    <ReactProfiler id={id} onRender={onRender}>
      {children}
    </ReactProfiler>
  )
})

/**
 * AppProfiler is a specialized Profiler for app-level performance tracking.
 * It uses the 'app' profiler type to report metrics separately from route-level metrics.
 */
// eslint-disable-next-line @typescript-eslint/no-shadow -- named function expression intentionally shares the outer name
export const AppProfiler = memo(function AppProfiler({id, children}: {id: string; children: React.ReactNode}) {
  return (
    <Profiler id={id} profilerType="app">
      {children}
    </Profiler>
  )
})

/**
 * RouteProfiler is a specialized Profiler for route-level performance tracking.
 * It uses the 'route' profiler type to report metrics separately from app-level metrics.
 */
// eslint-disable-next-line @typescript-eslint/no-shadow -- named function expression intentionally shares the outer name
export const RouteProfiler = memo(function RouteProfiler({id, children}: {id: string; children: React.ReactNode}) {
  return (
    <Profiler id={id} profilerType="route">
      {children}
    </Profiler>
  )
})
