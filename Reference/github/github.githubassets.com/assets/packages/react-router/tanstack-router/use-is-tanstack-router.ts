import {useRouter as useRouterTanStack} from '@tanstack/react-router'

/**
 * Detect if an app is using TanStack Router.
 */
export function useIsTanStackRouter(): boolean {
  // useRouter returns a falsy value when not in a TanStack Router context
  const router = useRouterTanStack({warn: false})
  return !!router
}
