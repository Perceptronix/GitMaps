import {remoteForm} from '@github-ui/remote-form'

remoteForm('form[data-replace-remote-form]', async function (form, wants) {
  form.classList.remove('is-error')
  form.classList.add('is-loading')
  try {
    let target: Element = form

    const response = await wants.html()
    const container = form.closest('[data-replace-remote-form-target]')
    if (container) {
      const id = container.getAttribute('data-replace-remote-form-target')
      /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
      target = id ? document.getElementById(id)! : container
    }
    target.replaceWith(response.html)
  } catch {
    form.classList.remove('is-loading')
    form.classList.add('is-error')
  }
})
