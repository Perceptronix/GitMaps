import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {getQueryClient} from '@github-ui/query-client'
import {ToastContextProvider} from '@github-ui/toast/ToastContext'
import {ThemeProvider} from '@primer/react'
import {QueryClientProvider} from '@tanstack/react-query'
import type {ReactNode} from 'react'

import {IsDataRouterEnabledContextProvider} from './future/IsDataRouterEnabled'
import {ReportErrorContextProvider} from './future/ReportErrorContext'
import {PrimerFeatureFlags} from './PrimerFeatureFlags'
import useColorModes from './use-color-modes'

interface Props {
  appName: string
  children?: ReactNode
  dataRouterEnabled: boolean
}

const metadata = {}

/**
 * This component provides the _base_ context for both apps and partials.
 * It should provide everything needed to render with styles, themes, and i18n.
 */
export function BaseProviders({appName, children, dataRouterEnabled}: Props) {
  const {colorMode, dayScheme, nightScheme} = useColorModes()

  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <AnalyticsProvider appName={appName} category="" metadata={metadata}>
        <PrimerFeatureFlags>
          <ThemeProvider colorMode={colorMode} dayScheme={dayScheme} nightScheme={nightScheme} contextOnly>
            <IsDataRouterEnabledContextProvider enabled={dataRouterEnabled}>
              <ReportErrorContextProvider appName={appName}>
                <ToastContextProvider>{children}</ToastContextProvider>
              </ReportErrorContextProvider>
            </IsDataRouterEnabledContextProvider>
          </ThemeProvider>
        </PrimerFeatureFlags>
      </AnalyticsProvider>
    </QueryClientProvider>
  )
}
