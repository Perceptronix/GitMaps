// Behaviors complementing dialogs
import {observe} from '@github-ui/selector-observer'

// Eagerly load an <include-fragment> inside a <dialog>/<modal-dialog> when a user hovers on the button to click it
observe('button[data-show-dialog-id]', button => {
  button?.addEventListener('mouseenter', () => {
    const id = button.getAttribute('data-show-dialog-id')
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    const dialog = button.ownerDocument.getElementById(id!)
    dialog?.querySelector('include-fragment[loading=lazy]')?.setAttribute('loading', 'eager')
  })
})

observe('summary[data-show-dialog-id]', button => {
  button?.addEventListener('click', () => {
    const id = button.getAttribute('data-show-dialog-id')
    if (!id) return
    const dialog = button.ownerDocument.getElementById(id) as HTMLDialogElement
    dialog?.show()
  })
})
