import {on} from 'delegated-events'
import {sendEvent} from '@github-ui/hydro-analytics'
import {ssrSafeDocument} from '@github-ui/ssr-utils'
import {debugHydroPayload} from '@github-ui/console-debug'
import {observe} from '@github-ui/selector-observer'
import {reportError} from '@github-ui/failbot'

const GENERIC_CLICK_EVENT_NAME = 'analytics.click'
const GENERIC_VISIBLE_EVENT_NAME = 'analytics.visible'
const ANALYTICS_VISIBLE_ATTR = 'data-analytics-visible'
const VISIBLE_SELECTORS = `[${ANALYTICS_VISIBLE_ATTR}]`

type LabelFields = Record<string, string>

function isMarketingPage(): boolean {
  return !!ssrSafeDocument?.head?.querySelector<HTMLMetaElement>('meta[name="is_logged_out_page"]')?.content
}

on('click', '[data-analytics-event]', event => {
  // marketing pages will use marketing/analytics-events.ts, instead of behaviors/analytics-events.ts
  if (isMarketingPage()) {
    return
  }
  const element = event.currentTarget

  const analyticsEvent = element.getAttribute('data-analytics-event')
  if (!analyticsEvent) return

  const analyticsEventAttributes = JSON.parse(analyticsEvent)

  debugHydroPayload('hydro-debug.click', `{"event_type": "${GENERIC_CLICK_EVENT_NAME}", "payload": ${analyticsEvent}}`)
  sendEvent(GENERIC_CLICK_EVENT_NAME, analyticsEventAttributes)
})

function isTag(element: Element, tagName: 'a'): element is HTMLAnchorElement
function isTag(element: Element, tagName: 'button'): element is HTMLButtonElement
function isTag(element: Element, tagName: 'a' | 'button'): boolean {
  return element.tagName.toLowerCase() === tagName
}

function parseLabels(labelString: string) {
  if (!labelString) {
    return {}
  }

  const labelFields: LabelFields = {}

  const labels = labelString.split(';').map(label => label.trim())
  for (const label of labels) {
    const [key, val] = label.split(':')
    if (key) {
      labelFields[key.trim()] = val?.trim() || key.trim()
    }
  }

  return labelFields
}

function parseAnalyticsAttr(dataAnalyticsClick: string | null) {
  if (!dataAnalyticsClick) {
    return {}
  }

  const analyticsEventAttributes = JSON.parse(dataAnalyticsClick)
  const {label} = analyticsEventAttributes

  return {
    ...parseLabels(label),
    ...analyticsEventAttributes,
  }
}

function getLinkAttributes(linkEl: HTMLAnchorElement) {
  return {
    text: linkEl.textContent || linkEl.getAttribute('aria-label') || '',
    target: linkEl.href,
  }
}

function getButtonAttributes(buttonEl: HTMLButtonElement) {
  const form = buttonEl.closest('form')

  return {
    text: buttonEl.textContent || buttonEl.getAttribute('aria-label') || '',
    role: buttonEl.getAttribute('type') || buttonEl.getAttribute('role') || 'button',
    ...(buttonEl.value && {
      value: buttonEl.value,
    }),
    ...(form && {
      formAction: form.getAttribute('action') || '',
    }),
  }
}

function getVisibleContext(currentTarget: EventTarget & Element) {
  return {
    ...(isTag(currentTarget, 'a') && getLinkAttributes(currentTarget)),
    ...(isTag(currentTarget, 'button') && getButtonAttributes(currentTarget)),
    ...parseAnalyticsAttr(currentTarget.getAttribute(ANALYTICS_VISIBLE_ATTR)),
  }
}

function sendVisibilityEvent(entries: IntersectionObserverEntry[]) {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      try {
        sendEvent(GENERIC_VISIBLE_EVENT_NAME, getVisibleContext(entry.target))
        defaultObserver.unobserve(entry.target)
      } catch (e) {
        reportError(e)
      }
    }
  }
}

const defaultObserver = new IntersectionObserver(sendVisibilityEvent, {
  rootMargin: `0% 0% -30% 0%`,
  threshold: 0,
})

observe(VISIBLE_SELECTORS, element => {
  defaultObserver.observe(element)
})
