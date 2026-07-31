import {sendEvent} from '@github-ui/hydro-analytics'

const HASH_PATTERN = /-[0-9a-f]{16}\.(js|(?:module\.)?css)$/

function extractFilename(url: string): string {
  return url.split('/').pop() ?? url
}

function stripHash(filename: string): string {
  return filename.replace(HASH_PATTERN, '.$1')
}

type BundleCategory = 'css-blocking' | 'css-deferred' | 'js-blocking' | 'js-deferred'

type ResourceType = 'css' | 'js'

/** Minimal subset of PerformanceResourceTiming fields needed for aggregation. */
interface CollectedEntry {
  name: string
  resourceType: ResourceType
  responseStart: number
  responseEnd: number
  transferSize: number
  decodedBodySize: number
  encodedBodySize: number
}

function getResourceType(entry: PerformanceResourceTiming): ResourceType | null {
  if (entry.initiatorType === 'link' && entry.name.endsWith('.css')) return 'css'
  if (entry.initiatorType === 'script' && entry.name.endsWith('.js')) return 'js'
  return null
}

/**
 * Extract only the fields we need from a PerformanceResourceTiming entry.
 * Returns null if the entry isn't a JS/CSS bundle.
 */
function toCollectedEntry(entry: PerformanceResourceTiming): CollectedEntry | null {
  const resourceType = getResourceType(entry)
  if (!resourceType) return null

  return {
    name: entry.name,
    resourceType,
    responseStart: entry.responseStart,
    responseEnd: entry.responseEnd,
    transferSize: entry.transferSize,
    decodedBodySize: entry.decodedBodySize,
    encodedBodySize: entry.encodedBodySize,
  }
}

function isCached(entry: CollectedEntry): boolean {
  return entry.transferSize === 0 && entry.decodedBodySize > 0
}

function downloadTime(entry: CollectedEntry): number {
  if (isCached(entry)) return 0
  return entry.responseEnd - entry.responseStart
}

/**
 * Classify a resource as blocking or deferred using a First Paint heuristic.
 *
 * A resource whose download completed before (or at) First Paint was
 * render-blocking — the browser had to wait on it before it could paint.
 *
 * Returns null if First Paint timing isn't available (we can't classify
 * without a reference point).
 */
function categorizeByFirstPaint(entry: CollectedEntry, firstPaintTime: number | undefined): BundleCategory | null {
  if (firstPaintTime === undefined) return null

  const isBlocking = entry.responseEnd <= firstPaintTime
  if (entry.resourceType === 'css') return isBlocking ? 'css-blocking' : 'css-deferred'
  return isBlocking ? 'js-blocking' : 'js-deferred'
}

/**
 * Get First Paint timestamp from the Paint Timing API.
 * Returns undefined if not available.
 */
function getFirstPaintTime(): number | undefined {
  const paintEntries = performance.getEntriesByType('paint')
  const fp = paintEntries.find(p => p.name === 'first-paint')
  return fp?.startTime
}

interface BundleEntryDetail {
  name: string
  nameWithoutHash: string
  cached: boolean
  downloadMs: number
  sizeBytes: number
  compressedSizeBytes: number
}

interface BundleAggregate {
  count: number
  totalSizeBytes: number
  totalCompressedSizeBytes: number
  /** Wall-clock download span: max(responseEnd) - min(responseStart) across non-cached entries */
  wallTimeMs: number
  /** Slowest individual asset download: max(responseEnd - responseStart) across non-cached entries */
  maxAssetDownloadMs: number
  /** Internal: earliest responseStart seen across non-cached entries */
  earliestResponseStart: number
  /** Internal: latest responseEnd seen across non-cached entries */
  latestResponseEnd: number
  cachedCount: number
  entries: BundleEntryDetail[]
}

function createAggregate(): BundleAggregate {
  return {
    count: 0,
    totalSizeBytes: 0,
    totalCompressedSizeBytes: 0,
    wallTimeMs: 0,
    maxAssetDownloadMs: 0,
    earliestResponseStart: Infinity,
    latestResponseEnd: -Infinity,
    cachedCount: 0,
    entries: [],
  }
}

function addToAggregate(agg: BundleAggregate, entry: CollectedEntry): void {
  const filename = extractFilename(entry.name)
  const cached = isCached(entry)
  const dlTime = Math.round(downloadTime(entry) * 100) / 100
  const sizeBytes = entry.decodedBodySize || 0
  const compressedSizeBytes = entry.encodedBodySize || 0

  agg.count++
  agg.totalSizeBytes += sizeBytes
  agg.totalCompressedSizeBytes += compressedSizeBytes
  if (!cached) {
    if (entry.responseStart < agg.earliestResponseStart) agg.earliestResponseStart = entry.responseStart
    if (entry.responseEnd > agg.latestResponseEnd) agg.latestResponseEnd = entry.responseEnd
    if (dlTime > agg.maxAssetDownloadMs) agg.maxAssetDownloadMs = dlTime
  }
  if (cached) agg.cachedCount++

  agg.entries.push({
    name: filename,
    nameWithoutHash: stripHash(filename),
    cached,
    downloadMs: dlTime,
    sizeBytes,
    compressedSizeBytes,
  })
}

/**
 * Maximum byte size for the serialized `entries` field in a single event.
 * We target well under 1 MB to leave headroom for the rest of the payload
 * and any envelope overhead added downstream.
 */
const MAX_ENTRIES_BYTES = 512 * 1024 // 512 KB

/**
 * Split `entries` into chunks whose JSON-serialized size stays within
 * `MAX_ENTRIES_BYTES`. Each chunk is sent as a separate event while the
 * aggregate-level totals (count, totalSizeBytes, etc.) are repeated so
 * every event is self-describing.
 */
function sendAggregate(eventType: string, category: BundleCategory, agg: BundleAggregate): void {
  if (agg.count === 0) return

  if (agg.earliestResponseStart !== Infinity && agg.latestResponseEnd !== -Infinity) {
    agg.wallTimeMs = Math.round((agg.latestResponseEnd - agg.earliestResponseStart) * 100) / 100
  }

  const chunks = chunkEntries(agg.entries, MAX_ENTRIES_BYTES)

  for (const chunk of chunks) {
    sendEvent(
      eventType,
      {
        category,
        count: agg.count,
        totalSizeBytes: agg.totalSizeBytes,
        totalCompressedSizeBytes: agg.totalCompressedSizeBytes,
        wallTimeMs: agg.wallTimeMs,
        maxAssetDownloadMs: agg.maxAssetDownloadMs,
        cachedCount: agg.cachedCount,
        entries: JSON.stringify(chunk),
        chunkTotal: chunks.length,
      },
      {batched: true},
    )
  }
}

/**
 * Partition `entries` into the fewest chunks such that
 * `JSON.stringify(chunk).length` never exceeds `maxBytes`.
 *
 * Each entry is guaranteed to appear in exactly one chunk.
 * If a single entry exceeds `maxBytes` it is placed alone in its own chunk.
 */
export function chunkEntries(entries: BundleEntryDetail[], maxBytes: number): BundleEntryDetail[][] {
  if (entries.length === 0) return [entries]

  const chunks: BundleEntryDetail[][] = []
  let current: BundleEntryDetail[] = []
  // Start with the overhead of an empty JSON array: "[]"
  let currentSize = 2

  for (const entry of entries) {
    // +2 accounts for the comma separator and surrounding context;
    // slightly over-estimates for the first element (no comma) which is fine.
    const entrySize = JSON.stringify(entry).length + 2

    if (current.length > 0 && currentSize + entrySize > maxBytes) {
      chunks.push(current)
      current = []
      currentSize = 2
    }

    current.push(entry)
    currentSize += entrySize
  }

  if (current.length > 0) {
    chunks.push(current)
  }

  return chunks
}

export function observeBundleStats(): void {
  if (typeof PerformanceObserver === 'undefined') return
  if (typeof window === 'undefined') return

  // Collect only JS/CSS entries with minimal fields — non-bundle resources
  // (images, fonts, XHRs, etc.) are filtered out
  const collectedEntries: CollectedEntry[] = []

  const observer = new PerformanceObserver(list => {
    for (const entry of list.getEntries() as PerformanceResourceTiming[]) {
      const collected = toCollectedEntry(entry)
      if (collected) collectedEntries.push(collected)
    }
  })

  observer.observe({type: 'resource', buffered: true})

  window.addEventListener(
    'load',
    () => {
      setTimeout(() => {
        observer.disconnect()

        const firstPaintTime = getFirstPaintTime()

        const aggregates = new Map<BundleCategory, BundleAggregate>([
          ['css-blocking', createAggregate()],
          ['css-deferred', createAggregate()],
          ['js-blocking', createAggregate()],
          ['js-deferred', createAggregate()],
        ])

        for (const entry of collectedEntries) {
          const category = categorizeByFirstPaint(entry, firstPaintTime)
          if (!category) continue

          const agg = aggregates.get(category)
          if (agg) addToAggregate(agg, entry)
        }

        for (const [category, agg] of aggregates) {
          sendAggregate('bundle-stats', category, agg)
        }

        // Allow GC of collected entries
        collectedEntries.length = 0
      }, 0)
    },
    {once: true},
  )
}
