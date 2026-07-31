import {useAppPayload} from './use-app-payload'

export type AppPayloadWithFeatureFlags = {enabled_features?: EnabledFeatures}
export type EnabledFeatures = {[key: string]: boolean | undefined}

/**
 * @deprecated `useFeatureFlags` is being deprecated as app payloads will not be supported in UI Service.
 * For an equivalent "list of enabled flags, use `getEnabledFeatures` from `@github-ui/feature-flags`.
 * For checking a single flag, use `isFeatureEnabled` from `@github-ui/feature-flags` instead.
 * See https://thehub.github.com/epd/engineering/dev-practicals/frontend/react/data-router/migration/app-payload-deprecation/
 *
 * Fetches all client side feature flags.
 *
 * Note: If your app isn't rendered in the monolith using the registerNavigatorApp function,
 * you can use the FeatureFlagProvider to wrap your app in a context and populate the
 * client side feature flags yourself.
 */
export const useFeatureFlags = () => useAppPayload<AppPayloadWithFeatureFlags>()?.enabled_features ?? {}

/**
 * @deprecated `useFeatureFlag` is being deprecated as app payloads will not be supported in UI Service.
 * Use `isFeatureEnabled` from `@github-ui/feature-flags` instead.
 * See https://thehub.github.com/epd/engineering/dev-practicals/frontend/react/data-router/migration/app-payload-deprecation/
 *
 * Fetches a specific client side feature flag.
 *
 * Note: If your app isn't rendered in the monolith using the registerNavigatorApp function,
 * you can use the FeatureFlagProvider to wrap your app in a context and populate the
 * client side feature flags yourself.
 */
/* eslint-disable-next-line @github-ui/github-monorepo/no-use-feature-flags --
   TODO: Migrate to isFeatureEnabled from @github-ui/feature-flags. See
   https://thehub.github.com/epd/engineering/dev-practicals/frontend/react/data-router/migration/app-payload-deprecation/ */
export const useFeatureFlag = (featureName: string) => !!useFeatureFlags()[featureName]
