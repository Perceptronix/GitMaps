// Dev-only console logger for sendStats and sendCustomMetric calls.
// Uses styled console groups so stat events are easy to scan, filter, and expand in browser DevTools.

const STATS_BADGE_STYLE =
  'background: #1f6feb; color: #fff; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 11px;'
const LABEL_STYLE = 'font-weight: bold; font-size: 12px;'

function formatDuration(ms: number | undefined): string {
  if (ms === undefined || ms === null) return '—'
  const rounded = Math.round(ms)
  if (rounded < 1000) return `${rounded}ms`
  return `${(rounded / 1000).toFixed(2)}s`
}

function durationStyle(ms: number): string {
  if (ms < 200) return 'color: #3fb950; font-weight: bold; font-size: 12px;'
  if (ms < 1000) return 'color: #d29922; font-weight: bold; font-size: 12px;'
  return 'color: #f85149; font-weight: bold; font-size: 12px;'
}

/**
 * Log a sendStats call with a styled collapsed console group.
 */
export function logSendStats(stat: PlatformBrowserStat): void {
  const {category, summary} = getStatSummary(stat)

  // eslint-disable-next-line no-console
  console.groupCollapsed(`%cstat%c ${category}${summary ? ` ${summary}` : ''}`, STATS_BADGE_STYLE, LABEL_STYLE)

  if (stat.webVitalTimings?.length) {
    for (const timing of stat.webVitalTimings) {
      const vitalName =
        timing.lcp !== undefined
          ? 'LCP'
          : timing.fcp !== undefined
            ? 'FCP'
            : timing.ttfb !== undefined
              ? 'TTFB'
              : timing.cls !== undefined
                ? 'CLS'
                : timing.inp !== undefined
                  ? 'INP'
                  : timing.hpc !== undefined
                    ? 'HPC'
                    : timing.elementtiming !== undefined
                      ? 'ElementTiming'
                      : 'Unknown'

      const value =
        timing.lcp ?? timing.fcp ?? timing.ttfb ?? timing.cls ?? timing.inp ?? timing.hpc ?? timing.elementtiming ?? 0

      // eslint-disable-next-line no-console
      console.log(`%c${vitalName}: %c${formatDuration(value)}`, LABEL_STYLE, durationStyle(value))

      // eslint-disable-next-line no-console
      console.table({
        Name: {value: timing.name ?? '—'},
        CPU: {value: timing.cpu ?? '—'},
        SSR: {value: timing.ssr ?? '—'},
        App: {value: timing.app ?? stat.app ?? '—'},
        Soft: {value: timing.soft !== undefined ? String(timing.soft) : '—'},
        Mechanism: {value: timing.mechanism ?? '—'},
        'DOM Nodes': {value: timing.domNodes ?? '—'},
        Synthetic: {value: timing.synthetic ? 'yes' : 'no'},
        ...(timing.inpInteractionType
          ? {
              'INP Interaction': {value: timing.inpInteractionType},
              'INP Event': {value: timing.inpEventType ?? '—'},
              'INP Bottleneck': {value: timing.inpBottleneck ?? '—'},
            }
          : {}),
        ...(timing.lcpBreakdown
          ? {
              'LCP TTFB': {value: formatDuration(timing.lcpBreakdown.ttfb)},
              'LCP FCP': {value: formatDuration(timing.lcpBreakdown.fcp)},
              'LCP Element Render Delay': {value: formatDuration(timing.lcpBreakdown.elementRenderDelay)},
            }
          : {}),
      })
    }
  }

  if (stat.navigationTimings?.length) {
    // eslint-disable-next-line no-console
    console.table(
      stat.navigationTimings.map(t => ({
        Name: t.name,
        Duration: formatDuration(t.duration),
        'DOM Interactive': formatDuration(t.domInteractive),
        'DOM Complete': formatDuration(t.domComplete),
        'Load Event': formatDuration(t.loadEventEnd),
        Type: t.type ?? '—',
      })),
    )
  }

  if (stat.resourceTimings?.length) {
    // eslint-disable-next-line no-console
    console.table(
      stat.resourceTimings.map(t => ({
        Name: t.name,
        Duration: formatDuration(t.duration),
        Type: t.initiatorType ?? '—',
        Size: t.transferSize ?? '—',
      })),
    )
  }

  if (stat.longAnimationFrames?.length) {
    // eslint-disable-next-line no-console
    console.table(
      stat.longAnimationFrames.map(t => ({
        Name: t.name,
        Duration: formatDuration(t.duration),
        'Blocking Duration': formatDuration(t.blockingDuration),
      })),
    )
  }

  if (stat.longTasks?.length) {
    // eslint-disable-next-line no-console
    console.table(
      stat.longTasks.map(t => ({
        Name: t.name,
        Duration: formatDuration(t.duration),
      })),
    )
  }

  if (stat.customMetric) {
    // eslint-disable-next-line no-console
    console.table({
      Name: {value: stat.customMetric.name},
      Value: {value: stat.customMetric.value},
      Type: {value: stat.customMetric.type ?? '—'},
      ...(stat.customMetric.tags
        ? Object.fromEntries(Object.entries(stat.customMetric.tags).map(([k, v]) => [k, {value: v}]))
        : {}),
    })
  }

  if (stat.incrementKey) {
    // eslint-disable-next-line no-console
    console.table({
      Key: {value: stat.incrementKey},
      ...(stat.incrementTags
        ? Object.fromEntries(Object.entries(stat.incrementTags).map(([k, v]) => [k, {value: v}]))
        : {}),
    })
  }

  if (stat.distributionKey) {
    // eslint-disable-next-line no-console
    console.table({
      Key: {value: stat.distributionKey},
      Value: {value: stat.distributionValue ?? '—'},
      ...(stat.distributionTags ? Object.fromEntries(stat.distributionTags.map(t => [t, {value: t}])) : {}),
    })
  }

  // eslint-disable-next-line no-console
  console.groupEnd()
}

function getStatSummary(stat: PlatformBrowserStat): {category: string; summary: string} {
  if (stat.webVitalTimings?.length) return {category: 'webVitalTimings', summary: ''}
  if (stat.navigationTimings?.length) return {category: 'navigationTimings', summary: ''}
  if (stat.resourceTimings?.length) return {category: `resourceTimings (${stat.resourceTimings.length})`, summary: ''}
  if (stat.longAnimationFrames?.length) return {category: 'longAnimationFrames', summary: ''}
  if (stat.longTasks?.length) return {category: 'longTasks', summary: ''}
  if (stat.customMetric) {
    return {category: `customMetric:${stat.customMetric.name}`, summary: String(Math.round(stat.customMetric.value))}
  }
  if (stat.incrementKey) return {category: `increment:${stat.incrementKey}`, summary: ''}
  if (stat.distributionKey) {
    return {
      category: `distribution:${stat.distributionKey}`,
      summary: stat.distributionValue !== undefined ? String(Math.round(stat.distributionValue)) : '',
    }
  }
  return {category: 'stat', summary: ''}
}
