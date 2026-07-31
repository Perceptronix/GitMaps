import {upload} from '@github-ui/batch-upload'
import {resetState, configFromElement, callbacksFromElement} from '@github-ui/batch-upload/element-helpers'
import Batch from '@github-ui/batch-upload/batch'
import {observe} from '@github-ui/selector-observer'
import {on} from 'delegated-events'

// Synchronize element state with primer styles. This should be replaced with CSS.
observe('file-attachment[hover]', {
  add(el) {
    el.classList.add('dragover')
  },
  remove(el) {
    el.classList.remove('dragover')
  },
})

// Cancel empty drops after filtering out hidden dot files.
on('file-attachment-accept', 'file-attachment', function (event) {
  const {attachments} = event.detail
  if (attachments.length === 0) {
    resetState(event.currentTarget as HTMLElement, 'is-hidden-file')
    event.preventDefault()
  }
})

// Upload batched files after passing validation.
on('file-attachment-accepted', 'file-attachment', function (event) {
  // CodeEditor will hide this element if it wants to handle uploads
  const dragAndDropLabel = event.currentTarget.querySelector<HTMLElement>('.drag-and-drop')
  if (dragAndDropLabel && dragAndDropLabel.hidden) {
    return
  }

  const container = event.currentTarget as HTMLElement
  const {attachments} = event.detail
  upload(new Batch(attachments), configFromElement(container), callbacksFromElement(container))
})

// Transfer click on button to hidden file input.
on('click', 'button[data-file-attachment-for]', function (event) {
  const button = event.currentTarget as HTMLButtonElement
  const inputId = button.getAttribute('data-file-attachment-for')
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const input = document.querySelector<HTMLInputElement>(`input[type=file]#${inputId}`)!
  input.click()
})

let count = 0

observe('file-attachment', {
  add(el) {
    if (count++ === 0) {
      document.addEventListener('drop', onDocumentDrop)
      document.addEventListener('dragover', onDocumentDragover)
    }
    const form = el.closest('form')
    if (form) {
      form.addEventListener('reset', onFormReset)
    }
  },
  remove(el) {
    if (--count === 0) {
      document.removeEventListener('drop', onDocumentDrop)
      document.removeEventListener('dragover', onDocumentDragover)
    }

    const form = el.closest('form')
    if (form) {
      form.removeEventListener('reset', onFormReset)
    }
  },
})

function hasFile(transfer: DataTransfer): boolean {
  return Array.from(transfer.types).indexOf('Files') >= 0
}

// Ignores accidental drops that miss the textarea.
function onDocumentDrop(event: DragEvent) {
  const transfer = event.dataTransfer
  if (transfer && hasFile(transfer)) {
    event.preventDefault()
  }
}

// Prevent accidental drops until we're over a textarea.
function onDocumentDragover(event: DragEvent) {
  const transfer = event.dataTransfer
  if (transfer && hasFile(transfer)) {
    event.preventDefault()
  }
}

// Parent form has been reset. Reset uploadable state back to default.
function onFormReset({currentTarget}: Event) {
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const container = (currentTarget as Element).querySelector<HTMLElement>('file-attachment')!
  resetState(container, 'is-default')
}
