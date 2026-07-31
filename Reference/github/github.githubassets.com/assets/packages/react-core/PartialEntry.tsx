// Think of this as the entry point into the framework
import type {ErrorContext} from '@github-ui/failbot'
import type {RouteObject} from '@github-ui/react-router'
import type {PropsWithChildren} from 'react'

import {BaseProviders} from './BaseProviders'
import {CommonElements} from './CommonElements'
import {ErrorBoundary} from './ErrorBoundary'
import {RoutesContextProvider} from './RoutesContextProvider'

type Props = PropsWithChildren<{
  partialName: string
  ssrError?: HTMLScriptElement
  onError?: (error: Error, context?: ErrorContext) => void
}>

// this is a fixed, empty array since links/navigation should always turbo nav from partials
const ROUTE_CONTEXT_ROUTES: RouteObject[] = []

export function PartialEntry({partialName, onError, children, ssrError}: Props) {
  return (
    <BaseProviders appName={partialName} dataRouterEnabled={false}>
      <ErrorBoundary onError={onError}>
        <RoutesContextProvider routes={ROUTE_CONTEXT_ROUTES}>
          {children}
          <CommonElements ssrError={ssrError} />
        </RoutesContextProvider>
      </ErrorBoundary>
    </BaseProviders>
  )
}
