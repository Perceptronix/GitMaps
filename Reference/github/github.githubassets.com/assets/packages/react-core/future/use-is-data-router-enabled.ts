import {use} from 'react'

import {IsDataRouterEnabledContext} from './IsDataRouterEnabled'

export function useIsDataRouterEnabled() {
  return use(IsDataRouterEnabledContext)
}
