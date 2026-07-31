// Installs observer to account for sticky/fixed overlay offsets when navigating
// to a fragment.
import {computeFixedYOffset, scrollToFragmentTarget} from '../sticky-scroll-into-view'
import hashChange from './hash-change'
import {on} from 'delegated-events'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'

function scrollTargetIntoViewIfNeeded() {
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const root = document.firstElementChild! as HTMLHtmlElement
  if (root.classList.contains('js-skip-scroll-target-into-view')) return

  if (computeFixedYOffset()) {
    scrollToFragmentTarget(document)
  }
}

hashChange(scrollTargetIntoViewIfNeeded)

on('click', 'a[href^="#"]', function (event) {
  const {currentTarget} = event
  if (!(currentTarget instanceof HTMLAnchorElement)) return

  // this defers the execution of scrollTargetIntoViewIfNeeded until after all the click stuff happened, including after scroll
  setTimeout(scrollTargetIntoViewIfNeeded, 0)
})

// After a soft navigation, scroll to the fragment target if there is one.
// Turbo frame navigations restore the hash in the URL but don't scroll to it.
if (typeof document !== 'undefined') {
  document.addEventListener(SOFT_NAV_STATE.SUCCESS, () => {
    scrollToFragmentTarget(document)
  })
}
