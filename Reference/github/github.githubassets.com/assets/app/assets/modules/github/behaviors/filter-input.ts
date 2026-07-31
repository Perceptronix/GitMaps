import FilterInputElement from '@github/filter-input-element'
import {announce} from '@github-ui/aria-live'
import {on} from 'delegated-events'

// Use data- attributes on the <filter-input> element to construct the options arguments to pass to
// announce().
function announceOptions(filterElement: FilterInputElement) {
  const ariaLiveRegionId = filterElement.getAttribute('data-aria-live-element')
  if (!ariaLiveRegionId) return {}

  const ariaLiveRegion = document.getElementById(ariaLiveRegionId)
  if (!ariaLiveRegion) return {}

  return {element: ariaLiveRegion}
}

// Use the `data-filter-empty-message` attribute on the <filter-input> element to opt in to
// announcing a descriptive empty-state message when the filter yields no matches, instead of
// the generic "Found 0 out of N" count. Returns null when not opted in. a11y: WCAG 4.1.3.
function emptyMessage(filterElement: FilterInputElement) {
  const message = filterElement.getAttribute('data-filter-empty-message')?.trim()
  if (!message) return null

  return message
}

on('filter-input-updated', 'filter-input', event => {
  const filterElement = event.target as FilterInputElement
  const input = filterElement.input
  if (!(document.activeElement && document.activeElement === input)) return

  const {count, total} = event.detail
  const options = announceOptions(filterElement)

  const empty = count === 0 ? emptyMessage(filterElement) : null
  if (empty) {
    announce(empty, options)
    return
  }

  // eslint-disable-next-line i18n-text/no-en
  announce(`Found ${count} out of ${total} ${total === 1 ? 'item' : 'items'}`, options)
})

on(
  'toggle',
  'details',
  event => {
    // Wait for the next click to ensure that focus has left input
    setTimeout(() => resetFilter(event.target as Element), 0)
  },
  {capture: true},
)

on(
  'tab-container-changed',
  'tab-container',
  event => {
    if (!(event.target instanceof HTMLElement)) return
    const {relatedTarget: panel} = event.detail
    const filterInput = event.target.querySelector('filter-input')
    if (panel && filterInput instanceof FilterInputElement) {
      filterInput.setAttribute('aria-owns', panel.id)
    }
  },
  {capture: true},
)

function resetFilter(target: Element) {
  const filterInput = target.querySelector<FilterInputElement>('filter-input')
  if (filterInput && !target.hasAttribute('open')) {
    filterInput.reset()
  }
}
