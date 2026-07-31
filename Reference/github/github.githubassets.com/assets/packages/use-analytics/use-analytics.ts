import {useCallback, use} from 'react'
import {sendEvent} from '@github-ui/hydro-analytics'
import {AnalyticsContext} from '@github-ui/analytics-provider/context'

export interface AnalyticsEvent {
  category: string
  action: string
  label: string
  [key: string]: unknown
}

export type SendAnalyticsEventFunction = (
  eventType: string,
  target?: string,
  payload?: {[key: string]: unknown} | AnalyticsEvent,
) => void

export interface UseAnalyticsOptions {
  /**
   * When `true`, the hook does not throw if it is rendered outside of an
   * `AnalyticsContext`. Instead, the returned `sendAnalyticsEvent` still emits
   * the event, but without the context-derived `app_name`/`category`/`metadata`
   * enrichment. Use this for shared utilities (e.g. data-fetching hooks) that
   * must remain usable in trees that may not provide an `AnalyticsContext`.
   * @default false
   */
  optional?: boolean
}

/**
 * Use this hook with the AnalyticsContext to send user analytics events to the data warehouse.
 * This hook will read values from the nearest AnalyticsContext.Provider, though you can override properties directly when sending an event.
 * It uses the `sendEvent` helper from `github/hydro-analytics`,
 * which enriches event context with additional information about the user, repository, and current page.
 * See: https://thehub.github.com/epd/engineering/products-and-services/internal/hydro/installation/browser-events/
 *
 * You can find a list of all included context properties in `app/helpers/octolytics_helper.rb`.
 *
 *
 * @example
 * ```tsx
 * function Component() {
 *   const { sendAnalyticsEvent } = useAnalytics()
 *   return <Button onClick={() => sendAnalyticsEvent('file_tree.close', 'FILE_TREE_TOGGLE')}>CLOSE TREE</Button>
 * }
 * ```
 *
 */
export function useAnalytics(options?: UseAnalyticsOptions): {
  sendAnalyticsEvent: SendAnalyticsEventFunction
} {
  // WARNING: Do not add any hooks here that will cause rerenders on soft navs.
  const contextData = use(AnalyticsContext)

  if (!contextData && !options?.optional) {
    throw new Error('useAnalytics must be used within an AnalyticsContext')
  }

  return {
    sendAnalyticsEvent: useCallback(
      (eventType, target?, payload = {}) => {
        const context = contextData
          ? {
              react: true,
              ['app_name']: contextData.appName,
              category: contextData.category,
              ...contextData.metadata,
            }
          : {react: true}
        sendEvent(eventType, {...context, ...payload, target})
      },
      [contextData],
    ),
  }
}

/**
 * Use this hook with the AnalyticsContext to send user analytics events to the data warehouse.
 * This hook will read values from the nearest AnalyticsContext.Provider, though you can override properties directly when sending an event.
 * It uses the `sendEvent` helper from `github/hydro-analytics`,
 * which enriches event context with additional information about the user, repository, and current page.
 * See: https://thehub.github.com/epd/engineering/products-and-services/internal/hydro/installation/browser-events/
 *
 * You can find a list of all included context properties in `app/helpers/octolytics_helper.rb`.
 *
 *
 * @example
 * ```tsx
 * function Component() {
 *   const { sendClickAnalyticsEvent } = useClickAnalytics()
 *   return <Button onClick={() => sendClickAnalyticsEvent({category: '...', action: '...', label: '...'})}>Submit</Button>
 * }
 * ```
 *
 */
export function useClickAnalytics(): {
  sendClickAnalyticsEvent: (payload?: {[key: string]: unknown} | AnalyticsEvent) => void
} {
  const {sendAnalyticsEvent} = useAnalytics()
  return {
    sendClickAnalyticsEvent: useCallback(
      (payload = {}) => {
        sendAnalyticsEvent('analytics.click', undefined, payload)
      },
      [sendAnalyticsEvent],
    ),
  }
}
