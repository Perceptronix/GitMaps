import {observe as originalObserve} from './lib'
import {sendEvent} from '@github-ui/hydro-analytics'
import {isFeatureEnabled} from '@github-ui/feature-flags'

type InitializerCallback<T extends Element = Element> = (
  el: T,
) => void | {add?: (el: T) => void; remove?: (el: T) => void}

type Options<T extends Element = Element> = {
  initialize?: InitializerCallback<T>
  add?: (el: T) => void
  remove?: (el: T) => void
  subscribe?: (el: T) => {unsubscribe(): void}
}

const sentKeys = new Set<string>()

function sendToHydro(selector: string) {
  if (!isFeatureEnabled('selector_observer_stats')) return

  const controller = document.querySelector<HTMLMetaElement>('meta[name="route-controller"]')?.content ?? ''
  const action = document.querySelector<HTMLMetaElement>('meta[name="route-action"]')?.content ?? ''
  const key = `${selector}:${controller}:${action}`
  if (sentKeys.has(key)) return
  sentKeys.add(key)

  sendEvent(
    'selector-observer.observe',
    {
      selector,
      controller,
      action,
      routePattern: document.querySelector<HTMLMetaElement>('meta[name="route-pattern"]')?.content,
    },
    {batched: true},
  )
}

function wrapCallback<T extends (...args: never[]) => unknown>(selector: string, fn: T): T {
  return ((...args: Parameters<T>) => {
    sendToHydro(selector)
    return fn(...args)
  }) as unknown as T
}

export function observe<T extends Element>(
  selector: string,
  initializeOrOptions: {constructor: {new (): T}} & Options<T>,
): {abort(): void}
export function observe(selector: string, initializeOrOptions: InitializerCallback | Options): {abort(): void}
export function observe(selector: string, initializeOrOptions: InitializerCallback | Options): {abort(): void} {
  if (typeof initializeOrOptions === 'function') {
    return originalObserve(selector, wrapCallback(selector, initializeOrOptions))
  }

  const {initialize, add, remove, subscribe, ...rest} = initializeOrOptions
  return originalObserve(selector, {
    ...rest,
    ...(initialize && {initialize: wrapCallback(selector, initialize)}),
    ...(add && {add: wrapCallback(selector, add)}),
    ...(remove && {remove: wrapCallback(selector, remove)}),
    ...(subscribe && {subscribe: wrapCallback(selector, subscribe)}),
  })
}
