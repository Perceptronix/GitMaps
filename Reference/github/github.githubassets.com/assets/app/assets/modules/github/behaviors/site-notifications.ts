import {remoteShelfActionForm, urlWithoutNotificationParameters} from './../notifications/v2/notification-shelf-helpers'
import {getStoredShelfParamsForCurrentPage} from './../notifications/v2/notification-shelf-referrer-params'
import {loaded} from '@github-ui/document-ready'
import {on} from 'delegated-events'
import {requestSubmit} from '@github-ui/form-utils'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {updateUrl} from '@github-ui/history'
import {getBaseFetchHeaders} from '@github-ui/fetch-headers'

remoteShelfActionForm()

// Remove the notification_referrer_id parameter from the url on page load and on Turbo loads
function removeNotificationParams() {
  const newUrl = urlWithoutNotificationParameters()
  if (newUrl) updateUrl(newUrl)
}
removeNotificationParams()
document.addEventListener(SOFT_NAV_STATE.SUCCESS, removeNotificationParams)

// pass the notifications params through turbo requests so we properly show the shelf
document.addEventListener('turbo:before-fetch-request', function (event) {
  const params = getStoredShelfParamsForCurrentPage(event.detail.url.pathname)

  if (params) {
    const newParams = new URLSearchParams(event.detail.url.search)
    for (const [key, value] of Object.entries<string>(params)) {
      if (value) {
        newParams.set(key, value)
      }
    }
    event.detail.url.search = newParams.toString()
  }
})

on('submit', '.js-mark-notification-form', async function (event) {
  const form = event.currentTarget as HTMLFormElement
  event.preventDefault()
  try {
    await fetch(form.action, {
      method: form.method,
      body: new FormData(form),
      headers: {
        Accept: 'application/json',
        ...getBaseFetchHeaders(),
      },
    })
  } catch {
    // Ignore network errors
  }
})

// mark related notification as read
async function markNotificationAsRead() {
  await loaded

  const form = document.querySelector('.js-mark-notification-form')
  if (form instanceof HTMLFormElement) {
    requestSubmit(form)
  }
}

document.addEventListener(SOFT_NAV_STATE.SUCCESS, markNotificationAsRead)
markNotificationAsRead()
