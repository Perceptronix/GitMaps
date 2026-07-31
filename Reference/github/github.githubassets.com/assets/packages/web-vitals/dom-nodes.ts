import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {ssrSafeDocument} from '@github-ui/ssr-utils'

let previousDomNodeCount: number = 0

ssrSafeDocument?.addEventListener(SOFT_NAV_STATE.START, () => {
  previousDomNodeCount = countNodes() // nodes may have changes with user interactions / deferred renders
})

function countNodes() {
  return ssrSafeDocument?.getElementsByTagName('*').length || 0
}

export function getDomNodes() {
  return {
    previous: previousDomNodeCount,
    current: countNodes(),
  }
}

// Bucket boundaries (exclusive lower bound). Ordered from highest to lowest so the
// first matching threshold wins. Matches the labels used by dotcom's Ruby
// DOM_NODES_BUCKETS map so Datadog dimensions align across asset bundle and
// Rails-rendered paths.
const DOM_NODES_BUCKETS: ReadonlyArray<readonly [label: string, min: number]> = [
  ['200_001+', 200_000],
  ['100_001 - 200_000', 100_000],
  ['50_001 - 100_000', 50_000],
  ['25_001 - 50_000', 25_000],
  ['10_001 - 25_000', 10_000],
  ['1_001 - 10_000', 1_000],
  ['1 - 1_000', 0],
]

/**
 * Maps a DOM node count to a low-cardinality bucket label suitable for use as
 * a Datadog metric tag.
 *
 * Returns `undefined` for counts <= 0 (no meaningful bucket).
 */
export function getDomNodesBucket(count: number): string | undefined {
  if (!Number.isFinite(count) || count <= 0) return undefined
  for (const [label, min] of DOM_NODES_BUCKETS) {
    if (count > min) return label
  }
  return undefined
}
