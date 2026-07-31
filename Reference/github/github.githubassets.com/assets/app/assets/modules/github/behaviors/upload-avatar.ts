import {dialog} from '@github-ui/details-dialog'
import {fetchSafeDocumentFragment} from '@github-ui/fetch-utils'
import {on} from 'delegated-events'
import {getBaseFetchHeaders} from '@github-ui/fetch-headers'

on('upload:setup', '.js-upload-avatar-image', function (event) {
  const {form} = event.detail
  const orgId = event.currentTarget.getAttribute('data-alambic-organization')
  const ownerType = event.currentTarget.getAttribute('data-alambic-owner-type')
  const ownerId = event.currentTarget.getAttribute('data-alambic-owner-id')
  if (orgId) {
    form.append('organization_id', orgId)
  }
  if (ownerType) {
    form.append('owner_type', ownerType)
  }
  if (ownerId) {
    form.append('owner_id', ownerId)
  }
})

on('upload:complete', '.js-upload-avatar-image', function (event) {
  const {attachment} = event.detail
  const url = `/settings/avatars/${attachment.id}`
  dialog({content: fetchSafeDocumentFragment(document, url), detailsClass: 'upload-avatar-details'})
})

on('dialog:remove', '.upload-avatar-details', async function (element) {
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const cropForm = element.currentTarget.querySelector('#avatar-crop-form')!
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const id = cropForm.getAttribute('data-alambic-avatar-id')!
  const url = `/settings/avatars/${id}?op=destroy`

  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const csrfToken = element.currentTarget.querySelector('.js-avatar-post-csrf')!.getAttribute('value')!

  const request = new Request(url, {
    method: 'POST',
    headers: {
      'Scoped-CSRF-Token': csrfToken,
      ...getBaseFetchHeaders(),
    },
  })

  await self.fetch(request)
})
