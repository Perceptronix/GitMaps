// Favicon manager
//
// Manages light and dark favicon variations, and handles status,
// showing a ✕, check, or pending dot over depending on the page status
import {observe} from '@github-ui/selector-observer'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {resetFavicon, syncFaviconToTheme, updateFaviconByHref} from '@github-ui/favicon'

observe('[data-favicon-override]', {
  add(el) {
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    const href = el.getAttribute('data-favicon-override')!

    // allow `remove` for the old element to fire first
    setTimeout(() => updateFaviconByHref(href))
  },
  remove() {
    resetFavicon()
  },
})

syncFaviconToTheme()

document.addEventListener(SOFT_NAV_STATE.SUCCESS, syncFaviconToTheme)

window.matchMedia('(prefers-color-scheme: dark)').addListener(() => {
  syncFaviconToTheme()
})
