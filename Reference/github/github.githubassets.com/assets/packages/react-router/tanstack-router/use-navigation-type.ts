import type {HistoryAction, RouterHistory} from '@tanstack/history'
import {useRouter, useRouterState} from '@tanstack/react-router'
import {useState, useEffect} from 'react'

type ReactRouterNavigationType = 'POP' | 'PUSH' | 'REPLACE'

export function toReactRouterNavigationType(actionType: HistoryAction): ReactRouterNavigationType {
  switch (actionType) {
    case 'PUSH':
    case 'REPLACE':
      return actionType
    case 'BACK':
    case 'FORWARD':
    case 'GO':
      return 'POP'
  }
}

export function useNavigationType(): ReactRouterNavigationType {
  const router = useRouter()
  const [navigationType, setNavigationType] = useState<ReactRouterNavigationType>('POP')
  const [lastVisibleNavigationType, setLastVisibleNavigationType] = useState<ReactRouterNavigationType>(navigationType)
  const isPendingPathnameChange = useRouterState({
    select: s => {
      const resolved = s.resolvedLocation ?? s.location
      return s.location.pathname !== resolved.pathname
    },
    structuralSharing: true,
  })

  useEffect(() => {
    const unsubscribe = (router.history as RouterHistory).subscribe(({action}) => {
      setNavigationType(toReactRouterNavigationType(action.type))
    })
    return unsubscribe
  }, [router])

  // Keep the action aligned with the location shim: same-path navigations can expose
  // the pending action immediately, but cross-path navigations should hold the last
  // visible action until the resolved location catches up.
  if (!isPendingPathnameChange && lastVisibleNavigationType !== navigationType) {
    setLastVisibleNavigationType(navigationType)
  }

  return isPendingPathnameChange ? lastVisibleNavigationType : navigationType
}
