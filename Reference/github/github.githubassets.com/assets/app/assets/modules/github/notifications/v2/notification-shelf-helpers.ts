import {storeAndStripShelfParams} from './notification-shelf-referrer-params'
import type {Kicker} from '@github-ui/remote-form'
import {remoteForm} from '@github-ui/remote-form'
import {updateNotificationStates} from './update-notification-states'

// Perform an action and change the status of the notification shelf.
export async function remoteShelfActionForm() {
  return remoteForm('.js-notification-shelf .js-notification-action form', async function (form, wants) {
    const shouldRedirect = form.hasAttribute('data-redirect-to-inbox-on-submit')

    if (shouldRedirect) {
      await performRequest(wants)
      /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
      const inboxButton = document.querySelector<HTMLAnchorElement>('.js-notifications-back-to-inbox')!

      if (inboxButton) {
        inboxButton.click()
      }

      return
    }

    updateNotificationStates(form, form)
    await performRequest(wants)
  })
}

export function urlWithoutNotificationParameters() {
  const searchParams = new URLSearchParams(window.location.search)
  const cleanSearchParams = storeAndStripShelfParams(searchParams)

  if (cleanSearchParams) {
    const newUrl = new URL(window.location.href, window.location.origin)
    newUrl.search = cleanSearchParams.toString()
    return newUrl.toString()
  }
}

// Submits an AJAX request, but ignores any errors.
async function performRequest(wants: Kicker) {
  try {
    await wants.text()
  } catch {
    // TODO show error message
  }
}
