import {on} from 'delegated-events'
import {onInput} from '@github-ui/onfocus'
import {remoteForm} from '@github-ui/remote-form'
import {requestSubmit} from '@github-ui/form-utils'
import {gsap} from 'gsap'

export function smsSending() {
  document.body.classList.add('is-sending')
  document.body.classList.remove('is-sent', 'is-not-sent')
}

export function smsSuccess() {
  document.body.classList.add('is-sent')
  document.body.classList.remove('is-sending')
}

function smsError(message: string) {
  if (message) {
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    document.querySelector<HTMLElement>('.js-sms-error')!.textContent = message
  }
  document.body.classList.add('is-not-sent')
  document.body.classList.remove('is-sending')
}

remoteForm('.js-send-auth-code', async (form, wants) => {
  smsSending()
  let response
  try {
    response = await wants.text()
  } catch (error) {
    // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
    smsError(error.response.text)
  }
  if (response) {
    smsSuccess()
  }
})

remoteForm('.js-two-factor-set-sms-fallback', async (form, wants) => {
  let response
  try {
    response = await wants.text()
  } catch (error) {
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    const pane1 = form.querySelector<HTMLElement>('.js-configure-sms-fallback')!
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    const pane2 = form.querySelector<HTMLElement>('.js-verify-sms-fallback')!
    const pane = pane1.hidden ? pane2 : pane1
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    const flash = pane.querySelector<HTMLElement>('.flash')!
    // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
    switch (error.response.status) {
      case 404:
      case 422:
      case 429:
        // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
        flash.textContent = JSON.parse(error.response.text).error
        flash.hidden = false
    }
  }
  if (response) {
    switch (response.status) {
      case 200:
      case 201:
        window.location.reload()
        break
      case 202:
        /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
        form.querySelector<HTMLElement>('.js-configure-sms-fallback')!.hidden = true
        /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
        form.querySelector<HTMLElement>('.js-verify-sms-fallback')!.hidden = false
        /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
        form.querySelector<HTMLElement>('.js-fallback-otp')!.focus()
        break
    }
  }
})

onInput('.js-verification-code-input-auto-submit', function (event: Event) {
  const target = event.currentTarget as HTMLInputElement
  const pattern = target.pattern || '[0-9]{6}'
  if (new RegExp(`^(${pattern})$`).test(target.value)) {
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    requestSubmit(target.form!)
  }
})

on('click', '.js-toggle-redacted-note-content', async event => {
  const currentButton = event.currentTarget as HTMLButtonElement
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const noteContainer = currentButton.closest('.note')!
  if (noteContainer) {
    const note = noteContainer.getElementsByClassName('js-note')[0]
    if (note) {
      /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
      const newContent = currentButton.getAttribute('data-content')!.replace(/</g, '&lt;').replace(/>/g, '&gt;')
      // eslint-disable-next-line @github-ui/github-monorepo/require-set-sanitized-inner-html -- pre-existing innerHTML sink grandfathered when enabling the rule; not migrated in this rollout
      note.innerHTML = newContent
    }
  }

  const toggleElements = noteContainer.getElementsByClassName('js-toggle-redacted-note-content')
  for (const elem of toggleElements) {
    const button = elem as HTMLButtonElement
    button.hidden = !button.hidden
  }
})

// TWO-FACTOR ALTERNATIVES
document.addEventListener('turbo:load', jsGuardCheckin)
document.addEventListener('DOMContentLoaded', jsGuardCheckin)

document.addEventListener('turbo:load', initializeGsapLoading)
document.addEventListener('DOMContentLoaded', initializeGsapLoading)

document.addEventListener('turbo:load', resetAnimationsOnPageLoad)
document.addEventListener('DOMContentLoaded', resetAnimationsOnPageLoad)

const buttonStates = new WeakMap<HTMLElement, {isOpen: boolean; timeline: gsap.core.Timeline | null}>()

function resetAnimationsOnPageLoad() {
  // Clear all stored states on page navigation
  for (const button of document.querySelectorAll('.more-options-two-factor')) {
    const state = buttonStates.get(button as HTMLElement)
    if (state?.timeline) {
      state.timeline.kill()
    }
    buttonStates.delete(button as HTMLElement)
  }
}

function jsGuardCheckin() {
  const element = document.getElementById('two-factor-alternatives-body')

  if (element) {
    element.style.display = 'flex'
  }
}

function initializeGsapLoading() {
  const button = document.querySelector('.more-options-two-factor')
  const maxAttempts = 50
  let attempts = 0
  let rafId: number

  function enableButton() {
    if (button instanceof HTMLButtonElement) {
      button.disabled = false
    }
  }

  function isGsapReady() {
    try {
      return typeof gsap !== 'undefined' && typeof gsap.set === 'function'
    } catch {
      return false
    }
  }

  function check() {
    attempts++
    if (isGsapReady()) {
      enableButton()
      cancelAnimationFrame(rafId)
      return
    }
    if (attempts >= maxAttempts) {
      enableButton() // fallback if GSAP fails to load
      cancelAnimationFrame(rafId)
      return
    }
    rafId = requestAnimationFrame(check)
  }

  rafId = requestAnimationFrame(check)
}

on('click', '.more-options-two-factor', event => {
  const button = event.currentTarget as HTMLButtonElement

  // Get or create state for this specific button
  let state = buttonStates.get(button)
  if (!state) {
    state = {isOpen: false, timeline: null}
    buttonStates.set(button, state)
  }

  const list = document.querySelector('.two-factor-alternatives-body') as HTMLElement
  const listItems = document.querySelectorAll('.two-factor-alternatives-item')
  const listItemsText = document.querySelectorAll('.two-factor-alternatives-item-text')
  const triangleSvg = document.querySelectorAll('.more-options-two-factor .octicon-triangle-down')
  const divider = document.querySelector('.two-factor-alternatives-divider') as HTMLElement

  if (!list || !listItems.length) return

  // Kill any existing animation for this button
  state.timeline?.kill()
  state.timeline = gsap.timeline()

  if (!state.isOpen) {
    // Opening animation
    gsap.set(listItems, {opacity: 0, visibility: 'hidden', y: -5})
    gsap.set(listItemsText, {opacity: 0})
    gsap.set(divider, {display: 'none', opacity: 0, y: -5})

    state.timeline
      .to(list, {opacity: 1, duration: 0.01})
      .to(listItems, {
        opacity: 1,
        visibility: 'visible',
        y: 0,
        duration: 0.25,
        filter: 'none',
      })
      .to(divider, {display: 'block', opacity: 1, y: 0, duration: 0.25}, 0.0)
      .to(listItemsText, {opacity: 1, duration: 0.08}, 0.1)
      .to(triangleSvg, {rotation: 180, duration: 0.15}, 0)
  } else {
    // Closing animation
    state.timeline
      .to(divider, {display: 'none', opacity: 0, y: -5, duration: 0.25}, 0.0)
      .to(triangleSvg, {rotation: 0, duration: 0.25}, 0.0)
      .to(listItemsText, {opacity: 0, duration: 0.1}, 0.0)
      .to(
        listItems,
        {
          opacity: 0,
          visibility: 'hidden',
          y: -5,
          duration: 0.15,
          filter: 'blur(5px)',
        },
        0.0,
      )
  }

  state.isOpen = !state.isOpen
})
