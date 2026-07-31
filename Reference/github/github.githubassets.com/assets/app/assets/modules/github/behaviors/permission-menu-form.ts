import {remoteForm} from '@github-ui/remote-form'

remoteForm('.js-permission-menu-form', async function (form, wants) {
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const success = form.querySelector<HTMLElement>('.js-permission-success')!
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const error = form.querySelector<HTMLElement>('.js-permission-error')!

  success.hidden = true
  error.hidden = true
  form.classList.add('is-loading')

  let response
  try {
    response = await wants.json()
  } catch {
    // If the request errored, we'll set the error state and return.
    form.classList.remove('is-loading')
    error.hidden = false
    return
  }

  if (response.status === 200) {
    const selectPanel = form.querySelector('select-panel, select-panel-experimental')
    if (selectPanel) {
      const buttonLabelSpan = form.querySelector('span.Button-label')
      if (buttonLabelSpan) {
        buttonLabelSpan.textContent = `Role: ${response.json.action}`
      }
    }
  }

  form.classList.remove('is-loading')
  success.hidden = false

  const container = form.closest('.js-org-repo')
  if (container) {
    const data = response.json
    container.classList.toggle('with-higher-access', data['members_with_higher_access'])
  }
})
