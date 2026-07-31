// Size to Fit textarea behavior
//
// Auto sizes any textareas marked with `.js-size-to-fit` to its text
// contents height.
import {observe} from '@github-ui/selector-observer'
import subscribe from '@github/textarea-autosize'

observe('textarea.js-size-to-fit', {
  constructor: HTMLTextAreaElement,
  subscribe(el) {
    if (CSS?.supports?.('field-sizing', 'content')) {
      return {
        unsubscribe() {},
      }
    } else {
      return subscribe(el)
    }
  },
})
