import {on} from 'delegated-events'

on('click', 'tab-container [role="tab"]', function (event) {
  const {currentTarget} = event

  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const menu = currentTarget.closest<HTMLElement>('tab-container')!
  const filter = menu.querySelector('.js-filterable-field, [data-filter-placeholder-input]')
  if (filter instanceof HTMLInputElement) {
    const placeholder = currentTarget.getAttribute('data-filter-placeholder')
    if (placeholder) {
      filter.setAttribute('placeholder', placeholder)
    }
    filter.focus()
  }
})

on('tab-container-changed', 'tab-container', function (event) {
  const panel = event.detail.relatedTarget
  if (!panel) return
  const url = panel.getAttribute('data-fragment-url')
  const includeFragment = panel.querySelector('include-fragment')
  if (url && includeFragment && !includeFragment.hasAttribute('src')) {
    includeFragment.src = url
  }
})
