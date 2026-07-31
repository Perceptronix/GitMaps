// Common behaviors associated with <auto-check>

import {announceFromElement} from '@github-ui/aria-live'
import {fire} from 'delegated-events'
import {observe} from '@github-ui/selector-observer'
import {validate as htmlValidate} from '../behaviors/html-validation'

const notes = new WeakMap()

observe('auto-check', function (el) {
  if (el.classList.contains('js-prevent-default-behavior')) return

  const input = el.querySelector('input')
  if (!input) return
  if (input.classList.contains('js-prevent-default-behavior')) return

  const container = input.closest('.form-group') || el
  const form = input.form

  let id: string | null
  function generateId() {
    if (!id) id = `input-check-${(Math.random() * 10000).toFixed(0)}`
    return id
  }
  const ariaDescribedby = input.getAttribute('aria-describedby')

  input.addEventListener('focusout:delay', () => {
    // Prevents overwriting the aria-describedby when we have added the blank error for NUX signup
    if (input.classList.contains('js-nux-blank-field')) return
    input.setAttribute('aria-describedby', [id, ariaDescribedby].join(' '))
  })

  // Adds the auto-check message to the input for screen readers when the input is focused for NUX signup
  if (input.classList.contains('js-nux-input')) {
    input.addEventListener('focusin', () => {
      if (input.classList.contains('js-nux-blank-field')) return
      input.setAttribute('aria-describedby', [id, ariaDescribedby].join(' '))
    })
  }

  const note = container.querySelector('p.note')
  if (note) {
    if (!note.id) note.id = generateId()
    notes.set(note, note.innerHTML)
  }

  el.addEventListener('loadstart', () => {
    reset(input, container)
    container.classList.add('is-loading')
    input.classList.add('is-autocheck-loading')

    validate(form)
  })

  el.addEventListener('loadend', () => {
    container.classList.remove('is-loading')
    input.classList.remove('is-autocheck-loading')
  })

  input.addEventListener('auto-check-success', async event => {
    input.classList.add('is-autocheck-successful')
    container.classList.add('successed')

    validate(form)

    const {response} = event.detail
    if (!response) return

    // Clone the response before reading, so other event handlers can also read it.
    const message = await response.clone().text()
    if (!message) return

    if (note instanceof HTMLElement) {
      // eslint-disable-next-line @github-ui/github-monorepo/require-set-sanitized-inner-html -- pre-existing innerHTML sink grandfathered when enabling the rule; not migrated in this rollout
      note.innerHTML = message
      announceFromElement(note)
    } else {
      const isOk = response.status === 200
      const tagName = container.tagName === 'DL' ? 'dd' : 'div'
      const element = document.createElement(tagName)
      element.id = generateId()
      if (isOk) {
        element.classList.add('success')
        // Listener for js-nux-sr-only located here: app/assets/modules/signup.ts
        element.classList.add('js-nux-sr-only')
      } else {
        element.classList.add('warning')
      }
      // eslint-disable-next-line @github-ui/github-monorepo/require-set-sanitized-inner-html -- pre-existing innerHTML sink grandfathered when enabling the rule; not migrated in this rollout
      element.innerHTML = message
      container.append(element)
      container.classList.add(isOk ? 'successed' : 'warn')
      announceFromElement(element)
      if (isOk) element.hidden = document.activeElement !== input
    }

    fire(input, 'auto-check-message-updated')
  })

  input.addEventListener('auto-check-error', async event => {
    input.classList.add('is-autocheck-errored')
    container.classList.add('errored')

    validate(form)

    const {response} = event.detail
    if (!response) return

    // Clone the response before reading, so other event handlers can also read it.
    const message = await response.clone().text()

    if (note instanceof HTMLElement) {
      // eslint-disable-next-line i18n-text/no-en, @github-ui/github-monorepo/require-set-sanitized-inner-html -- pre-existing innerHTML sink grandfathered when enabling the rule; not migrated in this rollout
      note.innerHTML = message || 'Something went wrong'
      announceFromElement(note)
    } else {
      const tagName = container.tagName === 'DL' ? 'dd' : 'div'
      const error = document.createElement(tagName)
      error.id = generateId()
      error.classList.add('error')
      // eslint-disable-next-line i18n-text/no-en, @github-ui/github-monorepo/require-set-sanitized-inner-html -- pre-existing innerHTML sink grandfathered when enabling the rule; not migrated in this rollout
      error.innerHTML = message || 'Something went wrong'
      container.append(error)
      announceFromElement(error)
    }
  })

  input.addEventListener('input', () => {
    input.removeAttribute('aria-describedby')

    // Special condition for accessibility on the new NUX signup flow
    // Puts the original aria-describedby back on the input to preserve the helper text
    if (input.classList.contains('js-nux-input')) {
      input.setAttribute('aria-describedby', [ariaDescribedby].join(' '))
    }

    // Logic specifically for blank field inputs for accessibility on the new NUX signup flow
    const captchaContainer = document.getElementById('captcha-container-nux')
    if (captchaContainer) {
      // Remove the success message if it exists to prevent duplicate announcements when input has changed
      const successMessage = container.querySelector<HTMLElement>('.success')
      if (successMessage) {
        successMessage.remove()
      }

      const targetErrorMessage = input.nextElementSibling?.nextElementSibling
      if (targetErrorMessage?.textContent?.includes('cannot be blank')) {
        targetErrorMessage.remove()
        input.classList.remove('is-autocheck-errored')
        input.classList.remove('js-nux-blank-field')
      }
    }
    if (!input.value) reset(input, container)
  })

  input.addEventListener('blur', () => {
    // Special condition for accessibility on the new NUX signup flow
    const captchaContainer = document.getElementById('captcha-container-nux')
    const successMessage = container.querySelector<HTMLElement>('.success')

    if (captchaContainer && successMessage) {
      // Listener for js-nux-sr-only located here: app/assets/modules/signup.ts
      successMessage.classList.add('js-nux-sr-only')
      announceFromElement(successMessage)
    } else if (successMessage) {
      successMessage.hidden = true
    }
  })

  input.addEventListener('focus', () => {
    const successMessage = container.querySelector<HTMLElement>('.success')
    if (successMessage) {
      successMessage.hidden = false
      // Listener for js-nux-sr-only located here: app/assets/modules/signup.ts
      successMessage.classList.add('js-nux-sr-only')
    }
  })

  form?.addEventListener('reset', () => {
    reset(input, container)
  })
})

// Reset the autocheck state.
function reset(input: HTMLInputElement, container: Element) {
  container.classList.remove('is-loading', 'successed', 'errored', 'warn')
  input.classList.remove('is-autocheck-loading', 'is-autocheck-successful', 'is-autocheck-errored')

  const note = container.querySelector('p.note')
  if (note) {
    const content = notes.get(note)
    // eslint-disable-next-line @github-ui/github-monorepo/require-set-sanitized-inner-html -- pre-existing innerHTML sink grandfathered when enabling the rule; not migrated in this rollout
    if (content) note.innerHTML = content
  }

  if (container.tagName === 'DL') {
    container.querySelector('dd.error')?.remove()
    container.querySelector('dd.warning')?.remove()
    container.querySelector('dd.success')?.remove()
  } else {
    container.querySelector('div.error')?.remove()
    container.querySelector('div.warning')?.remove()
    container.querySelector('div.success')?.remove()
  }
}

function validate(form: HTMLFormElement | null) {
  if (!form) return
  htmlValidate(form)
}
