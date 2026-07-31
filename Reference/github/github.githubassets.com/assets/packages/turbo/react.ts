import {updateCurrentState} from '@github-ui/history'
import {LRUMap} from '@github-ui/lru-map'
import {matchRoutes} from '@github-ui/react-router'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {reloadPage} from './reload-page'
import {canRepoSoftNavigate} from './utils'
import {isFeatureEnabled} from '@github-ui/feature-flags'
import isHashNavigation from '@github-ui/is-hash-navigation'
interface ReactApp extends HTMLElement {
  navigate?: (pathname: string) => Promise<void>
  routes?: never[]
  uuid: string
}

export const bfCache = new LRUMap<string, Map<string, Element>>({size: 20})

function replaceTurboElements({idsToRemove, reactApp}: {idsToRemove: string[]; reactApp: ReactApp}) {
  const removedElements = new Map()

  if (idsToRemove.length === 0) {
    reactApp.hidden = false
    return removedElements
  }

  // Batch DOM changes to prevent flash
  requestAnimationFrame(() => {
    reactApp.hidden = false

    for (const elementId of idsToRemove) {
      const element = document.getElementById(elementId)

      if (element) {
        // Replace elements with hidden placeholders so we know where to restore them later
        const placeholder = document.createElement('div')
        placeholder.id = elementId
        placeholder.hidden = true
        element.replaceWith(placeholder)

        removedElements.set(elementId, element)
      }
    }
  })

  return removedElements
}

export function reactNavigateIfPossible(event: TurboClickEvent | TurboFrameClickEvent) {
  if (!(event.target instanceof HTMLElement)) return

  const target = event.target

  const reactAppName = target.getAttribute('data-react-nav')

  if (!reactAppName) return false

  // Try to use React navigation if the react app is loaded
  const reactApp = Array.from(document.querySelectorAll<ReactApp>('react-app')).find(
    app => app.getAttribute('app-name') === reactAppName,
  )

  if (!reactApp) return false

  const anchorId = target.getAttribute('data-react-nav-anchor')

  const firedReactNav = anchorId
    ? clickOnReactAnchor({event, reactApp, anchorId})
    : imperativelyNavigateToReactRoute({event, reactApp})

  if (!firedReactNav) return false

  const idsToRemove = target.getAttribute('data-react-nav-remove')?.split(',') || []

  if (idsToRemove.length === 0) return firedReactNav

  const currentHref = window.location.href
  updateCurrentState({restoreTurboElements: {appName: reactAppName, idsToRestore: idsToRemove}})

  const handleSoftNavEnd = () => {
    updateCurrentState({restoreReactElements: {appName: reactAppName, idsToRemove}})
    const removedElements = replaceTurboElements({idsToRemove, reactApp})

    if (removedElements) bfCache.set(currentHref, removedElements)

    document.removeEventListener(SOFT_NAV_STATE.ERROR, handleSoftNavError)
  }

  const handleSoftNavError = () => {
    document.removeEventListener(SOFT_NAV_STATE.END, handleSoftNavEnd)
  }

  document.addEventListener(SOFT_NAV_STATE.END, handleSoftNavEnd, {once: true})
  document.addEventListener(SOFT_NAV_STATE.ERROR, handleSoftNavError, {once: true})

  return firedReactNav
}

export function repoNavigateIfPossible(event: TurboClickEvent | TurboFrameClickEvent) {
  if (!(event.target instanceof HTMLElement)) return false
  if (isHashNavigation(location.href, event.detail.url)) return false
  if (!isFeatureEnabled('repo_app_turbo')) return false
  if (!canRepoSoftNavigate(event.detail.url)) return false

  const reactApp = document.querySelector<ReactApp>('react-app[app-name="repo"]')

  if (!reactApp) return false

  const firedReactNav = imperativelyNavigateToReactRoute({event, reactApp})

  return firedReactNav
}

function clickOnReactAnchor({
  event,
  anchorId,
}: {
  event: TurboClickEvent | TurboFrameClickEvent
  reactApp: ReactApp
  anchorId: string
}) {
  const anchor = document.getElementById(anchorId) as HTMLAnchorElement | null

  if (!anchor) return false

  anchor.click()
  preventTurboNavigation({event})
  return true
}

function imperativelyNavigateToReactRoute({
  event,
  reactApp,
}: {
  event: TurboClickEvent | TurboFrameClickEvent
  reactApp: ReactApp
}) {
  const url = new URL(event.detail.url, window.location.origin)
  const pathname = url.pathname + url.search + url.hash

  const routes = reactApp.routes
  if (!routes || !Array.isArray(routes) || routes.length === 0) return false

  try {
    // Check if the URL matches any routes in the react app
    const matchedRoutes = matchRoutes(routes, url.pathname)

    if (!matchedRoutes || matchedRoutes.length === 0) {
      // Route is not part of the react app, fall back to Turbo navigation
      return false
    }

    if (!reactApp.navigate) return false

    // NOTE: This code interacts with the router/history directly, which is not officially supported
    // by React Router and could break if the underlying libraries change. As we migrate more toward
    // full React pages, usage of this pattern should decrease. If it does break in the future, we'll
    // fallback to a turbo navigation to avoid impacting user experience.
    reactApp.navigate(pathname)
    preventTurboNavigation({event})
    return true
  } catch {
    return false
  }
}

function preventTurboNavigation({event}: {event: TurboClickEvent | TurboFrameClickEvent}) {
  event.preventDefault() // prevent Turbo navigation
  event.detail.originalEvent?.preventDefault() // prevent the original link click
}

function restoreTurboElements({appName, idsToRestore}: {appName: string; idsToRestore?: string[]}) {
  const reactApp = document.querySelector<HTMLElement>(`react-app[app-name="${appName}"]`)

  const cache = bfCache.get(window.location.href)
  if (!cache && idsToRestore && idsToRestore.length > 0) {
    return reloadPage()
  }

  if (reactApp) reactApp.hidden = true

  if (!cache) return

  requestAnimationFrame(() => {
    // restore Rails cached elements
    for (const [elementId, element] of cache.entries()) {
      const placeholder = document.getElementById(elementId)
      if (placeholder) placeholder.replaceWith(element)
    }
  })
}

ssrSafeWindow?.addEventListener('popstate', ({state}) => {
  if (!state) return

  if (state.restoreTurboElements) {
    return restoreTurboElements(state.restoreTurboElements)
  }

  // Wait for React to render before replacing elements to avoid a blank flash
  if (state.restoreReactElements) {
    document.addEventListener(
      SOFT_NAV_STATE.REACT_DONE,
      () => {
        const reactApp = document.querySelector<ReactApp>(`react-app[app-name="${state.restoreReactElements.appName}"]`)
        if (reactApp) {
          replaceTurboElements({
            idsToRemove: state.restoreReactElements.idsToRemove,
            reactApp,
          })
        }
      },
      {once: true},
    )
  }
})
