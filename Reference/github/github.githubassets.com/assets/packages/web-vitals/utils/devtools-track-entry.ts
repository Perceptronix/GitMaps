export interface TrackEntryOptions {
  /** Measure name; surfaces as the entry label in the Performance panel. */
  name: string
  /** Track row to render the entry on (e.g. `'HPC'`, `'ContainerTiming'`). */
  track: string
  /** Devtools color token (e.g. `'primary-dark'`, `'tertiary-dark'`). */
  color: string
  /** Hover tooltip text shown over the entry. */
  tooltipText: string
  /** Measure start — a number (high-res timestamp) or a named mark. Defaults to `'navigationStart'`. */
  start?: number | string
  /** Optional measure end. Omit to measure from `start` to now. */
  end?: number
}

/**
 * Record a Performance-panel "track entry" via `performance.measure()`.
 *
 * Centralizes the devtools `detail` shape used by HPC and Container
 * Timing so both metrics render in the same track group with a
 * consistent schema. Swallows the measure call's exceptions: it can
 * throw on synthetic test pages where `navigationStart` is missing,
 * and we never want a devtools-only side-effect to break reporting.
 */
export function recordDevtoolsTrackEntry({
  name,
  track,
  color,
  tooltipText,
  start = 'navigationStart',
  end,
}: TrackEntryOptions): void {
  try {
    const opts: PerformanceMeasureOptions = {
      start,
      detail: {
        devtools: {
          dataType: 'track-entry',
          track,
          trackGroup: 'Performance Timeline',
          color,
          tooltipText,
        },
      },
    }
    if (end !== undefined) opts.end = end
    window.performance.measure(name, opts)
  } catch {
    // performance.measure with start: 'navigationStart' throws if
    // navigation timing entries are missing (rare; ignore).
  }
}
