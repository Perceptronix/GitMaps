// eslint-disable-next-line @github-ui/github-monorepo/prefer-github-ui-react-router
import {type To, createPath} from 'react-router'
import {useCallback, useEffect, useRef, useState} from 'react'
import {DEFAULT_INTENT_PRELOAD_DELAY, type PreloadProps} from '../shared'
import {usePreloadRoute} from './use-preload-route'
import {observeForViewportPreload} from './shared-viewport-observer'

const timeoutMap = new WeakMap<EventTarget, ReturnType<typeof setTimeout>>()

const EMPTY_PROPS = {}

// based on https://github.com/TanStack/router/blob/24cc08f87e954f2f2f891cf6870349553c9d4eb0/packages/react-router/src/link.tsx#L43
export function useLinkPreloadProps({
  to,
  preload = false,
  disabled,
  preloadDelay = DEFAULT_INTENT_PRELOAD_DELAY,
}: {
  to: To
  disabled: boolean
} & PreloadProps) {
  const preloadRoute = usePreloadRoute()
  const href = typeof to === 'string' ? to : createPath(to)

  const doPreload = useCallback(() => {
    preloadRoute(href)
  }, [preloadRoute, href])

  // Render preload — fire once when the link mounts (or when href changes).
  const hasRenderFetchedRef = useRef(false)
  useEffect(() => {
    if (disabled || preload !== 'render') return
    if (hasRenderFetchedRef.current) return
    hasRenderFetchedRef.current = true
    doPreload()
  }, [disabled, preload, doPreload])

  // Viewport preload — fire when the link enters the viewport via IntersectionObserver.
  const [viewportNode, setViewportNode] = useState<Element | null>(null)

  useEffect(() => {
    if (disabled || preload !== 'viewport' || !viewportNode) return
    return observeForViewportPreload(viewportNode, doPreload)
  }, [disabled, preload, doPreload, viewportNode])

  if (disabled || preload === false) {
    return EMPTY_PROPS
  }

  if (preload === 'render') {
    return EMPTY_PROPS
  }

  if (preload === 'viewport') {
    return {ref: setViewportNode}
  }

  // When intent preload is enabled, we fire the preload after a short delay when the user hovers or focuses the link.
  // If the user leaves the link before the delay is up, we cancel the preload.
  const enqueueIntentPreload = (e: React.MouseEvent | React.FocusEvent) => {
    if (preload !== 'intent') return

    if (!preloadDelay) {
      doPreload()
      return
    }

    const eventTarget = e.currentTarget

    if (timeoutMap.has(eventTarget)) {
      return
    }

    const id = setTimeout(() => {
      timeoutMap.delete(eventTarget)
      doPreload()
    }, preloadDelay)
    timeoutMap.set(eventTarget, id)
  }

  // Touchstart prefetches immediately since it's a clear signal of user intent.
  const handleTouchStart = () => {
    if (preload !== 'intent') return
    doPreload()
  }

  // Clear the timeout when the user leaves the link or blurs it before the preload delay is up.
  const handleLeave = (e: React.MouseEvent | React.FocusEvent) => {
    if (!preload || !preloadDelay) return
    const eventTarget = e.currentTarget
    const id = timeoutMap.get(eventTarget)
    if (id) {
      clearTimeout(id)
      timeoutMap.delete(eventTarget)
    }
  }

  return {
    onMouseEnter: enqueueIntentPreload,
    onFocus: enqueueIntentPreload,
    onTouchStart: handleTouchStart,
    onMouseLeave: handleLeave,
    onBlur: handleLeave,
  }
}
