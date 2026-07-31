import {loaded} from '@github-ui/document-ready'
import {getBaseStickyHeaderHeight, setBaseStickyHeaderHeight} from '@github-ui/sticky-css'
import {observe} from '@github-ui/selector-observer'

observe('.js-notification-top-shelf', {
  constructor: HTMLElement,
  add(shelfEl) {
    initializeNotificationShelf(shelfEl)
  },
  remove() {
    if (getBaseStickyHeaderHeight() > 0) {
      setBaseStickyHeaderHeight(0)
    }
  },
})

// Sets the global notificationShelfHeight variable to match a newly rendered shelf
// if required, so that other sticky headers can adjust their position to match.
async function initializeNotificationShelf(shelfEl: HTMLElement) {
  // don't measure the height of a hidden shelf
  if (shelfEl.offsetParent === null) return
  await loaded

  const height = Math.floor(shelfEl.getBoundingClientRect().height)
  if (height > 0) {
    setBaseStickyHeaderHeight(height)
  }
}
