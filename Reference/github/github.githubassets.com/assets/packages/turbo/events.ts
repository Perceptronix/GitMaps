// eslint-disable-next-line no-restricted-imports
import {observe} from '@github-ui/selector-observer'
import {isTurboFrame, dispatchTurboReload, canRepoSoftNavigate} from './utils'
import {beginProgressBar, completeProgressBar} from './progress-bar'
import {getCachedAttributes, setDocumentAttributesCache} from './cache'
import {ssrSafeWindow, ssrSafeDocument} from '@github-ui/ssr-utils'
import {inSoftNav} from '@github-ui/soft-nav/utils'
import type {FetchRequest} from '@github/turbo/dist/types/http/fetch_request'
import type {FrameElement} from '@github/turbo'
import {addValidNonce, FETCH_NONCE_HEADER, getFetchNonce} from '@github-ui/fetch-nonce'
import {CLIENT_VERSION_HTTP_HEADER, getClientVersion} from '@github-ui/client-version'
import {updateHtmlHighContrastMode} from '@github-ui/high-contrast-cookie'
import {addRequestId} from '@github-ui/recent-request-ids'
import {reactNavigateIfPossible, repoNavigateIfPossible} from './react'
import {sendCustomMetric} from '@github-ui/stats'

const REPOS_FRAME_ID = 'repo-content-turbo-frame'

if (ssrSafeWindow) {
  // We want to make sure that links inside a `data-turbo-frame` container also have the data attribute.
  observe('[data-turbo-frame]', {
    constructor: HTMLElement,
    add(el) {
      if (el.tagName === 'A' || el.getAttribute('data-turbo-frame') === '') return

      for (const link of el.querySelectorAll('a:not([data-turbo-frame])')) {
        link.setAttribute('data-turbo-frame', el.getAttribute('data-turbo-frame') || '')
      }
    },
  })
}

ssrSafeDocument?.addEventListener(
  'submit',
  event => {
    if (!(event.target instanceof HTMLFormElement)) return

    const submitter = event.submitter instanceof HTMLElement ? event.submitter : null
    const frameId = submitter?.getAttribute('data-turbo-frame') ?? event.target.getAttribute('data-turbo-frame')

    const targetsFrame =
      event.target.closest('turbo-frame') !== null ||
      (frameId !== null && frameId !== '_top' && document.getElementById(frameId)?.tagName === 'TURBO-FRAME')

    const acceptsTurboStream =
      submitter?.hasAttribute('data-turbo-stream') === true || event.target.hasAttribute('data-turbo-stream')

    if (!targetsFrame && !acceptsTurboStream) {
      event.target.setAttribute('data-turbo', 'false')
    }
  },
  {capture: true},
)

ssrSafeDocument?.addEventListener('turbo:click', function (event) {
  if (!(event.target instanceof HTMLElement)) return

  if (event.detail.originalEvent?.defaultPrevented) {
    event.preventDefault()
    return
  }

  if (reactNavigateIfPossible(event)) return
  if (repoNavigateIfPossible(event)) return

  // Let Turbo Stream links proceed with normal Turbo handling
  if (event.target.hasAttribute('data-turbo-stream')) return

  if (canFrameNavigate(event)) {
    event.preventDefault()
    event.detail.originalEvent?.preventDefault()
    frameNavigate(event)
    return
  }

  // The inSoftNav() check is a defensive guard to avoid breaking navigations in edge cases:
  // 1. frameNavigate() triggers a second turbo:click (via anchor.click()) which must proceed
  // 2. Other navigation mechanisms (React, etc.) may have started a soft nav we shouldn't interrupt
  if (!inSoftNav()) {
    event.preventDefault()
  }
})

// Emulate `onbeforeunload` event handler for Turbo navigations to
// support warning a user about losing unsaved content
ssrSafeDocument?.addEventListener('turbo:before-fetch-request', function (event) {
  try {
    const unloadMessage = window.onbeforeunload?.(event)

    if (unloadMessage) {
      const navigate = confirm(unloadMessage)
      if (navigate) {
        window.onbeforeunload = null
      } else {
        event.preventDefault()
        completeProgressBar()
      }
    }
  } catch (e) {
    if (!(e instanceof Error)) throw e
    if (e.message !== 'Permission denied to access object') throw e
  }
})

ssrSafeDocument?.addEventListener('turbo:before-fetch-request', event => {
  if (event.defaultPrevented) return

  const frame = event.target as Element
  if (isTurboFrame(frame)) {
    beginProgressBar()
  }

  const ev = event as CustomEvent

  ev.detail.fetchOptions.headers[CLIENT_VERSION_HTTP_HEADER] = getClientVersion()
  ev.detail.fetchOptions.headers[FETCH_NONCE_HEADER] = getFetchNonce()

  const headers = ev.detail.fetchOptions.headers
  const acceptsStream = String(headers.Accept ?? '').includes('text/vnd.turbo-stream.html')
  const isForm = event.target instanceof HTMLFormElement

  // attach a Turbo specific header for visit requests so the server can track Turbo usage
  if (!headers['Turbo-Frame'] && !acceptsStream && !isForm) {
    headers['Turbo-Visit'] = 'true'
  }
})

/**
 * I think this was upstreamed entirely - we can probably delete this emitter and just listen to fetch-request-error?
 */
// TODO: turbo upstream will emit this event eventually https://github.com/hotwired/turbo/pull/640
// and we can remove the types above
const frame = ssrSafeDocument?.createElement('turbo-frame') as unknown as FrameElement
const controllerPrototype = Object.getPrototypeOf(frame.delegate)
const originalRequestErrored = controllerPrototype.requestErrored
controllerPrototype.requestErrored = function (request: FetchRequest, error: Error) {
  this.element.dispatchEvent(
    new CustomEvent('turbo:fetch-error', {
      bubbles: true,
      detail: {request, error},
    }),
  )
  return originalRequestErrored.apply(this, request, error)
}

declare global {
  interface DocumentEventMap {
    'turbo:fetch-error': CustomEvent<{request: FetchRequest; error: Error}>
  }
}

// when a frame fetch request errors due to a network error
// we reload the page to prevent hanging the progress bar indefinitely
ssrSafeDocument?.addEventListener('turbo:fetch-error', event => {
  // we don't want to reload the page due to an error on a form
  // since we might throw away the users work or submit the form again
  // other handling would be needed for this use case
  if (event.target instanceof HTMLFormElement) {
    return
  }

  // event.detail.request can be undefined in some error conditions (e.g. when
  // the fetch was aborted before a request was constructed), so guard against
  // dereferencing it to avoid a noisy TypeError.
  const fetchRequest = event.detail.request
  if (!fetchRequest?.location) {
    return
  }

  window.location.href = fetchRequest.location.href
  event.preventDefault()
})

ssrSafeDocument?.addEventListener('turbo:before-fetch-response', async event => {
  const fetchResponse = event.detail.fetchResponse

  // Turbo is misbehaving when we Drive to our 404 page, so we
  // can force a reload if the response is 404 and prevent Turbo
  // from continuing.
  if (fetchResponse.statusCode === 404) {
    dispatchTurboReload({
      reason: fetchResponse.statusCode.toString(),
      frame: isTurboFrame(event.target),
      url: fetchResponse.location.href,
    })
    window.location.href = fetchResponse.location.href
    event.preventDefault()
  }

  const newNonce = fetchResponse.header('X-Fetch-Nonce')
  if (newNonce) addValidNonce(newNonce)
  const requestId = fetchResponse?.header('X-Github-Request-Id')
  if (requestId) addRequestId(requestId)
  const responseHTML = await fetchResponse.responseHTML

  // we want to handle non-HTML responses (like downloads) here
  if (!responseHTML) {
    sendCustomMetric({
      name: 'TURBO_ERROR_RESPONSE_NOT_HTML',
      value: 1,
    })

    completeProgressBar()
    // Prevent Turbo from handling this as a frame navigation
    // eslint-disable-next-line github/async-preventdefault
    event.preventDefault()

    // Trigger a native download by navigating to the URL
    if (fetchResponse?.location) {
      window.location.href = fetchResponse.location.href
    }
    return
  }

  if (!newNonce) {
    const parsedHTML = new DOMParser().parseFromString(responseHTML ?? '', 'text/html')
    handleFetchNonceFromDocument(parsedHTML)
  }
})

ssrSafeDocument?.addEventListener('turbo:frame-render', event => {
  if (isTurboFrame(event.target)) {
    completeProgressBar()
  }
})

// Update <html> attributes when Turbo renders (fires for Frame navigations)
ssrSafeDocument?.addEventListener('turbo:before-render', () => {
  // Update <html> high contrast mode
  updateHtmlHighContrastMode()
  setDocumentAttributesCache()
})

// Fallback in case the Turbo response did not add X-Fetch-Nonce header. This may happen if the browser
// fails to add the Turbo header to the request for some reason.
function handleFetchNonceFromDocument(html: Document) {
  const nonce = html.querySelector<HTMLMetaElement>(
    '#pjax-head meta[name=fetch-nonce], head meta[name=fetch-nonce]',
  )?.content

  if (nonce) addValidNonce(nonce)
}

ssrSafeWindow?.addEventListener('popstate', () => {
  const currentDocument = document.documentElement
  const cachedAttributes = getCachedAttributes()

  if (!cachedAttributes) return

  for (const attr of currentDocument.attributes) {
    if (!cachedAttributes.find(cached => cached.nodeName === attr.nodeName)) {
      currentDocument.removeAttribute(attr.nodeName)
    }
  }

  for (const attr of cachedAttributes) {
    if (currentDocument.getAttribute(attr.nodeName) !== attr.nodeValue) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      currentDocument.setAttribute(attr.nodeName, attr.nodeValue!)
    }
  }
})

function frameNavigate(event: TurboClickEvent) {
  const anchor = document.createElement('a')
  anchor.href = event.detail.url
  anchor.setAttribute('data-turbo-frame', REPOS_FRAME_ID)
  anchor.hidden = true
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

// This only works for repos for now.
function canFrameNavigate(event: TurboClickEvent) {
  if (!(event.target instanceof HTMLElement)) return false

  const frameId = event.target.getAttribute('data-turbo-frame')

  // already a frame navigation
  if (frameId) return false

  const frameElement = document.getElementById(REPOS_FRAME_ID)

  // not in a repo frame
  if (!isTurboFrame(frameElement)) return false
  if (!canRepoSoftNavigate(event.detail.url)) return false

  return true
}
