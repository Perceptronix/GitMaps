import type {ServiceWorkerMessageRequest, ServiceWorkerMessageResponse, ServiceWorkerPreloadedQuery} from './sw-types'
import {
  SW_MESSAGE_TIMEOUT_MS,
  SW_MSG_GET_CACHED_QUERIES,
  SW_MSG_CACHED_QUERIES_RESPONSE,
  SW_POST_REQUEST_EVENT,
} from './sw-constants'
import {sendEvent} from '@github-ui/hydro-analytics'

type SwPreloadedQueriesResult = ServiceWorkerPreloadedQuery[] | null

let swPreloadedQueries: SwPreloadedQueriesResult = null

function isIssuesPage(url: string): boolean {
  const parsed = new URL(url, self.location.origin)
  const pathSegments = parsed.pathname.split('/').filter(Boolean)

  if (!pathSegments[0] || !pathSegments[1] || pathSegments[2] !== 'issues') return false

  // /{owner}/{repo}/issues (index page)
  if (pathSegments.length === 3) return true

  // /{owner}/{repo}/issues/{number} (show page)
  if (pathSegments.length === 4) {
    const issueNumber = pathSegments[3]
    return issueNumber !== undefined && /^\d+$/.test(issueNumber)
  }

  return false
}

export async function fetchSwPreloadedQueries(url: string): Promise<void> {
  if (swPreloadedQueries !== null) return // Already fetched

  try {
    const controller = navigator.serviceWorker?.controller
    if (!controller) return
    if (!isIssuesPage(url)) return

    const startTime = performance.now()
    const result = await new Promise<SwPreloadedQueriesResult>((resolve, reject) => {
      const channel = new MessageChannel()
      function cleanup() {
        channel.port1.onmessage = null
        channel.port1.onmessageerror = null
        channel.port1.close()
        channel.port2.close()
      }
      const timeoutId = setTimeout(() => {
        cleanup()
        const duration = performance.now() - startTime
        sendEvent(SW_POST_REQUEST_EVENT, {duration_ms: duration, timedOut: true})
        resolve(null)
      }, SW_MESSAGE_TIMEOUT_MS)

      channel.port1.onmessage = (event: MessageEvent<ServiceWorkerMessageResponse>) => {
        clearTimeout(timeoutId)
        cleanup()
        const duration = performance.now() - startTime
        if (event.data?.type === SW_MSG_CACHED_QUERIES_RESPONSE && event.data.data) {
          const queries = event.data.data.preloadedQueries
          sendEvent(SW_POST_REQUEST_EVENT, {duration_ms: duration, timedOut: false})
          resolve(queries)
        } else {
          sendEvent(SW_POST_REQUEST_EVENT, {duration_ms: duration, timedOut: false})
          resolve(null)
        }
      }

      channel.port1.onmessageerror = () => {
        clearTimeout(timeoutId)
        cleanup()
        reject(new Error('SW message channel error'))
      }

      const message: ServiceWorkerMessageRequest = {type: SW_MSG_GET_CACHED_QUERIES, url}
      controller.postMessage(message, [channel.port2])
    })

    swPreloadedQueries = result
  } catch {
    swPreloadedQueries = null
  }
}

export function getSwPreloadedQueries(): SwPreloadedQueriesResult {
  return swPreloadedQueries
}

export function clearSwPreloadedQueries(): void {
  swPreloadedQueries = null
}
