import {displayFlash} from '../flash'
import {observe} from '@github-ui/selector-observer'

observe('template.js-flash-template', {
  constructor: HTMLTemplateElement,
  add(el) {
    displayFlash(el)
  },
})
