import {sendCustomMetric, type CustomMetricKey} from '@github-ui/stats'
import {useEffect} from 'react'

// Available in newer browsers, but TypeScript doesn't support in our lib version
interface PerformanceMemory {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

export interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemory
}

/**
 * Gets current JavaScript heap memory usage in megabytes.
 * Only available in Chromium-based browsers.
 */
export function getMemoryMB(): number | null {
  const memory = (performance as PerformanceWithMemory).memory
  if (memory?.usedJSHeapSize) {
    return Math.round((memory.usedJSHeapSize / 1024 / 1024) * 10) / 10
  }
  return null
}

/**
 * Gets heap utilization as a percentage (0-100).
 */
export function getHeapUtilization(): number | null {
  const memory = (performance as PerformanceWithMemory).memory
  if (memory?.usedJSHeapSize && memory?.jsHeapSizeLimit) {
    // Calculate percentage with 2 decimal places: multiply by 100 for %, then by 100 for precision, then divide by 100 after rounding
    return Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 10000) / 100
  }
  return null
}

/**
 * Gets raw heap size in bytes (for tracking growth/max).
 */
export function getHeapSizeBytes(): number | null {
  const memory = (performance as PerformanceWithMemory).memory
  return memory?.usedJSHeapSize ?? null
}

function sendMemoryStats({statName, tags}: {statName: CustomMetricKey; tags?: PlatformBrowserCustomMetricTags}) {
  requestIdleCallback(() => {
    const memory = getMemoryMB()

    if (!memory) return

    sendCustomMetric({
      name: statName,
      value: memory,
      tags,
    })
  })
}

export function useMemoryStats({
  intervalMs = 5000,
  maxDatapoints = 20,
  statName,
  tags,
}: {
  intervalMs?: number
  maxDatapoints?: number
  statName: CustomMetricKey
  tags?: PlatformBrowserCustomMetricTags
}) {
  useEffect(() => {
    // This API is not available in all browsers
    if (!performance || !('memory' in performance)) return

    // Validate maxDatapoints
    if (maxDatapoints <= 0) return

    let datapointsSent = 0
    let intervalId: ReturnType<typeof setInterval> | undefined

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopReporting()
      }
    }

    const stopReporting = () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId)
        intervalId = undefined
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }

    const sendStats = () => {
      sendMemoryStats({statName, tags})
      datapointsSent++

      if (datapointsSent >= maxDatapoints) {
        stopReporting()
      }
    }

    // Send initial stat
    sendStats()

    // Only set up interval if we haven't reached max
    if (datapointsSent < maxDatapoints) {
      intervalId = setInterval(sendStats, intervalMs)
    }

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      stopReporting()
    }
  }, [intervalMs, maxDatapoints, statName, tags])
}
