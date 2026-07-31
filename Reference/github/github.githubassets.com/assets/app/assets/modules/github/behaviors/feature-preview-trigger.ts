import {fire, on} from 'delegated-events'
import {dialog} from '@github-ui/details-dialog'
import {fetchSafeDocumentFragment} from '@github-ui/fetch-utils'
import {remoteForm} from '@github-ui/remote-form'
import {sendStats} from '@github-ui/stats'

/*
  Opens the feature preview dialog to a given feature specified by it's slug

  <button data-feature-preview-trigger-url="<%= feature_previews_path(user_id: login, selected_slug: "my_feature") %>">
    Opt in to the feature preview for My Feature
  </button>

  You can react to a feature being enrolled/unenrolled by the user with these events:

  - `feature-preview-enroll:my_feature`
  - `feature-preview-unenroll:my_feature`

  e.g.

  document.addEventListener('feature-preview-enroll:my_feature', () => {
    optInButton.hidden = true
    optOutButton.hidden = false
  })

  document.addEventListener('feature-preview-unenroll:my_feature', () => {
    optInButton.hidden = false
    optOutButton.hidden = true
  })
*/

on('click', '[data-feature-preview-trigger-url]', async event => {
  const trigger = event.currentTarget
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const url = trigger.getAttribute('data-feature-preview-trigger-url')!

  const newDialog = await dialog({
    content: fetchSafeDocumentFragment(document, url),
    dialogClass: 'feature-preview-dialog',
  })

  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const closeDetails = trigger.getAttribute('data-feature-preview-close-details')!
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const closeHmac = trigger.getAttribute('data-feature-preview-close-hmac')!

  newDialog.addEventListener('dialog:remove', () => {
    sendStats({hydroEventPayload: closeDetails, hydroEventHmac: closeHmac}, true)
  })

  const indicators = document.querySelectorAll<HTMLElement>('.js-feature-preview-indicator')
  for (const indicator of indicators) {
    indicator.hidden = true
  }
})

remoteForm('.js-feature-preview-unenroll', async (form, wants) => {
  await wants.text()
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const feature = form.querySelector<HTMLInputElement>('.js-feature-preview-slug')!.value
  fire(form, `feature-preview-unenroll:${feature}`)
})

remoteForm('.js-feature-preview-enroll', async (form, wants) => {
  await wants.text()
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const feature = form.querySelector<HTMLInputElement>('.js-feature-preview-slug')!.value
  fire(form, `feature-preview-enroll:${feature}`)
})
