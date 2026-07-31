import {session} from '@github/turbo'

interface ProgressBar {
  setValue(n: number): void
  hide(): void
  show(): void
}

export interface BrowserAdapter {
  progressBar: ProgressBar
}

const adapter = session.adapter as typeof session.adapter & BrowserAdapter

let progressBarDelay: ReturnType<typeof setTimeout> | null = null

/**
 * Attribute set on the progress bar element itself to opt it into compositor-only
 * `transform: scaleX()` rendering (see hx_turbo-progress-bar.scss). Tagging the element
 * directly (rather than a class on `<html>`) keeps style invalidation scoped to the
 * single bar instead of the document root.
 */
const RENDER_MODE_ATTRIBUTE = 'data-render-mode'

/**
 * This delay of 99ms is just under our 100ms INP goal
 * https://thehub.github.com/epd/engineering/fundamentals/performance-web-performance/#what-to-look-for
 */
const delay = 99

/**
 * Start the ProgressBar at the top of the page after a 99ms delay.
 * This delay is long enough that very quick interactions will not show the progress bar, making them feel snappier,
 * but it will show for interactions that take longer than 100ms, rescuing INP responsiveness.
 */
export const beginProgressBar = () => {
  progressBarDelay = setTimeout(() => {
    adapter.progressBar.setValue(0)
    adapter.progressBar.show()
    // Turbo reuses a single bar element for the page's lifetime, so tag it once and
    // skip the redundant attribute write (and its style invalidation) on later navigations.
    const bar = document.querySelector('.turbo-progress-bar')
    if (bar && !bar.hasAttribute(RENDER_MODE_ATTRIBUTE)) {
      bar.setAttribute(RENDER_MODE_ATTRIBUTE, 'transform')
    }
  }, delay)
}

/**
 * Complete the ProgressBar at the top of the page.
 */
export const completeProgressBar = () => {
  if (progressBarDelay !== null) {
    clearTimeout(progressBarDelay)
    progressBarDelay = null
  }
  adapter.progressBar.setValue(1)
  adapter.progressBar.hide()
}
