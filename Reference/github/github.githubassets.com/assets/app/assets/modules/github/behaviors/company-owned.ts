import {changeValue} from '@github-ui/form-utils'
import {fire} from 'delegated-events'
import {observe} from '@github-ui/selector-observer'

// Update the TOS statement with company name
//   e.g. By clicking on "Create an organization" below, you are agreeing to the Terms of Service and the Privacy Policy on behalf of your company, GitHub, Inc.
observe('.js-company-owned:not(:checked)', {
  constructor: HTMLInputElement,
  add(el) {
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    const form = el.form!
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    const input = form.querySelector<HTMLInputElement>('.js-company-name-input')!
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    const hint = document.querySelector<HTMLElement>('.js-company-name-text')!
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    const corpTOSLink = document.querySelector<HTMLElement>('.js-corp-tos-link')!
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    const regTOSLink = document.querySelector<HTMLElement>('.js-tos-link')!

    if (input) {
      if (el.getAttribute('data-optional')) {
        input.removeAttribute('required')
      }
      changeValue(input, '')
    }

    // TODO Replace with hidden attribute so aria-hidden is not required.
    /* eslint-disable-next-line github/no-d-none */
    regTOSLink.classList.remove('d-none')
    regTOSLink.setAttribute('aria-hidden', 'false')
    /* eslint-disable-next-line github/no-d-none */
    corpTOSLink.classList.add('d-none')
    corpTOSLink.setAttribute('aria-hidden', 'true')

    if (hint) {
      hint.textContent = ''
    }
  },
})

observe('.js-company-owned:checked', {
  constructor: HTMLInputElement,
  add(el) {
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    const form = el.form!
    const input = form.querySelector('.js-company-name-input')

    if (input) {
      input.setAttribute('required', '')
      fire(input, 'focus')
      fire(input, 'input')
    }
  },
})

// Make the CorpTOS the default on the "Business Plus" AKA Business plan
// TODO Replace with delegated-events
observe('.js-company-owned-autoselect', {
  constructor: HTMLInputElement,
  add(field) {
    const planChoice = field

    function autoselect() {
      if (planChoice.checked && planChoice.form) {
        /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
        const corpTos = planChoice.form.querySelector<HTMLInputElement>('.js-company-owned')!
        changeValue(corpTos, true)
      }
    }

    planChoice.addEventListener('change', autoselect)
    autoselect()
  },
})
