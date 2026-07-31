import {type ErrorResponse, isRouteErrorResponse, useRouteError} from '@github-ui/react-router'
import {Blankslate} from '@primer/react/experimental'

import type {ResponseError} from './response-error'
import {isResponseError} from './response-error'
import {useReportRouteError} from './use-report-route-error'
import {useSetTitleOnResponseError} from './use-set-title-on-response-error'

function isNoRouteFoundError(routeError: unknown): routeError is ErrorResponse & {status: 404} {
  return isRouteErrorResponse(routeError) && routeError.status === 404
}
/**
 *
 * Ensure that all render/loader/action errors are handled except a global 404
 * which can only happen in instances where the app is unmounting.
 */
export const UnhandledRouteError = ({appName}: {appName: string}) => {
  const routeError = useRouteError()
  return <UnhandledRouteErrorInner routeError={routeError} appName={appName} />
}

/*
 * Rendered when the root route errors with a 404. This means we're actually navigating _out_ of
 * the app with turbo, but the url updates prior to react being cleaned up.
 *
 * Shared by TanStack Router and React Router implementations.
 */
export const RootNotFoundComponent = () => null

/**
 * Extracted from RootAppRouteErrorElement for compatibility with TanStack Router errorComponent,
 * which passes error directly rather than using useRouteError.
 */
export const UnhandledRouteErrorInner = ({routeError, appName}: {routeError: unknown; appName: string}) => {
  /* When the root route errors with a 404, we're actually navigating _out_ of the app with turbo, but the url updates prior to react being cleaned up */
  if (isNoRouteFoundError(routeError)) {
    return <RootNotFoundComponent />
  }

  return <BaseRouteErrorBoundary appName={appName} routeError={routeError} />
}

function BaseRouteErrorBoundary({appName, routeError}: {appName: string; routeError: unknown}) {
  useReportRouteError(routeError, {reactAppName: appName, devLogLabel: 'GlobalRouterErrorBoundary'})

  return (
    <Blankslate border={false} spacious={false}>
      <Blankslate.Heading>Unable to load page.</Blankslate.Heading>
      <Blankslate.Description>Please reload page and try again</Blankslate.Description>
    </Blankslate>
  )
}

/**
 * The RootAppRouteErrorElement is used to handle errors that occur in application code and routes.
 * ResponseErrors (thrown from loaders/actions) are handled by the ResponseErrorElement.
 * All other errors are handled by the BaseRouteErrorBoundary.
 */
export const RootAppRouteErrorElement = ({appName}: {appName: string}) => {
  const routeError = useRouteError()
  return <RootAppRouteErrorInner routeError={routeError} appName={appName} />
}

/**
 * Extracted from RootAppRouteErrorElement for compatibility with TanStack Router errorComponent,
 * which passes error directly rather than using useRouteError.
 */
export const RootAppRouteErrorInner = ({routeError, appName}: {routeError: unknown; appName: string}) => {
  if (isResponseError(routeError)) {
    return <ResponseErrorElement appName={appName} responseError={routeError} />
  }

  return <BaseRouteErrorBoundary routeError={routeError} appName={appName} />
}

function ResponseErrorElement({appName, responseError}: {appName: string; responseError: ResponseError}) {
  useSetTitleOnResponseError(responseError)
  useReportRouteError(responseError, {reactAppName: appName, devLogLabel: 'InternalResponseErrorElement'})

  return (
    <Blankslate border={false} spacious={false}>
      <Blankslate.Heading>Unable to load page.</Blankslate.Heading>
      <Blankslate.Description>{`Status: ${responseError.response.status} Message: ${responseError.message}`}</Blankslate.Description>
      <Blankslate.Description>Please reload page and try again</Blankslate.Description>
    </Blankslate>
  )
}
