import {observe} from '@github-ui/selector-observer'
import subscribe from '@github/check-all'

observe('.js-check-all-container', {
  constructor: HTMLElement,
  subscribe,
})
