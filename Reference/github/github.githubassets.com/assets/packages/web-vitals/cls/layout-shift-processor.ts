import {BaseProcessor} from '../base/processor'
import {getSelector} from '../get-selector'
import {CLSMetric, getLargestLayoutShiftSource} from './metric'

// From https://github.com/GoogleChrome/web-vitals/blob/1b872cf5f2159e8ace0e98d55d8eb54fb09adfbe/src/lib/LayoutShiftManager.ts#L17
// with a few modifications to fit our needs.
export class LayoutShiftProcessor extends BaseProcessor<CLSMetric, LayoutShift> {
  sessionValue = 0
  sessionEntries: LayoutShift[] = []
  maxSessionValue = 0
  maxSessionEntries: LayoutShift[] = []
  layoutShiftTargetMap: Map<LayoutShiftAttribution, string> = new Map()

  get metric() {
    // Pages without entries report CLS = 0
    if (this.maxSessionEntries.length === 0 && this.sessionEntries.length === 0) {
      return new CLSMetric(0, [], new Map())
    }

    // Report the maximum session window value, not the current one
    // This matches web-vitals v5 and Datadog behavior
    const value = Math.max(this.maxSessionValue, this.sessionValue)
    const entries = this.sessionValue >= this.maxSessionValue ? this.sessionEntries : this.maxSessionEntries

    return new CLSMetric(value, entries, this.layoutShiftTargetMap)
  }

  processEntries(entries: LayoutShift[]) {
    for (const entry of entries) {
      this.processEntry(entry)
    }
  }

  processEntry(entry: LayoutShift) {
    // Only count layout shifts without recent user input.
    if (entry.hadRecentInput) return

    const firstSessionEntry = this.sessionEntries[0]
    const lastSessionEntry = this.sessionEntries.at(-1)

    // If the entry occurred less than 1 second after the previous entry
    // and less than 5 seconds after the first entry in the session,
    // include the entry in the current session. Otherwise, start a new
    // session.
    if (
      this.sessionValue &&
      firstSessionEntry &&
      lastSessionEntry &&
      entry.startTime - lastSessionEntry.startTime < 1000 &&
      entry.startTime - firstSessionEntry.startTime < 5000
    ) {
      this.sessionValue += entry.value
      this.sessionEntries.push(entry)
    } else {
      // Before starting a new window, save the current one if it's the largest
      if (this.sessionValue > this.maxSessionValue) {
        this.maxSessionValue = this.sessionValue
        this.maxSessionEntries = this.sessionEntries
      }
      this.sessionValue = entry.value
      this.sessionEntries = [entry]
    }

    this.setLargestShiftSource(entry)
  }

  setLargestShiftSource(entry: LayoutShift) {
    if (entry?.sources?.length) {
      const largestSource = getLargestLayoutShiftSource(entry.sources)
      const node = largestSource?.node
      if (node) {
        const customTarget = getSelector(node)
        this.layoutShiftTargetMap.set(largestSource, customTarget)
      }
    }
  }
}
