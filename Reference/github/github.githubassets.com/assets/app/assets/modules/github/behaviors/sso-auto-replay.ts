import {observe} from '@github-ui/selector-observer'
import {requestSubmit} from '@github-ui/form-utils'

observe('form.js-auto-replay-enforced-sso-request', {
  constructor: HTMLFormElement,
  initialize(el) {
    requestSubmit(el)
  },
})
