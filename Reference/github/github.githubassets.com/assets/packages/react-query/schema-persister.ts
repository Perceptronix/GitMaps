import type {DescMessage} from '@github-ui/dotcom-schema/protobuf'
import {createProtoPersister, type RoutePersisterConfig} from '@github-ui/react-query-persister'
import type {SendAnalyticsEventFunction} from '@github-ui/use-analytics'
import type {queryOptions} from '@tanstack/react-query'

export type TanstackPersister = NonNullable<Parameters<typeof queryOptions>[0]['persister']>

export type RoutePersister = TanstackPersister | RoutePersisterConfig

export function isPersisterConfig(persister: RoutePersister | undefined): persister is RoutePersisterConfig {
  return typeof persister === 'object'
}

export function resolvePersister({
  schema,
  persister,
  sendAnalyticsEvent,
}: {
  schema?: DescMessage
  persister?: RoutePersister
  sendAnalyticsEvent: SendAnalyticsEventFunction
}): TanstackPersister | undefined {
  if (isPersisterConfig(persister)) {
    if (!schema) return undefined
    return createProtoPersister({...persister, schema, sendAnalyticsEvent})
  }

  return persister
}
