import {dialog} from '@github-ui/details-dialog'
import {fetchSafeDocumentFragment} from '@github-ui/fetch-utils'
import {type Kicker, remoteForm} from '@github-ui/remote-form'
import {webauthnSupportLevel} from '@github-ui/webauthn-support-level'
import {getBaseFetchHeaders} from '@github-ui/fetch-headers'

let sudoPromptExist = false

/**
 * Take a URL and add webauthn params to it.
 *
 * @param {string} oldURL - The old URL.
 * @returns {string} - The new URL with added params.
 */
function urlWithParams(oldURL: string): string {
  const newURL = new URL(oldURL, window.location.origin)
  const params = new URLSearchParams(newURL.search.slice(1))
  params.set('webauthn-support', webauthnSupportLevel())
  newURL.search = params.toString()
  return newURL.toString()
}

async function loadPromptTemplate(): Promise<HTMLTemplateElement> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const link = document.querySelector<HTMLLinkElement>('link[rel=sudo-modal]')!
  const template = document.querySelector('.js-sudo-prompt')
  if (template instanceof HTMLTemplateElement) {
    return template
  } else if (link) {
    const fragment = await fetchSafeDocumentFragment(document, urlWithParams(link.href))
    document.body.appendChild(fragment)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return document.querySelector<HTMLTemplateElement>('.js-sudo-prompt')!
  } else {
    throw new Error("couldn't load sudo prompt")
  }
}

let succeeded = false

/**
 * Marshal the originating (sudo-guarded) request into the Proof of Presence
 * launch form so the OIDC callback can replay it after the full-page round-trip.
 *
 * The PoP launch form (`.js-sudo-pop-launch`) is a top-level POST to the PoP
 * initiate endpoint. On the proactive `data-sudo-required` path the guarded
 * request never reaches the server (the client intercepts before submit), so
 * the server has no `form_data` to embed and the client must supply it here.
 * When the server already embedded it (the reactive XHR-401 path sets
 * `data-form-data-embedded="true"`), we leave the form untouched.
 *
 * The field shape mirrors `captured_form_data_via_enforcement` on the server:
 * every originating field is nested under `form_data` (e.g. `user[name]` ->
 * `form_data[user][name]`), plus `form_data[_target]` (the URL to replay to)
 * and `form_data[_method]` (the original HTTP verb).
 */
function marshalPopLaunchFormData(content: DocumentFragment, currentTarget?: HTMLElement): void {
  const launchForm = content.querySelector<HTMLFormElement>('.js-sudo-pop-launch')
  if (!launchForm) return
  // Server already embedded the originating request (reactive XHR-401 path).
  if (launchForm.getAttribute('data-form-data-embedded') === 'true') return

  const originForm = currentTarget instanceof HTMLFormElement ? currentTarget : currentTarget?.closest('form')
  if (!originForm) return

  const targetUrl = new URL(
    originForm.getAttribute('action') || window.location.href,
    window.location.origin,
  ).toString()
  const methodOverride = originForm.querySelector<HTMLInputElement>('input[name="_method"]')?.value
  const method = (methodOverride || originForm.getAttribute('method') || 'post').toLowerCase()

  appendHiddenField(launchForm, 'form_data[_target]', targetUrl)
  appendHiddenField(launchForm, 'form_data[_method]', method)

  for (const [name, value] of new FormData(originForm).entries()) {
    // Skip File entries (no meaningful replay) and the method override we
    // already carried as `form_data[_method]`.
    if (typeof value !== 'string' || name === '_method') continue
    appendHiddenField(launchForm, nestFieldUnderFormData(name), value)
  }
}

// Nest an originating field name under `form_data` using Rails bracket
// conventions, so the callback rebuilds the same nested structure the
// server-side `captured_form_data_via_enforcement` would have produced.
//
// A flat name like `user[name]` must become `form_data[user][name]` (NOT
// `form_data[user[name]]`, which Rails mis-parses into a `"user[name" => {"]"}`
// key and corrupts the replay). A bracketless `foo` becomes `form_data[foo]`.
function nestFieldUnderFormData(name: string): string {
  const firstBracket = name.indexOf('[')
  if (firstBracket === -1) return `form_data[${name}]`
  const head = name.slice(0, firstBracket)
  const rest = name.slice(firstBracket)
  return `form_data[${head}]${rest}`
}

function appendHiddenField(form: HTMLFormElement, name: string, value: string): void {
  const input = document.createElement('input')
  input.type = 'hidden'
  input.name = name
  input.value = value
  form.append(input)
}

/**
 * Provide a sudo prompt, and return when it has been filled in or dismissed.
 *
 * @returns {Promise<boolean>} - Resolves to `true` if the user successfully authed with sudo.
 */
export async function sudoPrompt(currentTarget?: HTMLElement): Promise<boolean> {
  if (sudoPromptExist) return false
  sudoPromptExist = true
  succeeded = false
  const template = await loadPromptTemplate()
  const content = template.content.cloneNode(true) as DocumentFragment
  // Proof of Presence full-page hand-off: carry the originating request into the
  // launch form as form_data so the callback can replay it (no popup, no inline
  // credential exchange).
  marshalPopLaunchFormData(content, currentTarget)
  const prompt = await dialog({content, label: 'Confirm access'})

  // open/expanded HTML5 <details> can potentially steal focus from the dialog (https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details)
  // Example bug: https://github.com/github/authentication/issues/2208
  // close the open details element that triggered this sudo challenge
  const details = currentTarget?.closest('details[open]') as HTMLElement
  if (details) {
    details.removeAttribute('open')
  }

  await new Promise<void>(resolve => {
    prompt.addEventListener(
      'dialog:remove',
      function () {
        // re-add the open attribute to the details that we closed above
        if (details) {
          details.setAttribute('open', 'open')
        }
        if (currentTarget?.isConnected) {
          currentTarget.focus()
        }
        sudoPromptExist = false
        resolve()
      },
      {once: true},
    )
  })
  return succeeded
}

async function sudoModalErrorOrClose(
  form: HTMLFormElement,
  wants: Kicker,
  unauthorizedError = 'Sudo authentication failed.',
  tooManyError = 'Too many authentication attempts. Please try again later.',
  errorSelector = '.js-sudo-error',
  inputElementSelector?: string,
) {
  try {
    await wants.text()
  } catch (error) {
    // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
    if (!error.response) throw error
    let errorMessage
    // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
    switch (error.response.status) {
      case 401:
        errorMessage = unauthorizedError
        break
      case 429:
        errorMessage = tooManyError
        break
      default:
        errorMessage = 'An unknown error occurred. Please try again later.'
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    form.querySelector<HTMLElement>(errorSelector)!.textContent = errorMessage
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    form.querySelector<HTMLElement>(errorSelector)!.hidden = false
    if (inputElementSelector) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      form.querySelector<HTMLInputElement>(inputElementSelector)!.value = ''
    }

    // rethrow error if not expected, only after surfacing it in flash
    // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
    if (error.response.status !== 401 && error.response.status !== 429) {
      throw error
    }

    return
  }
  succeeded = true
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  form.closest<HTMLElement>('details')!.removeAttribute('open')
}

remoteForm('.js-sudo-webauthn-form', async function (form, wants) {
  await sudoModalErrorOrClose(form, wants)
})

remoteForm('.js-sudo-github-mobile-form', async function (form, wants) {
  await sudoModalErrorOrClose(form, wants)
})

remoteForm('.js-sudo-totp-form', async function (form, wants) {
  await sudoModalErrorOrClose(form, wants, undefined, undefined, '.flash-error', '#totp')
})

remoteForm('.js-sudo-email-form', async function (form, wants) {
  await sudoModalErrorOrClose(form, wants, undefined, undefined, '.flash-error', '#email')
})

remoteForm('.js-sudo-password-form', async function (form, wants) {
  await sudoModalErrorOrClose(
    form,
    wants,
    'Incorrect password.',
    'Too many password attempts. Please wait and try again.',
    undefined,
    '.js-sudo-password',
  )
})

/**
 * Check if user is in sudo mode. If not, show a sudo prompt.
 *
 * @returns {Promise<boolean>} - Will be `true` if user is in or got in sudo mode after prompt.
 */
export default async function triggerSudoPrompt(currentTarget?: HTMLElement): Promise<boolean> {
  const response = await fetch('/sessions/in_sudo', {
    headers: {accept: 'application/json', ...getBaseFetchHeaders()},
  })
  if (response.ok) {
    const sudoResponse = await response.text()
    if (sudoResponse === 'true') {
      return true
    }
  }
  return sudoPrompt(currentTarget)
}

export async function fetchSessionInSudo(): Promise<boolean> {
  const response = await fetch('/sessions/in_sudo', {
    headers: {accept: 'application/json', ...getBaseFetchHeaders()},
  })
  if (response.ok) {
    const sudoResponse = await response.text()
    if (sudoResponse === 'true') {
      return true
    }
  }
  return false
}
