// observe() provides a declarative hook that is informed when an element becomes
// matched by a selector, and then when it stops matching the selector.
//
//   observe('.js-foo', el => { ... })
//   observe('.js-bar', {add(el) { ... }, remove(el) { ... }})
//
// Vendored from @github/selector-observer v3.0.0-pre3 (github/selector-observer)
// and ported to TypeScript so we own the matching engine.

import SelectorObserver from './selector-observer'
import type {Handlers, InitializerCallback} from './types'

const noopObserver: {abort(): void} = {abort() {}}

let documentObserver: SelectorObserver | undefined

export function getDocumentObserver(): SelectorObserver {
  if (!documentObserver) {
    documentObserver = new SelectorObserver(window.document)
  }
  return documentObserver
}

export function observe(a: string | Handlers, b?: InitializerCallback | Partial<Handlers>): {abort(): void} {
  // SSR-safe: selector-observer has no effect without a DOM.
  if (typeof window === 'undefined') return noopObserver
  return getDocumentObserver().observe(a, b)
}

export function triggerObservers(container: Element): void {
  if (typeof window === 'undefined') return
  getDocumentObserver().triggerObservers(container)
}
