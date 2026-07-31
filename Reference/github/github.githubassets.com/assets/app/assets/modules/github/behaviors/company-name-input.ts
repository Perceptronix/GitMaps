import {onInput} from '@github-ui/onfocus'

onInput('.js-company-name-input', function (event) {
  const field = event.target as HTMLInputElement

  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const form = field.form!

  const corpTOSLink = form.querySelector('.js-corp-tos-link')
  const regTOSLink = form.querySelector('.js-tos-link')

  if (regTOSLink) {
    // TODO Replace with hidden attribute so aria-hidden is not required.
    /* eslint-disable-next-line github/no-d-none */
    regTOSLink.classList.add('d-none')
    regTOSLink.setAttribute('aria-hidden', 'true')

    if (corpTOSLink) {
      // TODO Replace with hidden attribute so aria-hidden is not required.
      /* eslint-disable-next-line github/no-d-none */
      corpTOSLink.classList.remove('d-none')
      corpTOSLink.setAttribute('aria-hidden', 'false')
    }
  }

  const hints = form.querySelectorAll('.js-company-name-text')
  if (hints.length === 0) {
    return
  }

  for (const hint of hints) {
    if (field.value) {
      const hasWording = hint.hasAttribute('data-wording')

      if (hasWording) {
        /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
        const wording = hint.getAttribute('data-wording')!
        hint.textContent = ` ${wording} ${field.value}`
      } else {
        hint.textContent = field.value
      }
    } else {
      hint.textContent = ''
    }
  }
})
