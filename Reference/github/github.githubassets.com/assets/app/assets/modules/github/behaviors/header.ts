import {observe} from '@github-ui/selector-observer'
import {toggleDetailsTarget} from './details'

observe('.js-skip-to-content', element => {
  element.addEventListener('focus', event => {
    const target = event.currentTarget as HTMLElement
    if (target.getAttribute('data-skip-target-assigned') === 'true') return

    const defaultContentID = 'main-content'
    let mainElement = document.querySelector('main')
    if (!mainElement) mainElement = document.querySelector('#skip-to-content')?.nextElementSibling as HTMLElement
    if (!mainElement) return

    let mainElementID = mainElement.getAttribute('id')

    if (!mainElementID) {
      mainElementID = defaultContentID
      mainElement.setAttribute('id', mainElementID)
    }

    target.setAttribute('href', `#${mainElementID}`)
    target.setAttribute('data-skip-target-assigned', 'true')
  })

  element.addEventListener('click', event => {
    const target = event.currentTarget as HTMLElement
    const href = target.getAttribute('href')
    if (!href) return

    const mainContent = document.querySelector(href) as HTMLElement
    if (!mainContent) return

    mainContent.setAttribute('tabindex', '-1')
    mainContent.setAttribute('data-skipped-to-content', '1')
    mainContent.focus()
  })
})

export function hasSkippedToContent() {
  const skippedToContent = document.querySelector('[data-skipped-to-content]')
  if (skippedToContent) {
    skippedToContent.removeAttribute('data-skipped-to-content')
    return true
  }
  return false
}

const touchDevice = 'ontouchstart' in document
const headerMenuItems = document.querySelectorAll<HTMLElement>('.js-header-menu-item')
for (const menuItem of headerMenuItems) {
  menuItem.addEventListener('details:toggled', event => {
    const target = event.target as HTMLInputElement

    if (event instanceof CustomEvent && event.detail.open) {
      for (const item of headerMenuItems) {
        if (item !== target) {
          toggleDetailsTarget(item, {force: false})
        }
      }
    }
  })

  if (!touchDevice) {
    menuItem.addEventListener('mouseleave', event => {
      const target = event.target as HTMLInputElement

      if (target.classList.contains('open')) {
        toggleDetailsTarget(target, {force: false})
      }
    })
  }
}

document.addEventListener('context-region-label:update', event => {
  if (!(event instanceof CustomEvent && event.detail.label)) return

  const contextRegionLabels = document.querySelectorAll('.js-context-region-label')
  for (const contextRegionLabel of contextRegionLabels) {
    contextRegionLabel.textContent = event.detail.label
  }
})

document.addEventListener('turbo:before-cache', event => {
  for (const dialog of (event.target as HTMLElement).querySelectorAll('dialog[open], modal-dialog[open]')) {
    ;(dialog as HTMLDialogElement).close()
  }
})

// Add a class to the body when the search input is active so we can apply some custom styles
observe('qbsearch-input', () => {
  document.addEventListener('qbsearch-input:expand', () => {
    document.body.setAttribute('blackbird-search-active', 'true')
  })

  document.addEventListener('qbsearch-input:close', () => {
    document.body.setAttribute('blackbird-search-active', 'false')
    document.body.style.overflow = ''
  })
})
