import type {Position} from '@github/turbo/dist/types/core/types'
import {noop} from '@github-ui/noop'
import {ssrSafeLocation, ssrSafeWindow} from '@github-ui/ssr-utils'
import {useLayoutEffect} from 'react'

const scrollMap = new Map<string, Position>()

let installed = false
let previousHref = ssrSafeLocation.href

async function saveScrollPosition() {
  const {session} = await import('@github/turbo')

  document.addEventListener('turbo:click', event => {
    previousHref = event.detail.url
  })

  window.addEventListener('popstate', event => {
    const destinationIdentifier = event.state?.turbo?.restorationIdentifier
    if (!destinationIdentifier) return
    const sessionIdentifier = session.history.restorationIdentifier
    const sessionIsStale = destinationIdentifier !== sessionIdentifier

    if (sessionIsStale) {
      // A stale session means Turbo visit restoration was skipped, and we should manually synchronize the session with the URL.
      //
      // Before we do, ensure a final scroll position is recorded for the last session identifier.
      // This is typically only necessary when no scroll events were emitted and scroll is at the top (0, 0).
      // If we don't do this, then forward/back navigations won't restore scroll correctly.
      // When Turbo visit restoration is active, Turbo handles the missing scroll position internally with
      // a similar fallback: https://github.com/github/turbo/blob/9ce5af90defbb352d13fd16088d16258695cd9d0/src/core/drive/visit.ts#L396-L400
      const {scrollPosition} = session.history.getRestorationDataForIdentifier(sessionIdentifier)
      if (!scrollPosition) {
        session.history.updateRestorationData({scrollPosition: {x: window.scrollX, y: window.scrollY}})
      }
      session.history.location = new URL(window.location.href, window.location.origin)
      session.history.restorationIdentifier = destinationIdentifier
    }

    const {scrollPosition} = session.history.getRestorationDataForIdentifier(destinationIdentifier)

    if (!scrollPosition) return
    scrollMap.set(window.location.href, scrollPosition)
  })
}

export async function installScrollRestoration() {
  if (ssrSafeWindow) {
    if (installed) return
    await saveScrollPosition()
    installed = true
  }
}

function useScrollRestorationInBrowser() {
  useLayoutEffect(() => {
    const href = window.location.href

    // When clicking on the same hash link, don't restore scroll
    if (href === previousHref && href.includes('#')) {
      previousHref = href
      return
    }

    // Skip restoration for hash-only navigations (same pathname, different/new hash).
    // This prevents interfering with virtualized scroll-to-line behavior.
    if (isHashOnlyChange(previousHref, href)) {
      previousHref = href
      return
    }

    previousHref = href

    const scroll = scrollMap.get(href)

    if (!scroll) return
    const timeout = requestAnimationFrame(() => {
      window.scrollTo(scroll.x, scroll.y)
    })
    return () => {
      cancelAnimationFrame(timeout)
    }
  })
}

export function clear() {
  scrollMap.clear()
  installed = false
  previousHref = ssrSafeLocation.href
}
/**
 * This hook restores turbo-scroll-restoration position AFTER the page has been rendered.
 * Otherwise, turbo was restoring scroll on the page before react had rendered.
 */
export const useScrollRestoration = ssrSafeWindow ? useScrollRestorationInBrowser : noop

/**
 * Checks if the navigation is a hash-to-hash change (same path and search, both have hashes).
 * This is used to skip scroll restoration when navigating between line anchors on the same page,
 * which allows the virtualized code view to scroll to the correct line without interference.
 * We only skip when both URLs have hashes to allow restoration when navigating from a hashless URL.
 */
function isHashOnlyChange(prevHref: string, newHref: string): boolean {
  try {
    const prevUrl = new URL(prevHref, window.location.origin)
    const newUrl = new URL(newHref, window.location.origin)

    // Only skip for hash-to-hash navigation (both have hashes and they're different)
    return (
      prevUrl.pathname === newUrl.pathname &&
      prevUrl.search === newUrl.search &&
      prevUrl.hash !== '' &&
      newUrl.hash !== '' &&
      prevUrl.hash !== newUrl.hash
    )
  } catch {
    return false
  }
}
