import {announceFromElement} from '@github-ui/aria-live'
import type {UploadCallbacks, UploadConfig, UploadState} from './batch-upload'

const possibleStates: UploadState[] = [
  'is-default',
  'is-uploading',
  'is-bad-file',
  'is-duplicate-filename',
  'is-too-big',
  'is-too-many',
  'is-hidden-file',
  'is-failed',
  'is-bad-dimensions',
  'is-empty',
  'is-bad-permissions',
  'is-repository-required',
  'is-bad-format',
]

const stateToSelector: Partial<Record<UploadState, string>> = {
  'is-duplicate-filename': '#is-duplicate-filename-message',
  'is-bad-file': '#is-bad-file-message',
  'is-too-big': '#is-too-big-message',
  'is-empty': '#is-empty-message',
  'is-failed': '#is-failed-message',
  'is-too-many': '#is-too-many-message',
  'is-bad-format': '#is-bad-format-message',
  'is-bad-dimensions': '#is-bad-dimensions-message',
}

export function configFromElement(container: Element): UploadConfig {
  const tokenEl = container.querySelector<HTMLInputElement>('.js-data-upload-policy-url-csrf')
  return {
    policyUrl: container.getAttribute('data-upload-policy-url') || '',
    csrfToken: tokenEl?.value || '',
    repositoryId: container.getAttribute('data-upload-repository-id') || undefined,
    subjectType: container.getAttribute('data-subject-type') || undefined,
    subjectParam: container.getAttribute('data-subject-param') || undefined,
    uploadContainerType: container.getAttribute('data-upload-container-type') || undefined,
    uploadContainerId: container.getAttribute('data-upload-container-id') || undefined,
  }
}

export function callbacksFromElement(container: HTMLElement): UploadCallbacks {
  return {
    onStateChange(state: UploadState, message?: string) {
      container.classList.remove(...possibleStates)
      if (state === 'is-too-big' && message) {
        const el = container.querySelector('.js-upload-too-big')
        // eslint-disable-next-line @github-ui/github-monorepo/require-set-sanitized-inner-html -- assigns caller-provided HTML string at a generic DOM boundary; cannot be typed as SanitizedHTML here
        if (el) el.innerHTML = message
      }
      container.classList.add(state)
      if (state !== 'is-uploading' && state !== 'is-default') {
        const selector = stateToSelector[state]
        if (selector) {
          const errorElement = container.querySelector(selector)
          if (errorElement) {
            const alertRegion = container.querySelector('[role="alert"]')
            if (alertRegion) {
              announceFromElement(errorElement as HTMLElement, {
                assertive: true,
                element: alertRegion as HTMLElement,
              })
            } else {
              announceFromElement(errorElement as HTMLElement, {assertive: true})
            }
          }
        }
      }
    },
    onSetup(batch, attachment, form, preprocess) {
      container.dispatchEvent(
        new CustomEvent('upload:setup', {bubbles: true, detail: {batch, attachment, form, preprocess}}),
      )
    },
    onStart(batch, attachment, policy) {
      container.dispatchEvent(new CustomEvent('upload:start', {bubbles: true, detail: {batch, attachment, policy}}))
    },
    onProgress(batch, attachment) {
      container.dispatchEvent(new CustomEvent('upload:progress', {bubbles: true, detail: {batch, attachment}}))
    },
    onComplete(batch, attachment) {
      container.dispatchEvent(new CustomEvent('upload:complete', {bubbles: true, detail: {batch, attachment}}))
    },
    onError(batch, attachment) {
      container.dispatchEvent(new CustomEvent('upload:error', {bubbles: true, detail: {batch, attachment}}))
    },
    onInvalid(batch, attachment) {
      container.dispatchEvent(new CustomEvent('upload:invalid', {bubbles: true, detail: {batch, attachment}}))
    },
  }
}

export function resetState(container: HTMLElement, state: UploadState) {
  callbacksFromElement(container).onStateChange(state)
}
