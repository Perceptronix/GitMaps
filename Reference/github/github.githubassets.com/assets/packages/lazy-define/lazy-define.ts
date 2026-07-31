import {lazyDefine as lazyDefineObserver} from '@github/catalyst'
import {isFeatureEnabled} from '@github-ui/feature-flags'

import {lazyDefineNative} from './lazy-define-native'

type Loader = () => Promise<unknown>

// The native path relies on constructable stylesheets adopted onto the document.
// Feature-detect once so that, even with the flag on, browsers without support
// fall back to the catalyst observer rather than hard-failing.
let supported: boolean | undefined
function nativeDetectionSupported(): boolean {
  if (supported === undefined) {
    supported =
      typeof document !== 'undefined' &&
      typeof CSSStyleSheet === 'function' &&
      'adoptedStyleSheets' in Document.prototype &&
      'replaceSync' in CSSStyleSheet.prototype
  }
  return supported
}

// Reading the client env throws if it has not been loaded yet. In SSR this module
// is replaced by the `@github-ui/lazy-define` shim (see packages/ssr-shims), so it
// never runs there; this guard covers other uninitialized-env cases (e.g. a
// Storybook story without the env set up), treating any failure as "flag off" and
// falling back to the catalyst observer rather than crashing module evaluation.
function nativeFlagEnabled(): boolean {
  try {
    return isFeatureEnabled('catalyst_lazy_define_native')
  } catch {
    return false
  }
}

/**
 * Drop-in replacement for catalyst's `lazyDefine` that swaps the underlying
 * detection strategy behind the `catalyst_lazy_define_native` feature flag.
 *
 * When enabled (and supported), element detection is handled by the browser's
 * style engine (see `lazy-define-native`) instead of a document-wide
 * MutationObserver, which avoids scanning every DOM mutation on large,
 * churn-heavy pages. Supports both catalyst call forms.
 */
export function lazyDefine(tagName: string, loader: Loader): void
export function lazyDefine(definitions: Record<string, Loader>): void
export function lazyDefine(tagNameOrDefinitions: string | Record<string, Loader>, loader?: Loader): void {
  let definitions: Record<string, Loader>
  if (typeof tagNameOrDefinitions === 'string') {
    if (!loader) return
    definitions = {[tagNameOrDefinitions]: loader}
  } else {
    definitions = tagNameOrDefinitions
  }

  // `nativeDetectionSupported()` first so that SSR (no `document`) short-circuits
  // before the client env is ever read.
  if (nativeDetectionSupported() && nativeFlagEnabled()) {
    lazyDefineNative(definitions)
  } else {
    lazyDefineObserver(definitions)
  }
}
