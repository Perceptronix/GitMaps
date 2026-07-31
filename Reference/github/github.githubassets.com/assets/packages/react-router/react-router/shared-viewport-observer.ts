// A single IntersectionObserver shared across all viewport-preload links to avoid
// the overhead of creating one observer per link.

const VIEWPORT_INTERSECTION_OBSERVER_OPTIONS: IntersectionObserverInit = {
  rootMargin: '100px',
}

let sharedViewportObserver: IntersectionObserver | undefined
const viewportCallbacks = new WeakMap<Element, () => void>()

function getSharedViewportObserver(): IntersectionObserver | undefined {
  if (typeof IntersectionObserver === 'undefined') return undefined
  if (!sharedViewportObserver) {
    sharedViewportObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const callback = viewportCallbacks.get(entry.target)
        if (callback) {
          viewportCallbacks.delete(entry.target)
          sharedViewportObserver?.unobserve(entry.target)
          callback()
        }
      }
    }, VIEWPORT_INTERSECTION_OBSERVER_OPTIONS)
  }
  return sharedViewportObserver
}

export function observeForViewportPreload(node: Element, callback: () => void): () => void {
  const observer = getSharedViewportObserver()
  if (!observer) return () => {}
  viewportCallbacks.set(node, callback)
  observer.observe(node)
  return () => {
    viewportCallbacks.delete(node)
    observer.unobserve(node)
  }
}

// For tests only: drop the cached singleton so a freshly mocked IntersectionObserver
// can be installed between test cases.
export function __resetSharedViewportObserverForTests() {
  sharedViewportObserver = undefined
}
