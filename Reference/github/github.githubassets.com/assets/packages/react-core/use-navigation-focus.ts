import {type Location, type NavigationType, PREVENT_AUTOFOCUS_KEY} from '@github-ui/react-router'
import {useEffect, useRef} from 'react'

export function useNavigationFocus(isLoading: boolean, location: Location, action?: NavigationType) {
  // focus on navigations:
  const lastFocusedPathRef = useRef<string | undefined>(undefined)
  const stateRef = useRef(location.state)
  useEffect(() => {
    stateRef.current = location.state
  })
  useEffect(() => {
    // If we're popping state (i.e. Forward or Backward), we don't want to focus
    if (action === 'POP') {
      return
    }
    // we don't want to focus when only the hash changes
    const currentPath = location.pathname + location.search
    // initially this is undefined because we don't want to focus on the initial page load
    if (lastFocusedPathRef.current === undefined) {
      lastFocusedPathRef.current = currentPath
    } else if (lastFocusedPathRef.current !== currentPath) {
      if (!isLoading) {
        if (!autofocusPrevented(stateRef.current)) {
          let focusElement = document.querySelector<HTMLElement>('[data-react-autofocus]')
          if (!focusElement) {
            focusElement = document.querySelector<HTMLElement>('react-app h1')
            if (focusElement && !focusElement.hasAttribute('tabindex')) {
              focusElement.setAttribute('tabindex', '-1')
            }
          }
          focusElement?.focus()
        }

        lastFocusedPathRef.current = currentPath
      }
    }
  }, [isLoading, location.pathname, location.search, action])
}

function autofocusPrevented(state: unknown) {
  return (
    typeof state === 'object' &&
    state !== null &&
    PREVENT_AUTOFOCUS_KEY in state &&
    state[PREVENT_AUTOFOCUS_KEY] === true
  )
}
