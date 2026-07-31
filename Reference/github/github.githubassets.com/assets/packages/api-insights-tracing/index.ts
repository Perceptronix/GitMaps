// TODO: do not export those constants and instead provide functions to push and read data
export const TraceDataKey = 'GraphQLTraces'
export const TraceDataRefreshCallbackKey = 'GraphQLTracingRefresh'

export const disabledClusters = getDisabledClusters()

export function runsOnClient() {
  return typeof window !== 'undefined'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function reportTraceData(json: any) {
  if (!runsOnClient()) return
  if (!isTracingEnabled()) return
  if (!json) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rootWindowContent = window as {[key: string]: any} | undefined

  if (rootWindowContent && !rootWindowContent[TraceDataKey]) {
    rootWindowContent[TraceDataKey] = []
  }

  if (rootWindowContent && json['__trace']) {
    rootWindowContent[TraceDataKey].push(json['__trace'])
    if (typeof rootWindowContent[TraceDataRefreshCallbackKey] === 'function') {
      rootWindowContent[TraceDataRefreshCallbackKey]()
    }
  }
}

export function isTracingEnabled() {
  if (!runsOnClient()) return false

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rootWindowContent = window as {[key: string]: any} | undefined

  return (
    new URLSearchParams(window.location.search).get('_tracing') === 'true' ||
    (rootWindowContent && rootWindowContent[TraceDataKey] !== undefined)
  )
}

function clustersDisabled() {
  return disabledClusters.length > 0
}

export function getInsightsUrl(url: string) {
  if (!runsOnClient()) return url
  if (!isTracingEnabled() && !clustersDisabled()) return url

  const urlObject = new URL(url, window.location.origin)

  if (isTracingEnabled()) {
    urlObject.searchParams.set('_tracing', 'true')
  }

  if (clustersDisabled()) {
    urlObject.searchParams.set('disable_clusters', disabledClusters.join(','))
  }

  return urlObject.pathname + urlObject.search
}

function getDisabledClusters() {
  if (!runsOnClient()) return []

  return decodeURIComponent(new URLSearchParams(window.location.search).get('disable_clusters') || '')
    .split(',')
    .filter(c => c !== '')
}

export function isClusterDisabled(cluster: string) {
  return disabledClusters.indexOf(cluster) > -1
}

export function toggleClusterState(cluster: string) {
  if (!runsOnClient()) return
  const index = disabledClusters.indexOf(cluster)

  if (index > -1) {
    disabledClusters.splice(index, 1)
  } else {
    disabledClusters.push(cluster)
  }

  const params = new URLSearchParams(window.location.search)
  params.set('disable_clusters', disabledClusters.join(','))

  window.location.search = params.toString()
}
