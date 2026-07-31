import type {NormalizedSequenceString} from '@github-ui/hotkey'

/** Return a copy of the array without the first encountered instance of `value` (based on `===` comparison). */
export function filterOnce<T>(array: readonly T[], value: T) {
  let encounteredOnce = false
  return array.filter(el => {
    if (el === value && !encounteredOnce) {
      encounteredOnce = true
      return false
    }
    return true
  })
}

const ARIA_MODAL_SELECTOR = '[role="dialog"][aria-modal="true"]'

/**
 * The `:modal` pseudo-class (which matches native `<dialog>` elements opened with `showModal()`) is not available
 * everywhere: jsdom throws on it, and older Safari versions predate it. An unsupported pseudo-class makes
 * `querySelectorAll` throw a `SyntaxError`, which would break all keyboard command handling. So we feature-detect it
 * once (lazily, on first use in the browser) and fall back to matching only ARIA modals where it isn't supported.
 */
let cachedModalSelector: string | undefined
function getModalSelector(): string {
  if (cachedModalSelector !== undefined) return cachedModalSelector

  const withNativeDialog = `dialog:modal, ${ARIA_MODAL_SELECTOR}`
  try {
    // We only need to know whether the selector *parses* (an unsupported pseudo-class throws `SyntaxError`).
    // Probe against an empty fragment so the check parses the selector but traverses zero nodes, instead of
    // scanning the whole document. This runs once (on the first keydown) and is then cached.
    document.createDocumentFragment().querySelectorAll(withNativeDialog)
    cachedModalSelector = withNativeDialog
  } catch {
    cachedModalSelector = ARIA_MODAL_SELECTOR
  }
  return cachedModalSelector
}

export function getActiveModal() {
  const modals = [...document.querySelectorAll(getModalSelector())]
  const nonEmptyModals = modals.filter(modal => {
    return modal.childNodes.length > 0 && elementHasNonZeroHeight(modal)
  })
  return nonEmptyModals.length ? nonEmptyModals[nonEmptyModals.length - 1] : null
}

export function isInsideModal(modal: Element, element?: HTMLElement | null) {
  if (!element) {
    return false
  }

  return modal.contains(element) ?? false
}

function elementHasNonZeroHeight(element: Element): boolean {
  if (element.clientHeight > 0) return true

  for (const child of element.children) {
    if (elementHasNonZeroHeight(child)) return true
  }

  return false
}

export function setsEqual(a: Set<unknown>, b: Set<unknown>) {
  if (a.size !== b.size) return false
  for (const el of a) if (!b.has(el)) return false
  return true
}

/**
 * Iterate over the subsequences in a sequence. A subsequence is a sequence with any number of initial keys omitted.
 * Each subsequence is a candidate for a hotkey match.
 *
 * Example: `Meta Meta+x x` will yield `Meta Meta+x x`, `Meta+x x`, and `x`.
 */
export function getSubsequences(sequence: NormalizedSequenceString) {
  const parts = sequence.split(' ')
  const subsequences: NormalizedSequenceString[] = []
  while (parts.length >= 1) {
    subsequences.push(parts.join(' ') as NormalizedSequenceString)
    parts.shift()
  }
  return subsequences
}

export type ScopeType = 'scoped' | 'global'
