import {fromEvent} from '@github-ui/subscription'
import {observe} from '@github-ui/selector-observer'

async function load() {
  await import('../user-status-submit')
}

observe('.js-user-status-container, .js-load-user-status-submit', {
  subscribe: el => fromEvent(el, 'click', load, {once: true}),
})

// if the form is added to the page without container click, load the submit behavior
observe('.user-status-dialog-fragment', {
  add: load,
})
