import {on} from 'delegated-events'

on(
  'details-menu-selected',
  '.js-sync-select-menu-text',
  function (event) {
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    const button = document.querySelector<HTMLElement>('.js-sync-select-menu-button')!
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    const text = (event.detail.relatedTarget as Element).querySelector<HTMLElement>(
      'span[data-menu-button-text]',
    )!.textContent
    button.textContent = text
    button.focus()
  },
  {capture: true},
)
