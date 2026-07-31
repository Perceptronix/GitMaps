import type {PendingInteraction} from './types'

// DOM elements to ignore in mutation tracking
export const ELEMENTS_TO_IGNORE = new Set(['meta', 'script', 'link', 'style', 'noscript'])

// Attribute used to mark a "precise mode" content element
export const ICV_MARKER_ATTR = 'data-icv-visible'

const ICV_TRACK = {
  devtools: {
    dataType: 'track-entry' as const,
    track: 'ICV',
    trackGroup: 'Performance Timeline',
    color: 'tertiary-dark' as const,
  },
}

export function buildMutationObserver(
  interaction: PendingInteraction,
  resetEndTimer: (interaction: PendingInteraction) => void,
  finalize: (interaction: PendingInteraction) => void,
): MutationObserver {
  return new MutationObserver(mutations => {
    if (interaction.settled) return

    performance.mark('icv:mutation-cb-start')
    const cbStart = performance.now()
    interaction.mutationCallbackCount++

    const revealedElements = getRevealedElements(mutations)
    const addedNodes = getAddedElements(mutations)
    interaction.mutationNodeCount += addedNodes.length

    interaction.mutationCallbackTime += performance.now() - cbStart
    performance.mark('icv:mutation-cb-end')
    performance.measure('icv:mutation-callback', {
      start: 'icv:mutation-cb-start',
      end: 'icv:mutation-cb-end',
      detail: {devtools: {...ICV_TRACK.devtools, tooltipText: 'Mutation callback'}},
    })

    if (addedNodes.length === 0 && revealedElements.length === 0) return

    // Mark that we saw DOM changes (survives validation timer)
    interaction.hadMutations = true

    // Defer all visibility checks and timing decisions to the next frame.
    // This avoids forced reflow during the mutation callback and prevents
    // premature finalization before network requests have started.
    requestAnimationFrame(() => {
      if (interaction.settled) return

      performance.mark('icv:raf-start')
      const rafStart = performance.now()

      // Precise mode: data-icv-visible marker found → finalize immediately
      const marker = findMarkerElement(addedNodes)
      if (marker) {
        interaction.markerFound = true
        interaction.contentElement = marker
        interaction.hadActivity = true
        interaction.rafTime += performance.now() - rafStart
        performance.mark('icv:raf-end')
        performance.measure('icv:raf', {
          start: 'icv:raf-start',
          end: 'icv:raf-end',
          detail: {devtools: {...ICV_TRACK.devtools, tooltipText: 'RAF (marker)'}},
        })
        finalize(interaction)
        return
      }

      // Check revealed attribute elements (hidden removed, details opened)
      for (const el of revealedElements) {
        if (isVisible(el)) {
          interaction.hadActivity = true
          interaction.contentElement = el
          resetEndTimer(interaction)
          interaction.rafTime += performance.now() - rafStart
          performance.mark('icv:raf-end')
          performance.measure('icv:raf', {
            start: 'icv:raf-start',
            end: 'icv:raf-end',
            detail: {devtools: {...ICV_TRACK.devtools, tooltipText: 'RAF (reveal)'}},
          })
          return
        }
      }

      // Check for new visible element insertions
      const visibleEl = findFirstVisibleElement(addedNodes)
      if (visibleEl) {
        interaction.hadActivity = true
        interaction.contentElement = visibleEl
        resetEndTimer(interaction)
      }

      interaction.rafTime += performance.now() - rafStart
      performance.mark('icv:raf-end')
      performance.measure('icv:raf', {
        start: 'icv:raf-start',
        end: 'icv:raf-end',
        detail: {devtools: {...ICV_TRACK.devtools, tooltipText: 'RAF'}},
      })
    })
  })
}

export function getElementType(element: Element): string {
  const tag = element.tagName.toLowerCase()
  const role = element.getAttribute('role')
  if (role) return `${tag}[role=${role}]`
  if (tag === 'input') {
    const type = (element as HTMLInputElement).type || 'text'
    return `input[type=${type}]`
  }
  return tag
}

export function isVisible(element: HTMLElement): boolean {
  return element.checkVisibility()
}

function findMarkerElement(nodes: Element[]): Element | null {
  for (const node of nodes) {
    if (node.hasAttribute(ICV_MARKER_ATTR)) return node
    const marker = node.querySelector(`[${ICV_MARKER_ATTR}]`)
    if (marker) return marker
  }
  return null
}

function getRevealedElements(mutations: MutationRecord[]): HTMLElement[] {
  const revealed: HTMLElement[] = []
  for (const mutation of mutations) {
    if (mutation.type !== 'attributes') continue
    const el = checkHiddenAttributeRemoved(mutation) ?? checkDetailsOpened(mutation)
    if (el) revealed.push(el)
  }
  return revealed
}

function checkHiddenAttributeRemoved({attributeName, target, oldValue}: MutationRecord): HTMLElement | null {
  if (
    attributeName === 'hidden' &&
    target instanceof HTMLElement &&
    oldValue !== null &&
    !target.hasAttribute('hidden')
  ) {
    return target
  }
  return null
}

function getAddedElements(mutations: MutationRecord[]): Element[] {
  const elements: Element[] = []
  for (const mutation of mutations) {
    if (mutation.type !== 'childList') continue
    for (const node of mutation.addedNodes) {
      if (node instanceof Element && !ELEMENTS_TO_IGNORE.has(node.tagName.toLowerCase())) {
        elements.push(node)
      }
    }
  }
  return elements
}

function checkDetailsOpened({attributeName, target, oldValue}: MutationRecord): HTMLElement | null {
  if (attributeName === 'open' && target instanceof HTMLDetailsElement && oldValue === null && target.open) {
    return target
  }
  return null
}

function findFirstVisibleElement(nodes: Element[]): HTMLElement | null {
  for (const node of nodes) {
    const el = node as HTMLElement
    if (isVisible(el)) return el
  }
  return null
}
