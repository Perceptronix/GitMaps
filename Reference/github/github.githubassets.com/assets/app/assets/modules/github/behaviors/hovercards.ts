import {compose, fromEvent} from '@github-ui/subscription'
import {fetchSafeDocumentFragment} from '@github-ui/fetch-utils'
import {hovercardAriaLabelForType, isHovercardEnabledForType, hovercardUrlFromTarget} from '@github-ui/hovercards'
import {HOVERCARD_TARGET_SELECTOR, OPEN_DELAY, CLOSE_DELAY} from '@github-ui/hovercards/constants'
import {
  isHovercardEnabledForUser,
  isHovercardHintEnabledForUser,
  HOVERCARD_KEYBOARD_SHORTCUT,
} from '@github-ui/hovercards/preferences'
import memoize from '@github/memoize'
import {observe} from '@github-ui/selector-observer'
import {focusTrap} from '@primer/behaviors'
import {on} from 'delegated-events'
import {trackView} from '@github-ui/hydro-tracking'

type Position = {
  containerTop: number
  containerLeft: number
  contentClassSuffix: string
}

let hovercardFocusTrapAbortController: AbortController | undefined = undefined

// The card content. Moved around the page to where the current hover is
let cardContentContainer = document.querySelector('.js-hovercard-content')
observe('.js-hovercard-content', {
  add: el => {
    cardContentContainer = el
  },
  remove: () => {
    cardContentContainer = document.querySelector('.js-hovercard-content')
  },
})

const cachedFetchSafeDocumentFragment = memoize(fetchSafeDocumentFragment, {
  hash: (document: Document, url: RequestInfo) => {
    return JSON.stringify([document.location, url])
  },
})

let currentTarget: Element | null | undefined
// Link with hovercard elements set on it
let hovercardTrigger: HTMLElement | null = null

let deactivateTimer: number | null

// Mouse position for when links wrap lines
let mouseX = 0

const caretDistanceFromTarget = 12

// For calculating position of the card when it hangs to the left
// NOTE: These need to stay in sync with certain CSS rules in order to keep the
// caret pointing at the target.
//
// caret distance from edge of card
const caretPaddingX = 24
const caretMarginY = 7
const caretPaddingY = caretPaddingX - caretMarginY

const caretHeight = 16

// The amount of extra time given to move into the content
const deactivateTimeout = CLOSE_DELAY

// The minimum time before opening the hovercard via mouseover
const activateTimeout = OPEN_DELAY

// Get the content class of a given selector.
// (Prefixes the selector with `Popover-message--`).
function contentClass(suffix: string): string {
  const contentClassPrefix = 'Popover-message--'
  return contentClassPrefix + suffix
}

// Track a load of the hovercard in octolytics if it stays for > 500ms.
function trackLoad(cardContentBody: HTMLElement) {
  setTimeout(() => {
    if (document.body && document.body.contains(cardContentBody)) {
      const trackingElement = cardContentBody.querySelector('[data-hydro-view]')
      if (trackingElement instanceof HTMLElement) {
        trackView(trackingElement)
      }
    }
  }, 500)
}

function hideCard() {
  if (!(cardContentContainer instanceof HTMLElement)) return
  window.removeEventListener('keydown', onEscapeWithCardOpen)
  cardContentContainer.style.display = 'none'
  cardContentContainer.removeAttribute('data-hovercard-target-url')
  const cardContent = cardContentContainer.querySelector('.Popover-message')
  if (cardContent instanceof HTMLElement) {
    cardContent.textContent = ''
  }
  currentTarget = null

  if (hovercardFocusTrapAbortController) {
    hovercardFocusTrapAbortController.abort()
  }
}

function selectRectNearestMouse(target: Element): DOMRect {
  const rects = target.getClientRects()
  let foundRect = rects[0] || target.getBoundingClientRect() || {top: 0, left: 0, height: 0, width: 0}

  if (rects.length > 0) {
    for (const rect of rects) {
      if (rect.left < mouseX && rect.right > mouseX) {
        foundRect = rect
        break
      }
    }
  }

  return foundRect
}

function calculatePositions(target: Element): Position {
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const {width: contentWidth, height: contentHeight} = cardContentContainer!.getBoundingClientRect()
  const {left: targetX, top: targetY, height: targetHeight, width: targetWidth} = selectRectNearestMouse(target)

  const roomBelowTarget = window.innerHeight - targetY

  const roomAbove = targetY > contentHeight
  const roomBelow = roomBelowTarget > contentHeight
  const moreRoomAbove = targetY >= roomBelowTarget

  // Check horizontal space availability
  const roomRight = window.innerWidth - (targetX + targetWidth) > contentWidth + caretDistanceFromTarget
  const roomLeft = targetX > contentWidth + caretDistanceFromTarget

  // Explicitly set via class, or auto-detect: if no room on right but room on left, hang left
  const hangLeft = target.classList.contains('js-hovercard-left') || (!roomRight && roomLeft)

  if (hangLeft) {
    // Position hovercard to the LEFT of the target
    const left = targetX - contentWidth - caretDistanceFromTarget
    const targetCenterY = targetY + targetHeight / 2

    let top

    // If there is no room above or below, show the hovercard on the top or bottom (whichever has the most room)
    if (!roomAbove && !roomBelow) {
      if (moreRoomAbove) {
        top = targetCenterY - contentHeight + caretPaddingY + caretHeight / 2
      } else {
        top = targetCenterY - caretPaddingY - caretHeight / 2
      }
    } else {
      top = roomAbove
        ? targetCenterY - contentHeight + caretPaddingY + caretHeight / 2
        : targetCenterY - caretPaddingY - caretHeight / 2
    }

    return {
      containerTop: top,
      containerLeft: left,
      contentClassSuffix: roomAbove ? 'right-bottom' : 'right-top',
    }
  } else {
    // Position hovercard ABOVE or BELOW the target
    const targetCenterX = targetX + targetWidth / 2
    const left = roomRight ? targetCenterX - caretPaddingX : targetCenterX - contentWidth + caretPaddingX

    let top

    // If there is no room above, below, or to the right, show the hovercard on the top or bottom (whichever has the most room)
    if (!roomAbove && !roomBelow && !roomRight) {
      if (moreRoomAbove) {
        top = targetY - contentHeight - caretDistanceFromTarget
      } else {
        top = targetY + targetHeight + caretDistanceFromTarget
      }
    } else {
      top = roomAbove
        ? targetY - contentHeight - caretDistanceFromTarget
        : targetY + targetHeight + caretDistanceFromTarget
    }

    const contentClassSuffix = roomAbove
      ? roomRight
        ? 'bottom-left'
        : 'bottom-right'
      : roomRight
        ? 'top-left'
        : 'top-right'
    return {containerTop: top, containerLeft: left, contentClassSuffix}
  }
}

function positionCard(target: Element, cardContent: Element) {
  if (!(cardContentContainer instanceof HTMLElement)) return

  // Hide container, reset popover styles
  cardContentContainer.style.visibility = 'hidden'
  cardContentContainer.style.display = 'block'
  cardContent.classList.remove(
    contentClass('bottom-left'),
    contentClass('bottom-right'),
    contentClass('right-top'),
    contentClass('right-bottom'),
    contentClass('top-left'),
    contentClass('top-right'),
  )

  const {containerTop, containerLeft, contentClassSuffix} = calculatePositions(target)

  // Add the class for correct caret location
  cardContent.classList.add(contentClass(contentClassSuffix))

  const ignorePageOffset = hasFixedPositioningAttribute(target, cardContentContainer)
  const yOffset = ignorePageOffset ? 0 : window.pageYOffset
  const xOffset = ignorePageOffset ? 0 : window.pageXOffset

  // Position the popover & inner message correctly
  cardContentContainer.style.setProperty('top', `${containerTop + yOffset}px`, 'important')
  cardContentContainer.style.setProperty('bottom', 'auto', 'important')

  cardContentContainer.style.left = `${containerLeft + xOffset}px`

  setZIndexOverride(target, cardContentContainer)

  // After positioning correctly, show the popover again
  cardContentContainer.style.visibility = ''
}

function showCard(fragment: DocumentFragment, target: Element, isMouseOver: boolean): AbortController | undefined {
  if (!(cardContentContainer instanceof HTMLElement)) return
  const cardContent = cardContentContainer.querySelector('.Popover-message')
  if (!(cardContent instanceof HTMLElement)) return

  window.addEventListener('keydown', onEscapeWithCardOpen)
  cardContent.textContent = ''

  const cardContentBody = document.createElement('div')
  for (const child of fragment.children) {
    cardContentBody.appendChild(child.cloneNode(true))
  }

  cardContent.appendChild(cardContentBody)

  positionCard(target, cardContent)
  trackLoad(cardContentBody)

  cardContentContainer.style.display = 'block'
  cardContentContainer.setAttribute('data-hovercard-target-url', target.getAttribute('data-hovercard-url') || '')
  cardContentContainer.setAttribute('aria-label', hovercardAriaLabelForType(target.getAttribute('data-hovercard-type')))
  cardContentContainer.setAttribute('role', 'region')
  if (isMouseOver) return undefined
  return focusTrap(cardContentContainer)
}

// Wrapper for backward compatibility with existing call sites
function hovercardsAreEnabledForType(target: Element): boolean {
  return isHovercardEnabledForType(target, target.getAttribute('data-hovercard-type'))
}

// When mousing over a hovercard target or pressing the hovercard-opening keyboard shortcut, load the data and show the card.
async function activateFn(event: Event, minimumTimeout?: number): Promise<void> {
  // Don't show hovercards on touch devices. Prevents mobile Safari users
  // from needing to double tap links with hovercards.
  // https://humanwhocodes.com/blog/2012/07/05/ios-has-a-hover-problem/
  const touchDevice = 'ontouchstart' in document
  if (touchDevice) return

  const isMouseOver = event instanceof MouseEvent
  const target = event.currentTarget

  if (event instanceof MouseEvent) {
    mouseX = event.clientX
  }

  // Prevent hovercards loading inside hovercards -- these variables aren't set unless a hovercard is already rendered
  if (!(target instanceof Element)) return
  if (currentTarget === target) return
  if (target.closest('.js-hovercard-content')) return

  // Don't actually show issue or PR hovercards unless the link has an ancestor
  // element with data-issue-and-pr-hovercards-enabled
  if (!hovercardsAreEnabledForType(target)) return

  hideCard()

  // Set the current target as the one we're currently hovered or focused on
  currentTarget = target

  const hovercardUrl = hovercardUrlFromTarget(target)

  let fragment: DocumentFragment | null | undefined
  try {
    const forcedDelay = new Promise(r => window.setTimeout(r, minimumTimeout, 0))
    await forcedDelay

    if (target === currentTarget) {
      fragment = await cachedFetchSafeDocumentFragment(document, hovercardUrl)
    }
  } catch (err) {
    // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
    const response: Response = err.response
    if (response && response.status === 404) {
      // eslint-disable-next-line i18n-text/no-en
      const notAvailableMessage = 'Hovercard is unavailable'
      target.setAttribute('aria-label', notAvailableMessage)
      target.classList.add('tooltipped', 'tooltipped-ne')
    } else if (response && response.status === 410) {
      const data: {[key: string]: string} = await response.clone().json()
      /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
      target.setAttribute('aria-label', data.message!)
      target.classList.add('tooltipped', 'tooltipped-ne')
    }
    return
  }

  // Ensure that the target is still the active one
  if (target === currentTarget && fragment) {
    hovercardFocusTrapAbortController = showCard(fragment, target, isMouseOver)
  }
}

// Load the data but don't show until at least `activateTimeout`. Only used when
// loading via mouseover.
function activateWithTimeoutFn(event: Event) {
  activateFn(event, activateTimeout)
}

// When leaving a hovercard, deactivate unless we're moving to another child.
// This allows the user to move to the content area without dismissing.
function deactivateFn(event: Event) {
  if (!currentTarget) return
  if (event instanceof MouseEvent && event.relatedTarget instanceof HTMLElement) {
    const relatedTarget = event.relatedTarget
    if (relatedTarget.closest('.js-hovercard-content') || relatedTarget.closest('[data-hovercard-url]')) {
      return
    }
  }
  hideCard()
}

// Deactivate after 250 ms unless the deactivate timer is canceled as a result
// of the user entering the hovercard content area.
function deactivateWithTimeoutFn(event: Event) {
  const targetWas = currentTarget

  deactivateTimer = window.setTimeout(() => {
    if (currentTarget === targetWas) {
      deactivateFn(event)
    }
  }, deactivateTimeout)
}

function preventScrolling(event: Event) {
  // This is specifically to prevent default browser behavior, not changing keyboard shortcuts.
  /* eslint eslint-comments/no-use: off */
  /* eslint-disable @github-ui/ui-commands/no-manual-shortcut-logic */
  if (!(event instanceof KeyboardEvent)) return
  if (event.altKey && event.key === 'ArrowUp') {
    // Don't scroll while moving focus (this occurs on non-Firefox browsers)
    event.preventDefault()
  }
  /* eslint-enable @github-ui/ui-commands/no-manual-shortcut-logic */
}
// Triggered when a link which has a hovercard is focused.
function keyupFn(event: Event) {
  // TODO: Refactor to use data-hotkey
  /* eslint-disable @github-ui/ui-commands/no-manual-shortcut-logic */
  if (!(event instanceof KeyboardEvent)) return
  switch (event.key) {
    case 'ArrowUp':
      if (event.altKey) {
        hovercardTrigger = document.activeElement as HTMLElement
        activateFn(event, 0)
      }
      break
    case 'Escape':
      deactivateFn(event)
      break
  }
  /* eslint-enable @github-ui/ui-commands/no-manual-shortcut-logic */
}

// Cancel the deactivation timer since the user is inside the content now
function cancelDeactivation() {
  if (deactivateTimer) clearTimeout(deactivateTimer)
}

if (cardContentContainer && isHovercardEnabledForUser()) {
  observe(HOVERCARD_TARGET_SELECTOR, {
    subscribe: el =>
      compose(
        fromEvent(el, 'mouseover', onMouseOver),
        fromEvent(el, 'mouseleave', onMouseLeave),
        fromEvent(el, 'keyup', keyupFn),
        fromEvent(el, 'keydown', preventScrolling),
      ),
  })

  if (isHovercardHintEnabledForUser()) {
    observe(HOVERCARD_TARGET_SELECTOR, {
      add(el) {
        el.setAttribute('aria-keyshortcuts', HOVERCARD_KEYBOARD_SHORTCUT)
      },
    })
  }

  observe(HOVERCARD_TARGET_SELECTOR, {
    remove(el) {
      // Hide the card if we're removing the element that triggered it
      if (currentTarget === el) hideCard()
    },
  })

  observe('.js-hovercard-content', {
    subscribe: el =>
      compose(
        fromEvent(el, 'mouseover', onContentsMouseOver),
        fromEvent(el, 'focusin', onContentsFocusIn),
        fromEvent(el, 'mouseleave', onMouseLeave),
        fromEvent(el, 'keydown', onContentsKeyDown),
      ),
  })

  // eslint-disable-next-line delegated-events/global-on
  on('menu:activated', 'details', hideCard)

  // hide the card when a turbo completes a new visit
  window.addEventListener('turbo:load', hideCard)

  window.addEventListener('statechange', hideCard)
}

/**
 * Refocus the hovercard trigger when the user keyboard-escapes out of the content.
 */
function onContentsKeyDown(event: Event) {
  /* eslint-disable @github-ui/ui-commands/no-manual-shortcut-logic */
  if (event instanceof KeyboardEvent) {
    if (event.key === 'Escape') {
      deactivateFn(event)
      hovercardTrigger?.focus()
    }
  }
  /* eslint-enable @github-ui/ui-commands/no-manual-shortcut-logic */
}

function onMouseLeave(event: Event) {
  deactivateWithTimeoutFn(event)
}

function onMouseOver(event: Event) {
  activateWithTimeoutFn(event)
}

function onContentsMouseOver() {
  cancelDeactivation()
}

function onContentsFocusIn() {
  // Don't dismiss the hovercard now that either mouse hover or keyboard focus is here
  cancelDeactivation()
}

function setZIndexOverride(target: Element, container: HTMLElement) {
  const zIndex = target.getAttribute('data-hovercard-z-index-override')
  if (zIndex) {
    container.style.zIndex = zIndex
  } else {
    // Reset to default z-index
    container.style.zIndex = '1000'
  }
}

// if the attribute is present, it will ignore the window scroll
// when positioning the element, allowing the hovercard to be placed
// as child of parents with position: fixed and still be properly positioned
function hasFixedPositioningAttribute(target: Element, container: HTMLElement) {
  const fixedPositionAttr = 'data-hovercard-fixed-positioning'
  return target.getAttribute(fixedPositionAttr) || container.getAttribute(fixedPositionAttr)
}

function onEscapeWithCardOpen(event: Event) {
  // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
  if (event instanceof KeyboardEvent && event.key === 'Escape') {
    hideCard()
  }
}
