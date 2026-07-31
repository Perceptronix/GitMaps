import type {SendAnalyticsEventFunction} from './types'

export const trackStorage = async (storageKey: string, sendAnalyticsEvent?: SendAnalyticsEventFunction) => {
  if (sendAnalyticsEvent && typeof navigator !== 'undefined' && navigator.storage?.estimate) {
    try {
      const estimate = await navigator.storage.estimate()
      const quota = estimate.quota ?? 0
      const usage = estimate.usage ?? 0
      const available = quota - usage
      sendAnalyticsEvent('offline_cache.storage_space', storageKey, {
        quota_bytes: quota,
        usage_bytes: usage,
        available_bytes: available,
        usage_percent: quota > 0 ? (usage / quota) * 100 : 0,
      })
    } catch {
      // Silently ignore storage estimate errors
    }
  }
}
