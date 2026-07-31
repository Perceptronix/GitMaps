import {observe} from '@github-ui/selector-observer'

observe('body.js-print-popup', () => {
  window.print()
  setTimeout(window.close, 1000)
})
