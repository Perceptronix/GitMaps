import {fire, on} from 'delegated-events'

on('click', '.js-member-search-filter', function (event) {
  event.preventDefault()

  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const filter = event.currentTarget.getAttribute('data-filter')!
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const menu = event.currentTarget.closest<HTMLElement>('[data-filter-on]')!
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const filterOn = menu.getAttribute('data-filter-on')!
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const field = document.querySelector<HTMLInputElement>('.js-member-filter-field')!

  // Remove any existing filters on the opened dropdown.
  const currentValue = field.value

  // Regex allows a-z chars, underscores & strings wrapped in single quotes (required for custom roles)
  const regex = new RegExp(`${filterOn}:(?:[a-z]|_|((').*(')))+`)
  const currentFilters = currentValue.toString().trim().replace(regex, '')

  field.value = `${currentFilters} ${filter}`.replace(/\s\s/, ' ').trim()
  field.focus()
  fire(field, 'input')
})
