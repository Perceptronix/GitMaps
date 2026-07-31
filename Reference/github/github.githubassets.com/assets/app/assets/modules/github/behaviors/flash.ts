import {loaded} from '@github-ui/document-ready'

// Flash
//
// Fades out and removes flash element from the page on close.
//
// Markup
//
//     <div class="flash-messages">
//       <div class="flash">
//         <%= octicon('x', :class => 'flash-close js-flash-close') %>
//         Flash Message
//       </div>
//     </div>
//
import {on} from 'delegated-events'

// Only headings and focusable elements are allowed to be passed in as targets,
// otherwise they won't exist in the allFocusableElements array.
type FocusableElementsAndHeadings =
  | HTMLButtonElement
  | HTMLAnchorElement
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement
  | HTMLHeadingElement

// Ensures that focus is not lost when a user dismisses a flash message.
// Finds the closest, previous focusable element or <h1> that is not hidden or disabled and moves focus to that element.

const focusPreviousElementInDOM = (targetElement: FocusableElementsAndHeadings) => {
  // Get all focusable elements and headings (h1-h3) in the DOM that are not disabled or hidden
  const allFocusableElementsAndHeadings: FocusableElementsAndHeadings[] = Array.from(
    document.querySelectorAll(
      'h1:not([hidden]),h2:not([hidden]),h3:not([hidden]),button:not([disabled]):not([hidden]),a:not([hidden]),input:not([disabled]):not([hidden]), select:not([disabled]):not([hidden]), textarea:not([disabled]):not([hidden]), [tabindex]:not([tabindex="-1"]):not([disabled]):not([hidden])',
    ),
  )

  const visibleElements = Array.from(allFocusableElementsAndHeadings).filter(element => {
    // Check if the element and it's parent element is visible and not disabled or hidden
    if (
      !element.getAttribute('aria-hidden') &&
      !(element.offsetWidth <= 0 && element.offsetHeight <= 0) &&
      (element?.offsetParent as HTMLElement)?.style.visibility !== 'hidden'
    ) {
      return true
    }
  })

  const indexOfElement = visibleElements.indexOf(targetElement)

  if (indexOfElement !== -1 && indexOfElement > 0) {
    // Get the element right before the target element
    const elementBefore = visibleElements[indexOfElement - 1]
    // Forces the heading to have a tabindex of -1 so that it can be focused
    if (
      elementBefore &&
      (elementBefore.tagName === 'H1' || elementBefore.tagName === 'H2' || elementBefore.tagName === 'H3')
    ) {
      elementBefore.setAttribute('tabindex', '-1')
    }
    elementBefore?.focus()
  }
}

on('click', '.js-flash-close', function (event) {
  const container = event.currentTarget.closest('.flash-messages')

  const dismissButton = event.target as HTMLButtonElement
  focusPreviousElementInDOM(dismissButton)

  const flash = event.currentTarget.closest('.flash')
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  flash!.remove()

  if (container && !container.querySelector('.flash')) {
    container.remove()
  }
})

/**
 * Inserts an sr-only span with a non-breaking space into the flash content.
 * The sr-only ensures there are no visual changes.
/** */
export function insertNonBreakingSpace(flashAlertContent: HTMLElement) {
  const nonBreakingSpace = document.createTextNode('\u00A0')
  const span = document.createElement('span')
  span.classList.add('sr-only')
  span.appendChild(nonBreakingSpace)

  flashAlertContent.appendChild(span)
}

/**
 * Contains accessibility logic for server-rendered flash.
 * This JS ensures that the flash content with '.js-flash-alert[role="alert"]' is announced.
 * See: https://github.com/github/accessibility/issues/290
 * Please consult #accessibility if you have any questions.
 */
;(async function () {
  await loaded

  const flashAlertContent: HTMLElement | null = document.querySelector('.js-flash-alert[role="alert"]')
  if (flashAlertContent) {
    // Delay and non-breaking space to ensure that screen readers announce this alert.
    setTimeout(() => {
      insertNonBreakingSpace(flashAlertContent)
    }, 200)
  }
})()
