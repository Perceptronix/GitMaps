import {createContext, use, useMemo, type ReactNode} from 'react'

type UrlContextValue = {
  shouldUseDotcomLinks: boolean
}

const UrlContext = createContext<UrlContextValue | undefined>(undefined)

type UrlProviderProps = {
  shouldUseDotcomLinks: boolean
  children: ReactNode
}

export function UrlProvider({shouldUseDotcomLinks, children}: UrlProviderProps) {
  const value = useMemo(() => ({shouldUseDotcomLinks}), [shouldUseDotcomLinks])

  return <UrlContext value={value}>{children}</UrlContext>
}

export function useUrlContext(): UrlContextValue {
  const context = use(UrlContext)

  if (context === undefined) {
    throw new Error('useUrlContext must be used within a UrlProvider')
  }

  return context
}
