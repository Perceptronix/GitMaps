import {type PropsWithChildren, useMemo} from 'react'

import {RoutesContext, type RoutesContextType} from './routes-context'

export function RoutesContextProvider({routes, children}: PropsWithChildren<RoutesContextType>) {
  const appContextProviderValue = useMemo(() => ({routes}), [routes])
  return <RoutesContext value={appContextProviderValue}>{children}</RoutesContext>
}
