import {deleteCookie, getCookies} from '@github-ui/cookies'
import {observe} from '@github-ui/selector-observer'

observe('.js-transform-notice', {
  constructor: HTMLElement,
  add(el) {
    const cookies = getCookies('org_transform_notice')
    for (const cookie of cookies) {
      const message = document.createElement('span')
      try {
        message.textContent = atob(decodeURIComponent(cookie.value))
        deleteCookie(cookie.key)
        el.appendChild(message)
        el.hidden = false
      } catch {
        // Do nothing, ignore on invalid encoding.
      }
      return
    }
  },
})
