// Observes the height of a sticky header element and publishes it as a CSS variable.
//
// This is intended to be used by "second layer" sticky headers, so that a third sticky header can properly stack
// below it. We currently only support up to three layers of sticky headers, with the first layer being reserved for
// the notification shelf.
//
// An example of second + third layer stacking sticky headers: the pull request toolbar + sticky file headers on the
// pull request files changed view:
// https://github.com/github/github/blob/master/app/views/pull_requests/files.html.erb
// https://github.com/github/github/blob/1848e3248678f396b76d8c35e613aafad5c9c9cd/app/assets/stylesheets/bundles/github/files.scss#L151
//
// The actual sticky header behavior is handled by native CSS `position: sticky` in simple cases, and with
// `toggle-stuck.ts` for more complex cases.
//
// Usage:
// 1. Add the class `.js-observe-sticky-header-height` to the sticky header element.
// 2. Use the variable in CSS: `top: var(--observed-header-height);` or similar to offset following content.

import {observe} from '@github-ui/selector-observer'

let observedHeaderHeight = 0
let lastAnimationFrame: number

const resizeObserver = new ResizeObserver(records => {
  for (const record of records) {
    const target = record.target
    if (target instanceof HTMLElement) {
      const doc = target.ownerDocument.documentElement
      const newHeight = target.clientHeight
      if (newHeight !== observedHeaderHeight) {
        if (lastAnimationFrame) {
          cancelAnimationFrame(lastAnimationFrame)
        }
        lastAnimationFrame = requestAnimationFrame(() => {
          doc.style.setProperty('--observed-header-height', `${newHeight}px`)
          observedHeaderHeight = newHeight
        })
      }
    }
  }
})

observe('.js-observe-sticky-header-height', {
  constructor: HTMLElement,
  add(el) {
    resizeObserver.observe(el)
  },
})

export function getObservedHeaderHeight() {
  return observedHeaderHeight
}
