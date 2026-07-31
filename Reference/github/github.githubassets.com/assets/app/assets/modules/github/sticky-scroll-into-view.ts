import {findFragmentTarget} from './fragment-target'
import {getBaseStickyHeaderHeight} from '@github-ui/sticky-css'
import {getObservedHeaderHeight} from './behaviors/sticky-header-height-observer'
import {loaded} from '@github-ui/document-ready'

// Scroll element into view accounting for sticky/fixed overlays.
export async function scrollIntoView(el: Element | HTMLElement) {
  if (el.hasAttribute('data-ignore-sticky-scroll')) {
    // Some elements already take sticky headers into account, and can scroll themselves properly
    return
  }

  const document = el.ownerDocument
  if (document && document.defaultView) {
    await loaded
    el.scrollIntoView()
    const secondaryStickyHeader = document.querySelector('.secondary-sticky-header')
    if (secondaryStickyHeader) {
      // Additional scroll prevents linked elements from being covered by secondary sticky headers
      // i.e the sticky file header in the legacy PR files changed view
      document.defaultView.scrollBy(0, -computeFixedYOffset() - secondaryStickyHeader.clientHeight)
    } else {
      document.defaultView.scrollBy(0, -computeFixedYOffset())
    }
  }
}

// Scroll to fragment target element accounting for sticky/fixed
// overlays.
export function scrollToFragmentTarget(document: Document) {
  const target = findFragmentTarget(document)
  if (target) {
    scrollIntoView(target)
  }
}

// Compute height of visible sticky/fixed overlay on page.
export function computeFixedYOffset(): number {
  return getBaseStickyHeaderHeight() + getObservedHeaderHeight()
}
