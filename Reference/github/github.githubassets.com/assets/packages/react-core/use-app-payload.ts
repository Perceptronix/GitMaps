import {createContext, use} from 'react'

/**
 * @deprecated `AppPayloadContext` (and the `useAppPayload` hook that consumes it) are being deprecated as app payloads will not be supported in UI Service.
 * Use layout route data instead.
 * See https://thehub.github.com/epd/engineering/dev-practicals/frontend/react/data-router/migration/app-payload-deprecation/
 */
export const AppPayloadContext = createContext<unknown>(undefined)
AppPayloadContext.displayName = 'AppPayloadContext'

/**
 * @deprecated `useAppPayload` is being deprecated as app payloads will not be supported in UI Service.
 * Use layout route data instead.
 * See https://thehub.github.com/epd/engineering/dev-practicals/frontend/react/data-router/migration/app-payload-deprecation/
 */
export function useAppPayload<T>(): T {
  const appPayload = use(AppPayloadContext)

  return appPayload as T
}
