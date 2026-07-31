import type {Context} from '@github/hydro-analytics-client'
import {on} from 'delegated-events'
import {sendEvent} from '@github-ui/hydro-analytics'

on('click', '[data-octo-click]', function (event) {
  const targetEl = event.currentTarget
  if (!(targetEl instanceof HTMLElement)) {
    return
  }

  const eventType = targetEl.getAttribute('data-octo-click') || ''
  const context: Context = {}

  if (targetEl.hasAttribute('data-ga-click')) {
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    const gaEvent = targetEl.getAttribute('data-ga-click')!
    const parts = gaEvent.split(',')
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    context.category = parts[0]!.trim()
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    context.action = parts[1]!.trim()
  }

  if (targetEl.hasAttribute('data-octo-dimensions')) {
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    const dimensionsList = targetEl.getAttribute('data-octo-dimensions')!.split(',')

    for (const dimensionPair of dimensionsList) {
      const [key, value] = dimensionPair.split(/:(.+)/)
      if (key) {
        context[key] = value || ''
      }
    }
  }
  sendEvent(eventType, context)
})
