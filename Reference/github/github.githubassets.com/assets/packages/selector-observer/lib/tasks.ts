// Schedules a macro task by twiddling an attribute on a detached element and
// observing it with a MutationObserver. This batches callbacks into a single
// micro-ish task without depending on setTimeout/Promise ordering.

let el: HTMLElement | null = null
let observer: MutationObserver | null = null
let queue: Array<() => void> = []

export function scheduleBatch<A extends unknown[]>(
  document: Document,
  callback: (calls: A[]) => void,
): (...args: A) => void {
  let calls: A[] = []

  function processBatchQueue(): void {
    const callsCopy = calls
    calls = []
    callback(callsCopy)
  }

  function scheduleBatchQueue(...args: A): void {
    calls.push(args)
    if (calls.length === 1) scheduleMacroTask(document, processBatchQueue)
  }

  return scheduleBatchQueue
}

export function scheduleMacroTask(document: Document, callback: () => void): void {
  if (!observer) {
    observer = new MutationObserver(handleMutations)
  }

  if (!el) {
    el = document.createElement('div')
    observer.observe(el, {attributes: true})
  }

  queue.push(callback)
  el.setAttribute('data-twiddle', `${Date.now()}`)
}

function handleMutations(): void {
  const callbacks = queue
  queue = []
  for (const callback of callbacks) {
    try {
      callback()
    } catch (error) {
      setTimeout(() => {
        throw error
      }, 0)
    }
  }
}
