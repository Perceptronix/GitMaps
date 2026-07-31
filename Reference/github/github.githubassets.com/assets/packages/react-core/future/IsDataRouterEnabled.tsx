import {createContext, type PropsWithChildren} from 'react'

export const IsDataRouterEnabledContext = createContext(false)

export function IsDataRouterEnabledContextProvider({enabled, children}: PropsWithChildren<{enabled: boolean}>) {
  return <IsDataRouterEnabledContext value={enabled}>{children}</IsDataRouterEnabledContext>
}
