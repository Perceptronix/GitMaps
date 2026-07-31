// selector-observer processes dom mutations in two phases. This module
// processes DOM mutations, revalidates selectors against the target element and
// enqueues a Change for an observer's hooks to be run.

import {addMap} from './state'
import {detectInnerHTMLReplacementBuggy, supportsSelectorMatching} from './support'
import {ADD, REMOVE, REMOVE_ALL} from './types'
import type {Change, ObserverHost} from './types'

// A handler for processing MutationObserver mutations.
export function handleMutations(selectorObserver: ObserverHost, changes: Change[], mutations: MutationRecord[]): void {
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      addNodes(selectorObserver, changes, mutation.addedNodes)
      removeNodes(selectorObserver, changes, mutation.removedNodes)
    } else if (mutation.type === 'attributes') {
      revalidateObservers(selectorObserver, changes, mutation.target as Element)
    }
  }
  if (detectInnerHTMLReplacementBuggy(selectorObserver.ownerDocument)) {
    revalidateOrphanedElements(selectorObserver, changes)
  }
}

// Run observer node "add" callback once on any matching node and its subtree.
export function addNodes(selectorObserver: ObserverHost, changes: Change[], nodes: ArrayLike<Node>): void {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (!node) continue

    if (supportsSelectorMatching(node)) {
      const matches = selectorObserver.selectorSet.matches(node as Element)
      for (const {data} of matches) {
        changes.push([ADD, node as Element, data])
      }
    }

    if ('querySelectorAll' in node) {
      const matches2 = selectorObserver.selectorSet.queryAll(node as Element)
      for (const {data, elements} of matches2) {
        for (const element of elements) {
          changes.push([ADD, element, data])
        }
      }
    }
  }
}

// Run all observer node "remove" callbacks on the node and its entire subtree.
export function removeNodes(selectorObserver: ObserverHost, changes: Change[], nodes: ArrayLike<Node>): void {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (node && 'querySelectorAll' in node) {
      changes.push([REMOVE_ALL, node as Element])
      const descendants = (node as Element).querySelectorAll('*')
      for (const descendant of descendants) {
        changes.push([REMOVE_ALL, descendant])
      }
    }
  }
}

// Recheck all "add" observers to see if the selector still matches. If not, run the "remove" callback.
export function revalidateObservers(selectorObserver: ObserverHost, changes: Change[], node: Element): void {
  if (supportsSelectorMatching(node)) {
    const matches = selectorObserver.selectorSet.matches(node)
    for (const {data} of matches) {
      changes.push([ADD, node, data])
    }
  }

  if ('querySelectorAll' in node) {
    const ids = addMap.get(node)
    if (ids) {
      for (const id of ids) {
        const observer = selectorObserver.observers[id]
        if (observer && !selectorObserver.selectorSet.matchesSelector(node, observer.selector)) {
          changes.push([REMOVE, node, observer])
        }
      }
    }
  }
}

// Recheck "add" observers on node and all its descendants.
export function revalidateDescendantObservers(selectorObserver: ObserverHost, changes: Change[], node: Element): void {
  if ('querySelectorAll' in node) {
    revalidateObservers(selectorObserver, changes, node)
    const descendants = node.querySelectorAll('*')
    for (const descendant of descendants) {
      revalidateObservers(selectorObserver, changes, descendant)
    }
  }
}

// Recheck inputs after a "change" event and possible related form elements.
export function revalidateInputObservers(
  selectorObserver: ObserverHost,
  changes: Change[],
  inputs: readonly unknown[],
): void {
  for (const rawInput of inputs) {
    const input = rawInput as {form?: HTMLFormElement | null}
    const els = input.form ? input.form.elements : selectorObserver.rootNode.querySelectorAll('input')
    for (const el of els) {
      revalidateObservers(selectorObserver, changes, el)
    }
  }
}

// Check all observed elements to see if they are still in the DOM. Only runs on IE where innerHTML replacement is buggy.
export function revalidateOrphanedElements(selectorObserver: ObserverHost, changes: Change[]): void {
  for (let i = 0; i < selectorObserver.observers.length; i++) {
    const observer = selectorObserver.observers[i]
    if (observer) {
      const {elements} = observer
      for (const el of elements) {
        if (!el.parentNode) {
          changes.push([REMOVE_ALL, el])
        }
      }
    }
  }
}
