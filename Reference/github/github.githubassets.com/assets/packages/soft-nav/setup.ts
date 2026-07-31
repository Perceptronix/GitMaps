import {ssrSafeDocument} from '@github-ui/ssr-utils'
import {SOFT_NAV_EXTERNAL_EVENTS} from './external'
import {failSoftNav, initSoftNav, renderedSoftNav, startSoftNav, succeedSoftNav} from './state'

export function setup() {
  ssrSafeDocument?.addEventListener(SOFT_NAV_EXTERNAL_EVENTS.INITIAL, initSoftNav)

  ssrSafeDocument?.addEventListener(SOFT_NAV_EXTERNAL_EVENTS.START, e => {
    startSoftNav((e as CustomEvent).detail.mechanism)
  })

  ssrSafeDocument?.addEventListener(SOFT_NAV_EXTERNAL_EVENTS.SUCCESS, () => succeedSoftNav())
  ssrSafeDocument?.addEventListener(SOFT_NAV_EXTERNAL_EVENTS.ERROR, () => failSoftNav())
  ssrSafeDocument?.addEventListener(SOFT_NAV_EXTERNAL_EVENTS.RENDER, () => renderedSoftNav())
}
