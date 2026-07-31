import {addThrottledInputEventListener} from '../throttled-input'
import {fetchSafeDocumentFragment} from '@github-ui/fetch-utils'
import {observe} from '@github-ui/selector-observer'
import {on} from 'delegated-events'
import {remoteForm} from '@github-ui/remote-form'
import type {ModalDialogElement} from '@primer/view-components/app/components/primer/alpha/modal_dialog'

// Toggle verify SSL visibility for https web hook URLs
observe('.js-hook-url-field', {
  constructor: HTMLInputElement,
  add(input) {
    function checkUrl() {
      const form = input.form
      if (!form) return
      let url
      try {
        // eslint-disable-next-line no-restricted-syntax
        url = new URL(input.value)
      } catch {
        // Do nothing.
      }
      const sslFields = form.querySelector('.js-ssl-hook-fields')
      if (sslFields instanceof HTMLElement) {
        sslFields.hidden = !(url && 'https:' === url.protocol)
      }
    }

    addThrottledInputEventListener(input, checkUrl)
    checkUrl()
  },
})

function chooseEvents(selector: string): void {
  const events = document.querySelectorAll<HTMLInputElement>('.js-hook-event-checkbox')
  for (const eventCheckbox of events) {
    eventCheckbox.checked = eventCheckbox.matches(selector)
  }
}

on('change', '.js-hook-event-choice', function (event) {
  const checkbox = event.currentTarget as HTMLInputElement
  const customIsSelected = checkbox.checked && checkbox.value === 'custom'
  const hookEventsField = checkbox.closest('.js-hook-events-field')
  if (hookEventsField) hookEventsField.classList.toggle('is-custom', customIsSelected)

  const hookEventSelectorCollection = document.getElementsByClassName(
    'js-hook-event-selector',
  ) as HTMLCollectionOf<HTMLElement>
  const hookEventSelector = hookEventSelectorCollection[0] as HTMLElement
  if (hookEventSelector && customIsSelected) {
    hookEventSelector.hidden = false
  } else if (hookEventSelector && !customIsSelected && hookEventSelector.hidden === false) {
    hookEventSelector.hidden = true
  }

  if (checkbox.checked) {
    if (customIsSelected) {
      /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
      const hookWildcardEvent = document.querySelector<HTMLInputElement>('.js-hook-wildcard-event')!
      hookWildcardEvent.checked = false
    } else if (checkbox.value === 'push') {
      chooseEvents('[value="push"]')
    } else if (checkbox.value === 'all') {
      chooseEvents('.js-hook-wildcard-event')
    }
  }
})

// Load more delivery logs
on('click', '.js-hook-deliveries-pagination-button', async function (event) {
  const button = event.currentTarget as HTMLButtonElement
  button.disabled = true
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const wrapper = button.parentElement!

  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const url = button.getAttribute('data-url')!
  wrapper.before(await fetchSafeDocumentFragment(document, url))
  wrapper.remove()
})

// Redeliver Payload Button
remoteForm('.js-redeliver-hook-form', async function (form, wants) {
  let response
  try {
    response = await wants.html()
  } catch {
    form.classList.add('failed')
    return
  }

  // replace the whole deliveries index
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const deliveriesDetails = document.querySelector<HTMLElement>(`.js-hook-deliveries-container`)!
  deliveriesDetails.replaceWith(response.html)
})

function registerInsecureSslVerificationDialog() {
  const dialog = document.getElementById('insecure_ssl_verification') as ModalDialogElement | HTMLDialogElement | null
  const submitButton = document.getElementById('insecure_ssl_verification_submit') as HTMLInputElement | null
  const disallowInsecureRadio = document.getElementById('insecure_ssl_0') as HTMLInputElement | null
  const allowInsecureRadio = document.getElementById('insecure_ssl_1') as HTMLInputElement | null

  if (dialog && submitButton && disallowInsecureRadio && allowInsecureRadio) {
    // on radio buttons, 'change' only fires when they become checked
    allowInsecureRadio.addEventListener('change', event => {
      event.stopPropagation()
      disallowInsecureRadio.checked = true
      if (dialog instanceof HTMLDialogElement) {
        dialog.showModal()
      } else {
        dialog.show()
      }
    })

    submitButton.addEventListener('click', () => {
      allowInsecureRadio.checked = true
    })
    dialog.addEventListener('dialog:remove', () => {
      allowInsecureRadio.checked = true
    })
  }
}

registerInsecureSslVerificationDialog()
