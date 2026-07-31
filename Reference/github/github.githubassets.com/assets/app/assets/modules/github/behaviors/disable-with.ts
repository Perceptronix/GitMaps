// Disable
//
// Disables clicked buttons with text in `data-disable-with`.
//
// `<input type=submit>` or `<button type=submit>`
//
// `data-disable-with` - Message to set `<input>` value or `<button>` innerText to.
//
//     <input type="submit" data-disable-with="Submitting...">

import {afterRemote} from '@github-ui/remote-form'
import {on} from 'delegated-events'

type FormButton = HTMLInputElement | HTMLButtonElement
const originalValues = new WeakMap<FormButton, string>()

// Get button original value.
function getButtonOriginalValue(el: FormButton) {
  if (el instanceof HTMLInputElement) {
    return el.value || 'Submit'
  } else {
    return el.innerHTML || ''
  }
}

function getButtons(form: HTMLFormElement): FormButton[] {
  return [
    Array.from(form.querySelectorAll('input[type=submit][data-disable-with], button[data-disable-with]')),
    Array.from(document.querySelectorAll(`button[data-disable-with][form="${form.id}"]`)),
  ].flat() as FormButton[]
}

// Sets a button text. Always use textContent here to avoid XSS
function setButtonText(el: FormButton, text: string) {
  if (el instanceof HTMLInputElement) {
    el.value = text
  } else {
    el.textContent = text
  }
}

// Sets a button html. This is used to restore the original HTML before disabling the button
function restoreOriginalValue(el: FormButton, originalValue: string) {
  if (el instanceof HTMLInputElement) {
    el.value = originalValue
  } else {
    // eslint-disable-next-line @github-ui/github-monorepo/require-set-sanitized-inner-html -- pre-existing innerHTML sink grandfathered when enabling the rule; not migrated in this rollout
    el.innerHTML = originalValue
  }
}

on(
  'submit',
  'form',
  function (event) {
    const form = event.currentTarget as HTMLFormElement
    for (const button of getButtons(form)) {
      originalValues.set(button, getButtonOriginalValue(button))

      const disabledText = button.getAttribute('data-disable-with')
      if (disabledText) {
        setButtonText(button, disabledText)
      }
      button.disabled = true
    }
  },
  {capture: true},
)

// Revert a form to it's previous state.
function revert(form: HTMLFormElement) {
  for (const button of getButtons(form)) {
    const originalValue = originalValues.get(button)
    if (originalValue != null) {
      restoreOriginalValue(button, originalValue)

      // Button doesn't have a `data-disable-invalid` property or form is valid
      if (!button.hasAttribute('data-disable-invalid') || form.checkValidity()) {
        // Enable the button
        button.disabled = false
      }
      originalValues.delete(button)
    }
  }
}

// Enable controls when AJAX request finishes
on('deprecatedAjaxComplete', 'form', function ({currentTarget, target}) {
  if (currentTarget === target) {
    revert(currentTarget as HTMLFormElement)
  }
})

afterRemote(revert)
