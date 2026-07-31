import {iuvpaaSupportLevel, webauthnSupportLevel} from '@github-ui/webauthn-support-level'
import {get, parseRequestOptionsFromJSON} from '@github/webauthn-json/browser-ponyfill'
import type {CredentialRequestOptionsJSON} from '@github/webauthn-json/browser-ponyfill'
import {requestSubmit, changeValue} from '@github-ui/form-utils'
import {observe} from '@github-ui/selector-observer'
import {isFeatureEnabled} from '@github-ui/feature-flags'

interface WebauthnPublicKeyCredential extends PublicKeyCredential {
  isConditionalMediationAvailable?: () => Promise<boolean>
}

const conditionalAbortController = new AbortController()
// webauthn-get.ts component
const webauthnGetComponent = 'webauthn-get'
// An event dispatched by `WebauthnGetElement` when a normal get request is initiated
const webauthnGetEvent = 'webauthn-get-prompt'

export async function isConditionalMediationSupported(): Promise<boolean | undefined> {
  return await (
    globalThis.PublicKeyCredential as unknown as WebauthnPublicKeyCredential | undefined
  )?.isConditionalMediationAvailable?.()
}

export async function supportConditionalMediation(): Promise<void> {
  const uivpaa = await iuvpaaSupportLevel()
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const conditionalForm = document.querySelector<HTMLFormElement>('.js-conditional-webauthn-placeholder')!
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const webauthnGet = document.querySelector<HTMLElement>(webauthnGetComponent)!

  // Don't initiate conditional mediation if this is a "low confidence" passkey login
  if (webauthnGet && webauthnGet.getAttribute('subtle-login') !== null) {
    return
  }

  const isAvailable = await isConditionalMediationSupported()

  if (conditionalForm && isAvailable && uivpaa === 'supported') {
    document.querySelector('#login_field')?.setAttribute('autocomplete', 'username webauthn')
    const signRequest = conditionalForm.getAttribute('data-webauthn-sign-request')

    if (!signRequest) {
      return
    }

    if (webauthnGet) {
      // Cancel pending conditional request if a basic get request is started
      webauthnGet.addEventListener(webauthnGetEvent, () => {
        conditionalAbortController.abort()
      })
    }

    if (isFeatureEnabled('migrate_away_from_webauthn_json')) {
      const publicKeyJSON: PublicKeyCredentialRequestOptionsJSON = JSON.parse(signRequest).publicKey
      const publicKey = PublicKeyCredential.parseRequestOptionsFromJSON(publicKeyJSON)

      const signResponse = (await navigator.credentials.get({
        publicKey,
        signal: conditionalAbortController.signal,
      })) as PublicKeyCredential
      /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
      const responseField = conditionalForm.querySelector<HTMLFormElement>('.js-conditional-webauthn-response')!
      responseField.value = JSON.stringify(signResponse.toJSON())
      requestSubmit(conditionalForm)
    } else {
      const signRequestJSON: CredentialRequestOptionsJSON = JSON.parse(signRequest)
      const options = parseRequestOptionsFromJSON(signRequestJSON)
      options.signal = conditionalAbortController.signal

      const signResponse = await get(options)
      /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
      const responseField = conditionalForm.querySelector<HTMLFormElement>('.js-conditional-webauthn-response')!
      responseField.value = JSON.stringify(signResponse)
      requestSubmit(conditionalForm)
    }
  }
}

// Record the browser's webauthn support level in the GitHub login form.
// Ask the device to sign a request when the user taps its button.
observe('.js-webauthn-support', {
  constructor: HTMLInputElement,
  add(el) {
    changeValue(el, webauthnSupportLevel())
  },
})

observe('.js-webauthn-iuvpaa-support', {
  constructor: HTMLInputElement,
  async add(el) {
    changeValue(el, await iuvpaaSupportLevel())
  },
})

observe('.js-support', {
  constructor: HTMLInputElement,
  async add(el) {
    changeValue(el, 'true')
  },
})

observe('.js-conditional-webauthn-placeholder', function () {
  supportConditionalMediation()
})
