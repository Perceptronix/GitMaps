import {useLocation, useNavigation} from '@github-ui/react-router'
import {memo} from 'react'

import {useSoftNavLifecycle} from '../use-soft-nav-lifecycle'

/**
 * We start the soft nav in the loader and finish it in the router.
 * The soft nav events start via startSoftNav when the loader is called
 * with the request in QueryRoute.
 *
 * SoftNavLifecycleListener is a component that listens to the soft nav
 * lifecycle and finishes the operation when complete.
 */
// eslint-disable-next-line @typescript-eslint/no-shadow -- named function expression intentionally shares the outer name
export const SoftNavLifecycleListener = memo(function SoftNavLifecycleListener() {
  const location = useLocation()
  const navigation = useNavigation()

  // For data router, we only need to wait for router navigation to complete
  const isNavigating = Boolean(navigation.location)

  useSoftNavLifecycle(location, isNavigating, null)
  return null
})

// eslint-disable-next-line @typescript-eslint/no-shadow -- named function expression intentionally shares the outer name
export const SoftNavLifecycleListenerLegacy = memo(function SoftNavLifecycleListenerLegacy() {
  const location = useLocation()
  useSoftNavLifecycle(location, false, null)
  return null
})
