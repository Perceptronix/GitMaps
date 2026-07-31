import {announce} from '@github-ui/aria-live'
import {remoteForm} from '@github-ui/remote-form'

remoteForm('.js-form-toggle-target', async function (form, wants) {
  try {
    await wants.text()
  } catch {
    return
  }

  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const container = form.closest<HTMLElement>('.js-form-toggle-container')!
  const button = container.querySelector<HTMLElement>('.js-form-toggle-target[hidden]')
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  button!.hidden = false
  form.hidden = true
  const feedback = form.getAttribute('data-sr-feedback') || ''
  if (feedback) {
    announce(feedback)
  }
  button?.querySelector<HTMLInputElement>('input[type=submit], button[type=submit]')?.focus()
})
