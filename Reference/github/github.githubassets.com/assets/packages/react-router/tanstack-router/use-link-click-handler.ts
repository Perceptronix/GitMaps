import {useCallback, type MouseEvent, type HTMLAttributeAnchorTarget} from 'react'
import {useNavigate, type To} from './use-navigate'

/**
 * Returns a click handler that navigates using TanStack Router.
 */
export function useLinkClickHandler<E extends Element = HTMLAnchorElement>(
  to: To,
  options?: {replace?: boolean; state?: unknown; target?: HTMLAttributeAnchorTarget},
) {
  const navigate = useNavigate()
  const {replace, state, target} = options || {}

  return useCallback(
    (event: MouseEvent<E>) => {
      if (shouldProcessLinkClick(event, target)) {
        event.preventDefault()
        navigate(to, {replace, state})
      }
    },
    [navigate, to, replace, state, target],
  )
}

/**
 * A copy of react-router's internal shouldProcessLinkClick function to ensure consistent behavior with their useLinkClickHandler.
 * https://github.com/remix-run/react-router/blob/00cb4d7b310663b2e84152700c05d3b503005e83/packages/react-router/lib/dom/dom.ts#L34C1-L43C2
 */
function shouldProcessLinkClick<E extends Element = HTMLAnchorElement>(
  mouseEvent: React.MouseEvent<E>,
  target?: string,
) {
  return (
    mouseEvent.button === 0 && // Ignore everything but left clicks
    (!target || target === '_self') && // Let browser handle "target=_blank" etc.
    !(mouseEvent.metaKey || mouseEvent.altKey || mouseEvent.ctrlKey || mouseEvent.shiftKey) // Ignore clicks with modifier keys
  )
}
