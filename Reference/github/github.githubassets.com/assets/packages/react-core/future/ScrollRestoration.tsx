import {type GetScrollRestorationKeyFunction, ScrollRestoration} from '@github-ui/react-router'

import {installScrollRestoration, useScrollRestoration} from '../use-scroll-restoration'

installScrollRestoration()

export function CombinedScrollRestoration() {
  // This hook restores turbo-scroll-restoration only on initial render because of the useLayoutEffect.
  // This only happens when you navigate from a turbo link to a react link.
  useScrollRestoration()

  // In some tests the scroll restoration causes an unexpected delay in jsdom that leads to flakes, so we don't render it there.
  if (typeof jest !== 'undefined') return null

  return <ScrollRestoration getKey={scrollRestorationKeyFn} />
}

/**
 * Scroll restoration key function that includes hash and search params.
 *
 * Including hash means each line anchor (e.g., #L10, #L50) gets a unique scroll entry,
 * preventing ScrollRestoration from overwriting browser's native hash scroll.
 */
export const scrollRestorationKeyFn: GetScrollRestorationKeyFunction = location => {
  return location.pathname + location.search + location.hash
}
