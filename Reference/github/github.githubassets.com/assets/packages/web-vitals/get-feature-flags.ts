import {getEnabledFeatures, isFeatureEnabled} from '@github-ui/feature-flags'

interface ReactApp extends Element {
  enabledFeatures: string[]
}

export function getFeatureFlags(): string[] {
  const globalFlags = getEnabledFeatures()
  const reactAppFlags = document.querySelector<ReactApp>('react-app')?.enabledFeatures || []
  // need to manually check for speculation_rules otherwise it will get minified away
  const speculationRulesFlag = isFeatureEnabled('speculation_rules') ? ['speculation_rules'] : []

  return Array.from(new Set([...globalFlags, ...reactAppFlags, ...speculationRulesFlag]))
}
