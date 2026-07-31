// eslint-disable-next-line no-restricted-imports
import {reportError} from '@github-ui/failbot'
import type React from 'react'
import {createContext, memo, use, useCallback} from 'react'

import {handleIfNotReported} from './use-report-route-error'

const ReportErrorContext = createContext<typeof reportError | null>(null)

// eslint-disable-next-line @typescript-eslint/no-shadow -- named function expression intentionally shares the outer name
export const ReportErrorContextProvider = memo(function ReportErrorContextProvider({
  appName: reactAppName,
  children,
  critical,
}: React.PropsWithChildren<{appName: string; critical?: boolean}>) {
  // `appName`/`critical` are effectively constant per provider mount, so this callback is
  // stable in practice. Consumers that call it inside an effect should still wrap it in
  // `useEffectEvent` so their effect never re-runs on the (rare) identity change.
  const internalReportError: typeof reportError = useCallback(
    (error, context) => {
      if (!error) return
      return handleIfNotReported(error, err => {
        reportError(err, {
          critical,
          reactAppName,
          ...context,
        })
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('Error in InternalResponseErrorElement', error)
        }
      })
    },
    [reactAppName, critical],
  )

  return <ReportErrorContext value={internalReportError}>{children}</ReportErrorContext>
})

/**
 *
 * Errors reported in this context will be reported to the failbot service.
 * Do not re-throw the error after calling this function
 *
 * @returns The `reportError` function from `@github-ui/failbot` that can be used to report errors.
 * @throws An error if the context is not used within a `ReportErrorContextProvider`.
 */
export function useReportErrorContext() {
  const reportErrorCtx = use(ReportErrorContext)
  if (reportErrorCtx == null) {
    throw new Error('useReportErrorContext must be used within a ReportErrorContextProvider')
  }
  return reportErrorCtx
}
