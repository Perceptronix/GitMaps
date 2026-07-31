import SelectorSet from 'selector-set'
import {scheduleBatch} from './tasks'
import {addNodes, handleMutations, revalidateDescendantObservers, revalidateInputObservers} from './changes'
import {applyChanges, runRemove} from './apply'
import {whenReady} from './ready'
import type {Change, Handlers, InitializerCallback, Observer, ObserverHost} from './types'

// Observer uid counter
let uid = 0

export default class SelectorObserver implements ObserverHost {
  rootNode: Element
  ownerDocument: Document
  observers: Observer[]
  selectorSet: SelectorSet<Observer>
  mutationObserver: MutationObserver
  _scheduleAddRootNodes: () => void
  _handleThrottledChangedTargets: (target: EventTarget | null) => void

  constructor(rootNode: Node) {
    this.rootNode = rootNode.nodeType === 9 ? (rootNode as Document).documentElement : (rootNode as Element)
    this.ownerDocument = rootNode.nodeType === 9 ? (rootNode as Document) : (rootNode.ownerDocument as Document)

    // Map of observer id to object
    this.observers = []

    // Index of selectors to observer objects
    this.selectorSet = new SelectorSet<Observer>()

    // Process all mutations from root element
    // eslint-disable-next-line ssr-friendly/no-dom-globals-in-constructor -- only instantiated client-side (observe() guards on typeof window)
    this.mutationObserver = new MutationObserver(mutations => handleRootMutations(this, mutations))

    this._scheduleAddRootNodes = scheduleBatch(this.ownerDocument, () => addRootNodes(this))

    this._handleThrottledChangedTargets = scheduleBatch(this.ownerDocument, (batched: Array<[EventTarget | null]>) =>
      handleChangedTargets(this, batched),
    )
    this.rootNode.addEventListener('change', event => handleChangeEvents(this, event), false)

    whenReady(this.ownerDocument, () => onReady(this))
  }

  disconnect(): void {
    this.mutationObserver.disconnect()
  }

  observe(a: string | Handlers, b?: InitializerCallback | Partial<Handlers>): Observer {
    let handlers: Handlers

    if (typeof b === 'function') {
      handlers = {selector: a as string, initialize: b}
    } else if (typeof b === 'object') {
      handlers = b as Handlers
      handlers.selector = a as string
    } else {
      handlers = a as Handlers
    }

    const observer: Observer = {
      id: uid++,
      selector: handlers.selector,
      initialize: handlers.initialize,
      add: handlers.add,
      remove: handlers.remove,
      subscribe: handlers.subscribe,
      elements: [],
      elementConstructor: Object.prototype.hasOwnProperty.call(handlers, 'constructor')
        ? (handlers as unknown as {constructor: {new (): Element}}).constructor
        : (this.ownerDocument.defaultView ?? window).Element,
      abort: () => {
        this._abortObserving(observer)
      },
    }
    this.selectorSet.add(observer.selector, observer)
    this.observers[observer.id] = observer
    this._scheduleAddRootNodes()

    return observer
  }

  _abortObserving(observer: Observer): void {
    for (const el of observer.elements) {
      runRemove(observer, el)
    }
    this.selectorSet.remove(observer.selector, observer)
    delete this.observers[observer.id]
  }

  // Internal: For hacking in dirty changes that aren't getting picked up
  triggerObservers(container: Element): void {
    const changes: Change[] = []
    revalidateDescendantObservers(this, changes, container)
    applyChanges(this, changes)
  }
}

function onReady(selectorObserver: SelectorObserver): void {
  selectorObserver.mutationObserver.observe(selectorObserver.rootNode, {
    childList: true,
    attributes: true,
    subtree: true,
  })
  selectorObserver._scheduleAddRootNodes()
}

function addRootNodes(selectorObserver: SelectorObserver): void {
  const changes: Change[] = []
  addNodes(selectorObserver, changes, [selectorObserver.rootNode])
  applyChanges(selectorObserver, changes)
}

function handleRootMutations(selectorObserver: SelectorObserver, mutations: MutationRecord[]): void {
  const changes: Change[] = []
  handleMutations(selectorObserver, changes, mutations)
  applyChanges(selectorObserver, changes)
}

function handleChangeEvents(selectorObserver: SelectorObserver, event: Event): void {
  selectorObserver._handleThrottledChangedTargets(event.target)
}

function handleChangedTargets(selectorObserver: SelectorObserver, inputs: readonly unknown[]): void {
  const changes: Change[] = []
  revalidateInputObservers(selectorObserver, changes, inputs)
  applyChanges(selectorObserver, changes)
}
