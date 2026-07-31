import {on} from 'delegated-events'

// Show README form when the task is clicked
on('click', '.readme-edit .js-readme-task-button', function (event) {
  const button = event.currentTarget as HTMLElement
  const form = button.nextElementSibling as HTMLElement

  if (form && form.classList.contains('js-readme-form')) {
    button.hidden = true
    form.hidden = false

    const textarea = form.querySelector('textarea')
    if (textarea) textarea.focus()
  }
})

// Show the README edit form when the edit button is clicked
on('click', '.readme-edit .js-comment-edit-button', function (event) {
  const editButton = event.currentTarget as HTMLElement
  const commentContainer = editButton.closest('.js-comment') as HTMLElement

  if (commentContainer) {
    commentContainer.classList.add('is-comment-editing')

    const form = commentContainer.querySelector('.js-readme-form') as HTMLElement
    if (form) {
      form.hidden = false
    }

    const textarea = form?.querySelector('textarea')
    if (textarea) textarea.focus()

    event.preventDefault()
  }
})

// Hide form and show the task button when cancel is clicked
on('click', '.readme-edit .js-readme-form .js-comment-cancel-button', function (event) {
  const cancelButton = event.currentTarget
  const form = cancelButton.closest('.js-readme-form') as HTMLElement
  const taskButton = form?.previousElementSibling as HTMLElement
  const commentContainer = cancelButton.closest('.js-comment') as HTMLElement

  if (form && taskButton && taskButton.classList.contains('js-readme-task-button')) {
    taskButton.hidden = false
    form.hidden = true

    event.preventDefault()
  } else if (commentContainer) {
    commentContainer.classList.remove('is-comment-editing')

    const commentForm = commentContainer.querySelector('.js-readme-form') as HTMLElement
    if (commentForm) {
      commentForm.hidden = true
    }

    event.preventDefault()
  }
})

// Handle form submission
on('submit', '.readme-edit .js-readme-form form', function (event) {
  const form = event.currentTarget.closest('.js-readme-form') as HTMLElement
  const taskButton = form?.previousElementSibling as HTMLElement
  const textarea = form?.querySelector('textarea') as HTMLTextAreaElement

  const readmeContent = textarea?.value || ''

  if (form) {
    const handleFormSubmission = () => {
      if (readmeContent.trim()) {
        window.location.reload()
      } else {
        if (taskButton && taskButton.classList.contains('js-readme-task-button')) {
          form.hidden = true
          taskButton.hidden = false
        } else {
          const commentContainer = form?.closest('.js-comment') as HTMLElement
          if (commentContainer) {
            commentContainer.classList.remove('is-comment-editing')
            form.hidden = true
          }
          window.location.reload()
        }
      }
    }

    const formElement = event.currentTarget as HTMLFormElement

    // Multiple event listeners are needed to ensure proper handling for different readme forms
    formElement.addEventListener('ajax:success', handleFormSubmission)
    formElement.addEventListener('ajax:complete', handleFormSubmission)

    const documentCompleteHandler = (e: Event) => {
      const target = (e as CustomEvent).target
      if (target === formElement) {
        handleFormSubmission()
        document.removeEventListener('ajax:complete', documentCompleteHandler)
      }
    }

    document.addEventListener('ajax:complete', documentCompleteHandler)

    // Fallback timeout to ensure page reload happens even if AJAX events don't fire properly
    // This is essential for the second readme form submission
    setTimeout(function () {
      window.location.reload()
    }, 2000)
  }
})
