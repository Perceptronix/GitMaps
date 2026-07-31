import {observe} from '@github-ui/selector-observer'

observe('[data-indeterminate]', {
  constructor: HTMLInputElement,
  initialize(el) {
    el.indeterminate = true
  },
})
