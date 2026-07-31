import {on} from 'delegated-events'

// Show/hide event settings when the user's overall thread subscription option changes.
on('change', '.js-thread-notification-setting', toggleEventSettings)

// Validate event settings when the user's event selection changes.
on('change', '.js-custom-thread-notification-option', toggleEventSettings)

// Show/hide event settings when the user dismisses the form.
on('reset', '.js-custom-thread-settings-form', toggleEventSettings)

function toggleEventSettings() {
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const eventSettingsVisible = document.querySelector<HTMLInputElement>('.js-reveal-custom-thread-settings')!.checked
  const noEventSelected = !document.querySelector('.js-custom-thread-notification-option:checked')

  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const eventSettingsContainer = document.querySelector<HTMLElement>('.js-custom-thread-settings')!
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const checkbox = document.querySelector<HTMLInputElement>('[data-custom-option-required-text]')!
  const message =
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    eventSettingsVisible && noEventSelected ? checkbox.getAttribute('data-custom-option-required-text')! : ''

  checkbox.setCustomValidity(message)
  eventSettingsContainer.hidden = !eventSettingsVisible
}
