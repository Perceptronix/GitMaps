// This module is a partial replacement for the `sicky.ts` module - it extracts out JUST the concept of an
// .is-stuck CSS class which is applied when the element is stuck. This module is designed to be used with a
// sentinel element that has a `data-toggle-sticky-element` attribute, which specifies the elements that should be
// toggled with the `.is-stuck` class when the sentinel is scrolled out of view.

import {observe} from '@github-ui/selector-observer'
import {observeStickyHeaderHeight} from '@github-ui/sticky-css'

let cancelPreviousObserver = () => {}

observeStickyHeaderHeight(baseHeight => {
  cancelPreviousObserver()
  const intersectionObserver = new IntersectionObserver(
    records => {
      for (const record of records) {
        const target = record.target
        let el = target

        if (record.target.hasAttribute('data-toggle-sticky-element')) {
          const elementIds = record.target.getAttribute('data-toggle-sticky-element')?.split(',') || []
          for (const elementId of elementIds) {
            el = document.querySelector(`#${elementId.trim()}`) || target
            el.classList.toggle('is-stuck', record.intersectionRatio < 1)
          }
        } else {
          el.classList.toggle('is-stuck', record.intersectionRatio < 1)
        }
      }
    },
    {threshold: 1, rootMargin: `-${baseHeight + 1}px 0px 100% 0px`}, // Adjust rootMargin to account for base sticky header height
  )

  const observer = observe('.js-toggle-stuck', {
    constructor: HTMLElement,
    add(el) {
      intersectionObserver.observe(el)
    },
    remove(el) {
      intersectionObserver.unobserve(el)
    },
  })

  cancelPreviousObserver = () => {
    intersectionObserver.disconnect()
    observer.abort()
  }
})
