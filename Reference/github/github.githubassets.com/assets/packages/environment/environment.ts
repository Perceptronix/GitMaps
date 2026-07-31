// Failbot needs to load first so we get errors from system lite.
import '@github-ui/failbot/failbot-error'

import '@github/arianotify-polyfill'
import {apply} from '@github/browser-support'

import applyFetchPatch from '@github-ui/fetch-patch'
import {applyRemoveChildPatch} from '@github-ui/remove-child-patch'
import {applyInsertBeforePatch} from '@github-ui/insert-before-patch'
import '@github-ui/fetch-overrides'
import {setupInitialNonce} from '@github-ui/fetch-nonce'
import {initRequestIdFromMeta} from '@github-ui/recent-request-ids'
import {observeBundleStats} from '@github-ui/bundle-stats'

apply()
if (typeof document !== 'undefined') {
  applyFetchPatch()
  applyRemoveChildPatch()
  applyInsertBeforePatch()
  setupInitialNonce()
  initRequestIdFromMeta()
  observeBundleStats()
}
