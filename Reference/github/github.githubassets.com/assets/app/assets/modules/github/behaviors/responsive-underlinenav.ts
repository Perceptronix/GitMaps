import {fromEvent} from '@github-ui/subscription'
import {loaded} from '@github-ui/document-ready'
import {observe} from '@github-ui/selector-observer'

observe('.js-responsive-underlinenav', {
  constructor: HTMLElement,
  subscribe: nav => {
    asyncCalculateVisibility(nav)
    return fromEvent(window, 'resize', () => calculateVisibility(nav))
  },
})

export async function asyncCalculateVisibility(nav: HTMLElement) {
  await loaded
  calculateVisibility(nav)
}

function toggleItem(item: HTMLElement, hidden: boolean) {
  // Set visibility to hidden, instead of .hidden attribute
  // so we can still calculate distance accurately
  item.style.visibility = hidden ? 'hidden' : ''
  // Get tab-item name, if present, so we can match it up with the dropdown menu
  const itemName = item.getAttribute('data-tab-item')
  if (itemName) {
    const itemToHide = document.querySelector<HTMLElement>(`[data-menu-item=${itemName}]`)
    if (itemToHide instanceof HTMLElement) {
      itemToHide.hidden = !hidden
    }
  }
}

function calculateVisibility(nav: HTMLElement) {
  const items = nav.querySelectorAll<HTMLElement>('.js-responsive-underlinenav-item')
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const overflowContainer = nav.querySelector<HTMLElement>('.js-responsive-underlinenav-overflow')!
  const overflowOffset = positionedOffset(overflowContainer, nav)
  if (!overflowOffset) {
    return
  }

  // Phase 1: Batch all layout reads together to avoid forced synchronous layout
  const measurements: Array<{item: HTMLElement; rightEdge: number}> = []
  for (const item of items) {
    const itemOffset = positionedOffset(item, nav)
    if (itemOffset) {
      measurements.push({
        item,
        rightEdge: itemOffset.left + item.offsetWidth,
      })
    }
  }

  // Phase 2: Batch all writes together
  let anyHidden = false
  for (const {item, rightEdge} of measurements) {
    const hidden = rightEdge >= overflowOffset.left
    toggleItem(item, hidden)
    anyHidden = anyHidden || hidden
  }
  overflowContainer.style.visibility = anyHidden ? '' : 'hidden'
}

/**
 * Calculates the offset of an element relative to a container.
 * This is a pared down version of the original `positionedOffset` function in primer/behaviors
 * https://github.com/primer/behaviors/blob/1e568d6df7d8eebf3ca565a7562b8ae1c508b263/src/dimensions.ts#L171-L231
 * We forked a copy of it to remove expensive and unnecessary scrollHeight/scrollWidth calculations.
 * Since we only care about top and left offsets, we can simplify the logic significantly.
 */
function positionedOffset(
  targetElement: HTMLElement,
  container: HTMLElement | Document | Window | null,
): {top: number; left: number} | undefined {
  let element = targetElement
  const document = element.ownerDocument
  if (!document) {
    return
  }

  const documentElement = document.documentElement
  if (!documentElement) {
    return
  }

  /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
  // @ts-ignore
  const HTMLElement = document.defaultView.HTMLElement

  let top = 0
  let left = 0

  while (!(element === document.body || element === container)) {
    top += element.offsetTop || 0
    left += element.offsetLeft || 0

    if (element.offsetParent instanceof HTMLElement) {
      /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
      element = element.offsetParent!
    } else {
      return
    }
  }

  return {top, left}
}
