import {ready} from '@github-ui/document-ready'

const CPU_BUCKETS: Array<[string, number]> = [
  ['xlg', 8],
  ['lg', 4],
  ['md', 2],
  ['sm', 0],
]
const isLowCapacityCPU = (): boolean => {
  const bucket = getCPUBucketInSW()
  return bucket === 'sm' || bucket === 'md'
}
const getCPUBucketInSW = (): string => {
  if (!('hardwareConcurrency' in navigator)) return 'unknown'
  const concurrency = navigator.hardwareConcurrency
  for (const [bucket, min] of CPU_BUCKETS) {
    if (concurrency > min) return bucket
  }
  return 'unknown'
}
;(async function () {
  if ('serviceWorker' in navigator) {
    await ready
    const serviceWorkerPath = document.querySelector<HTMLLinkElement>('link[rel="service-worker-src"]')?.href
    if (serviceWorkerPath && !isLowCapacityCPU()) {
      navigator.serviceWorker.register(`${serviceWorkerPath}&module=true`, {scope: '/', type: 'module'})
    } else {
      await unregisterAllServiceWorkers()
    }
  }
})()

async function unregisterAllServiceWorkers() {
  let registrations: readonly ServiceWorkerRegistration[] = []
  try {
    registrations = await navigator.serviceWorker.getRegistrations()
  } catch (error) {
    // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
    if (error.name === 'SecurityError') return
  }

  for (const registration of registrations) {
    registration.unregister()
  }
}
