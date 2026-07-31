// Action name extraction for ICV interactions.
// Derives a human-readable name from a clicked element using a priority strategy
// modeled after Datadog RUM's getActionNameFromElement.

import {isFeatureEnabled} from '@github-ui/feature-flags'
import type {NameFoundBy} from './types'

const MAX_NAME_LENGTH = 100
const MAX_PARENTS = 10

// Custom attribute that overrides auto-naming
const ICV_NAME_ATTRIBUTE = 'data-icv-name'

/**
 * Get a human-readable action name from a clicked element.
 *
 * Behavior:
 * - The explicit `data-icv-name` attribute is always honored first (walking all parents).
 * - All other automatic strategies (aria attributes, text content, etc.) are only applied
 *   when the `icv_observer_automatic_action_name` feature flag is enabled. When the flag
 *   is disabled and no `data-icv-name` is found, a fixed explanatory action name is
 *   returned instead of running the automatic discovery.
 *
 * When automatic discovery is enabled, the priority is:
 * 1. data-icv-name attribute (walks all parents)
 * 2. aria-labelledby (resolves referenced element IDs)
 * 3. aria-label
 * 4. Button/label text content
 * 5. title attribute
 * 6. alt attribute
 * 7. placeholder attribute
 * 8. Fallback: innerText of the element (truncated)
 */

type ActionNameResult = {
  actionName: string
  nameFoundBy: NameFoundBy
}

export function getActionName(element: Element): ActionNameResult {
  // Priority 1: explicit data-icv-name attribute (walk all parents)
  const programmatic = closestAttribute(element, ICV_NAME_ATTRIBUTE)
  if (programmatic) return {actionName: truncate(programmatic), nameFoundBy: 'data-icv-name'}

  // To prevent noise, conditionally add automatic action name tracking
  if (!isFeatureEnabled('icv_observer_automatic_action_name')) {
    return {
      actionName: '[data-icv-name] attribute must be added. Automatic name discovery is not enabled',
      nameFoundBy: 'automatic-name-not-enabled',
    }
  }

  // Walk up to MAX_PARENTS parents trying priority strategies
  let current: Element | null = element
  let depth = 0

  while (current && depth <= MAX_PARENTS && current.nodeName !== 'BODY' && current.nodeName !== 'HTML') {
    // Priority 2: aria-labelledby (resolves referenced element text)
    const labelledBy = getAriaLabelledByText(current)
    if (labelledBy) return {actionName: truncate(labelledBy), nameFoundBy: 'aria-labelledby'}

    // Priority 3: aria-label
    const ariaLabel = current.getAttribute('aria-label')
    if (ariaLabel?.trim()) return {actionName: truncate(ariaLabel.trim()), nameFoundBy: 'aria-label'}

    // Priority 4: button/label text
    if (isButtonLike(current)) {
      const text = getTextContent(current)
      if (text) return {actionName: truncate(text), nameFoundBy: 'button-text'}
    }

    // Priority 5: title
    const title = current.getAttribute('title')
    if (title?.trim()) return {actionName: truncate(title.trim()), nameFoundBy: 'title'}

    // Priority 6: alt
    const alt = current.getAttribute('alt')
    if (alt?.trim()) return {actionName: truncate(alt.trim()), nameFoundBy: 'alt'}

    // Priority 7: placeholder
    const placeholder = current.getAttribute('placeholder')
    if (placeholder?.trim()) return {actionName: truncate(placeholder.trim()), nameFoundBy: 'placeholder'}

    // Stop at form boundaries
    if (current.nodeName === 'FORM') break

    current = current.parentElement
    depth++
  }

  // Priority 8: fallback to innerText of original element
  const fallbackText = getTextContent(element)
  if (fallbackText) return {actionName: truncate(fallbackText), nameFoundBy: 'innerText'}

  return {actionName: '', nameFoundBy: 'NOT FOUND'}
}

function closestAttribute(element: Element, attribute: string): string | null {
  let current: Element | null = element
  while (current) {
    const value = current.getAttribute(attribute)
    if (value) return value
    current = current.parentElement
  }
  return null
}

function getAriaLabelledByText(element: Element): string {
  const ids = element.getAttribute('aria-labelledby')?.trim()
  if (!ids) return ''

  const root = element.getRootNode() as Document | ShadowRoot
  const parts: string[] = []

  for (const id of ids.split(/\s+/)) {
    const referenced = root.getElementById(id)
    if (referenced) {
      const text = getTextContent(referenced)
      if (text) parts.push(text)
    }
  }

  return parts.join(' ')
}

function isButtonLike(element: Element): boolean {
  const tag = element.nodeName
  return tag === 'BUTTON' || tag === 'LABEL' || tag === 'SUMMARY' || element.getAttribute('role') === 'button'
}

function getTextContent(element: Element): string {
  const textContent = element.textContent?.trim()
  return textContent ? normalizeWhitespace(textContent) : ''
}

function normalizeWhitespace(s: string): string {
  return s.replace(/\s+/g, ' ')
}

function truncate(s: string): string {
  return s.length > MAX_NAME_LENGTH ? `${s.slice(0, MAX_NAME_LENGTH)} [...]` : s
}
