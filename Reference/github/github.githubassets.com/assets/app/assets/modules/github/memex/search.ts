import {observe} from '@github-ui/selector-observer'

observe('#clear-project-search-button', button => {
  button?.setAttribute('type', 'button')

  button?.addEventListener('click', () => {
    const input = document.getElementById('project-search-input') as HTMLInputElement
    if (input) {
      input.value = ''
      input.focus()
    }
  })
})
