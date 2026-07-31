import {useBlocker as useBlockerTanStack, type ShouldBlockFn} from '@tanstack/react-router'

type ShouldBlockFnArgs = {
  currentLocation: {pathname: string}
  nextLocation: {pathname: string}
}

/**
 * Adapt TanStack Router's useBlocker to the react-router interface.
 */
export function useBlocker(shouldBlock: boolean | ((args: ShouldBlockFnArgs) => boolean)) {
  const blockerFn: ShouldBlockFn =
    typeof shouldBlock === 'boolean'
      ? () => shouldBlock
      : ({current, next}) =>
          shouldBlock({
            currentLocation: {pathname: current.pathname},
            nextLocation: {pathname: next.pathname},
          })

  const {status, next, proceed, reset} = useBlockerTanStack({
    shouldBlockFn: blockerFn,
    withResolver: true,
    /**
     * React Router has a distinct useBeforeUnload hook for this, so we disable it in the TSR shim for parity.
     */
    enableBeforeUnload: false,
  })

  if (status === 'blocked') {
    const location = {
      search: '',
      pathname: next.pathname,
      hash: '',
      state: {},
      key: 'default',
    }
    return {
      state: 'blocked' as const,
      proceed,
      reset,
      location,
    }
  }

  return {state: 'unblocked' as const}
}
