import {isFeatureEnabled} from '@github-ui/feature-flags'

import {DeferredRegistry} from '../deferred-registry'
import type {DataRouterApplication} from './data-router-application'

export type DataRouterAppRegistrationFn = DataRouterApplication<string>['registration']
export type DataRouterAppTanStackRouterEnabled = DataRouterApplication<string>['tanStackRouterEnabled']

export type DataRouterAppRegistrationObject = {
  type: 'DataRouterApp'
  registration: DataRouterAppRegistrationFn
  tanStackRouterEnabled: DataRouterAppTanStackRouterEnabled
}

export function isTanStackRouterEnabled(appTanStackRouterEnabled: DataRouterAppTanStackRouterEnabled): boolean {
  const globalTSREnabled = isFeatureEnabled('react_data_router_tanstack_allowed')
  const appTSREnabled =
    typeof appTanStackRouterEnabled === 'boolean' ? appTanStackRouterEnabled : appTanStackRouterEnabled()
  return globalTSREnabled && appTSREnabled
}

export function createDataRouterAppRegistration(
  registration: DataRouterAppRegistrationFn,
  tanStackRouterEnabled: DataRouterAppTanStackRouterEnabled,
): DataRouterAppRegistrationObject {
  return {
    type: 'DataRouterApp',
    registration,
    tanStackRouterEnabled,
  }
}

export const reactDataRouterAppDeferredRegistry = new DeferredRegistry<DataRouterAppRegistrationObject>()

export async function getReactDataRouterApp(appName: string) {
  return reactDataRouterAppDeferredRegistry.getRegistration(appName).promise
}
