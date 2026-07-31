import {on} from 'delegated-events'

on('change', 'input.js-survey-contact-checkbox', function (event: Event) {
  const currentTarget = event.currentTarget as HTMLInputElement
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const question = currentTarget.closest<HTMLElement>('.js-survey-question-form')!
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const hiddenInput = question.querySelector<HTMLElement>('.js-survey-contact-checkbox-hidden')!
  if (currentTarget.checked) {
    hiddenInput.setAttribute('disabled', 'true')
  } else {
    hiddenInput.removeAttribute('disabled')
  }
})
