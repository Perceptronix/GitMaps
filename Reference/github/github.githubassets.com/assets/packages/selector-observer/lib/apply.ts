// selector-observer processes dom mutations in two phases. This module applies
// the Change set from the first phase and invokes any registered hooks.

import {addMap} from './state'
import {ADD, REMOVE, REMOVE_ALL} from './types'
import type {Change, InitializerCallbacks, Observer, ObserverHost, Subscription} from './types'

const initMap = new WeakMap<Element, number[]>()
const initializerMap = new WeakMap<Element, Record<string, InitializerCallbacks>>()
const subscriptionMap = new WeakMap<Element, Record<string, Subscription>>()

export function applyChanges(selectorObserver: ObserverHost, changes: Change[]): void {
  for (const change of changes) {
    const [type, el, observer] = change
    if (type === ADD) {
      if (observer) {
        runInit(observer, el)
        runAdd(observer, el)
      }
    } else if (type === REMOVE) {
      if (observer) runRemove(observer, el)
    } else if (type === REMOVE_ALL) {
      runRemoveAll(selectorObserver.observers, el)
    }
  }
}

// Run observer node "initialize" callback once. Call when observer selector matches node.
function runInit(observer: Observer, el: Element): void {
  if (!(el instanceof observer.elementConstructor)) {
    return
  }

  let initIds = initMap.get(el)
  if (!initIds) {
    initIds = []
    initMap.set(el, initIds)
  }

  if (initIds.indexOf(observer.id) === -1) {
    let initializer: void | InitializerCallbacks = undefined
    if (observer.initialize) {
      initializer = observer.initialize.call(undefined, el)
    }
    if (initializer) {
      let initializers = initializerMap.get(el)
      if (!initializers) {
        initializers = {}
        initializerMap.set(el, initializers)
      }
      initializers[`${observer.id}`] = initializer
    }
    initIds.push(observer.id)
  }
}

// Run observer node "add" callback. Call when observer selector matches node.
function runAdd(observer: Observer, el: Element): void {
  if (!(el instanceof observer.elementConstructor)) {
    return
  }

  let addIds = addMap.get(el)
  if (!addIds) {
    addIds = []
    addMap.set(el, addIds)
  }

  if (addIds.indexOf(observer.id) === -1) {
    observer.elements.push(el)

    const initializers = initializerMap.get(el)
    const initializer = initializers ? initializers[`${observer.id}`] : null
    if (initializer && initializer.add) {
      initializer.add.call(undefined, el)
    }

    if (observer.subscribe) {
      const subscription = observer.subscribe.call(undefined, el)
      if (subscription) {
        let subscriptions = subscriptionMap.get(el)
        if (!subscriptions) {
          subscriptions = {}
          subscriptionMap.set(el, subscriptions)
        }
        subscriptions[`${observer.id}`] = subscription
      }
    }

    if (observer.add) {
      observer.add.call(undefined, el)
    }

    addIds.push(observer.id)
  }
}

// Run observer element "remove" callbacks. Call when element is removed from the DOM.
export function runRemove(observer: Observer, el: Element): void {
  if (!(el instanceof observer.elementConstructor)) {
    return
  }

  const addIds = addMap.get(el)
  if (!addIds) {
    return
  }

  let index = observer.elements.indexOf(el)
  if (index !== -1) {
    observer.elements.splice(index, 1)
  }

  index = addIds.indexOf(observer.id)
  if (index !== -1) {
    const initializers = initializerMap.get(el)
    const initializer = initializers ? initializers[`${observer.id}`] : null
    if (initializer) {
      if (initializer.remove) {
        initializer.remove.call(undefined, el)
      }
    }

    if (observer.subscribe) {
      const subscriptions = subscriptionMap.get(el)
      const subscription = subscriptions ? subscriptions[`${observer.id}`] : null
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe()
      }
    }

    if (observer.remove) {
      observer.remove.call(undefined, el)
    }

    addIds.splice(index, 1)
  }

  if (addIds.length === 0) {
    addMap.delete(el)
  }
}

// Runs all observer element "remove" callbacks. Call when element is completely removed from the DOM.
function runRemoveAll(observers: Observer[], el: Element): void {
  const addIds = addMap.get(el)
  if (!addIds) {
    return
  }

  const ids = addIds.slice(0)
  for (const id of ids) {
    const observer = observers[id]
    if (!observer) {
      continue
    }

    const index = observer.elements.indexOf(el)
    if (index !== -1) {
      observer.elements.splice(index, 1)
    }

    const initializers = initializerMap.get(el)
    const initializer = initializers ? initializers[`${observer.id}`] : null
    if (initializer && initializer.remove) {
      initializer.remove.call(undefined, el)
    }

    const subscriptions = subscriptionMap.get(el)
    const subscription = subscriptions ? subscriptions[`${observer.id}`] : null
    if (subscription && subscription.unsubscribe) {
      subscription.unsubscribe()
    }

    if (observer.remove) {
      observer.remove.call(undefined, el)
    }
  }
  addMap.delete(el)
}
