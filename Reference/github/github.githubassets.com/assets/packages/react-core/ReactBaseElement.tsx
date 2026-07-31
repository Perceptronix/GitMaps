import {target} from '@github/catalyst'
import type {ErrorContext} from '@github-ui/failbot'
// eslint-disable-next-line no-restricted-imports
import {reportError} from '@github-ui/failbot'
import {noop} from '@github-ui/noop'
import {fetchSwPreloadedQueries} from '@github-ui/service-worker-connector/sw-preloaded-queries'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {sendCustomMetric, sendStats, updateCurrentApp} from '@github-ui/stats'
import {getCurrentReactAppName} from '@github-ui/stats-metadata'
import {type PropsWithChildren, startTransition, StrictMode, useEffect, useEffectEvent, version} from 'react'
import type {createRoot as createRootType, hydrateRoot as hydrateRootType, Root} from 'react-dom/client'
import {createRoot, hydrateRoot} from 'react-dom/client'

import {EXPECTED_ERRORS} from './expected-errors'
import {isDevelopmentOrStaffUser} from './is-development-or-is-staff-user'
import {isReactProfilerEnabled} from './profiler-config'
import {createReactRootErrorHandlers} from './react-root-error-handlers'

type ReactDOM = {
  createRoot: typeof createRootType
  hydrateRoot: typeof hydrateRootType
}

// Start the profiling import at module load time so it's ready before connectedCallback
const reactDomProfilingPromise: Promise<ReactDOM> | null = isReactProfilerEnabled()
  ? (import('react-dom/profiling') as unknown as Promise<ReactDOM>)
  : null

const REACT_TRACK_DETAIL = {
  devtools: {
    dataType: 'track-entry' as const,
    track: 'React root',
    trackGroup: 'Performance Timeline',
    color: 'primary' as const,
  },
}

function reactTrackDetail(tooltipText: string, color?: string) {
  return {
    detail: {
      devtools: {
        ...REACT_TRACK_DETAIL.devtools,
        tooltipText,
        ...(color ? {color} : {}),
      },
    },
  }
}

function safeMeasureWithStartMark(name: string, startMarkName: string, detail?: ReturnType<typeof reactTrackDetail>) {
  try {
    performance.measure(name, {
      start: startMarkName,
      ...(detail?.detail ? {detail: detail.detail} : {}),
    })
  } catch {
    // Missing marks can happen during interrupted/torn-down renders; avoid surfacing instrumentation failures.
  }
}

export abstract class ReactBaseElement<T> extends HTMLElement {
  @target declare embeddedData: HTMLScriptElement | undefined
  @target declare ssrError: HTMLScriptElement | undefined
  @target declare reactRoot: HTMLElement | undefined
  #root: Root | undefined
  declare embeddedDataJSON: T

  abstract nameAttribute: string
  abstract getReactNode(
    embeddedData: T,
    onError: (error: Error, context?: ErrorContext) => void,
  ): Promise<React.ReactNode>

  protected get name() {
    return this.getAttribute(this.nameAttribute) as string
  }

  get #embeddedDataText() {
    const text = this.embeddedData?.textContent
    if (!text) {
      throw new Error(`No embedded data provided for react element ${this.name}`)
    }

    return text
  }

  get hasSSRContent() {
    return this.getAttribute('data-ssr') === 'true'
  }

  get attemptedSSR() {
    return this.getAttribute('data-attempted-ssr') === 'true'
  }

  #swPrefetchPromise: Promise<void> | null = null

  connectedCallback() {
    // `repos-overview` is treated like an app for stats though its a partial
    if (this.nameAttribute === 'app-name' || this.name === 'repos-overview') {
      updateCurrentApp(this.name, this.hasSSRContent)
    }

    // Kick off SW prefetch before JSON.parse so the message reaches the service worker ASAP
    if (
      this.nameAttribute !== 'partial-name' &&
      this.name === 'issues-react' &&
      navigator.serviceWorker?.controller &&
      ssrSafeWindow
    ) {
      performance.mark(`react-root:sw-prefetch-start:${this.name}`)
      const name = this.name
      this.#swPrefetchPromise = (async () => {
        await fetchSwPreloadedQueries(ssrSafeWindow.location.href || '')
        performance.measure(`react-root:sw-prefetch(${name})`, {
          start: `react-root:sw-prefetch-start:${name}`,
          ...reactTrackDetail(`SW prefetch (${name})`),
        })
      })()
    }

    performance.mark(`react-root:parse-data-start:${this.name}`)
    this.embeddedDataJSON = JSON.parse(this.#embeddedDataText) as T
    performance.measure(`react-root:parse-data(${this.name})`, {
      start: `react-root:parse-data-start:${this.name}`,
      ...reactTrackDetail(`Parse data (${this.name})`),
    })
    this.#renderReact()
  }

  disconnectedCallback() {
    this.#root?.unmount()
    this.#root = undefined
  }

  /**
   * A React component to wrap the `baseNode` in with a custom display name to distinguish the app/partial and element. This is primarily used for devtools.
   * It's ok to create a component dynamically here, since we only render the application once.
   */
  #createWrapperForReactRoot() {
    const appName = this.name
    const Application = ({children, onCommit}: PropsWithChildren<{onCommit: () => (() => void) | void}>) => {
      const handleOnCommit = useEffectEvent(onCommit)
      useEffect(() => {
        return handleOnCommit?.() ?? undefined
      }, [])
      return children
    }

    Application.displayName = `${this.tagName}(${appName})`
    return Application
  }

  #sendHydrationMetric({requestUrl, duration}: {requestUrl: string; duration: number}) {
    sendCustomMetric({
      requestUrl,
      name: 'BROWSER_REACT_HYDRATION_DURATION',
      value: duration,
      tags: {
        appName: this.name,
        reactVersion: version,
        renderType: this.hasSSRContent ? 'hydrateRoot' : 'createRoot',
        subAppName: getCurrentReactAppName() ?? this.name,
      },
    })
  }

  /**
   * @returns A function that, when called, will emit stats to track the initial render duration.
   */
  #startInitialRenderPerformanceMeasure(): () => void {
    try {
      const startTime = window.performance.now()
      const requestUrl = window.location.href
      return () => {
        const duration = window.performance.now() - startTime
        this.#sendHydrationMetric({requestUrl, duration})
      }
    } catch {
      // silently fail
      return noop
    }
  }

  async #renderReact() {
    const reactRoot = this.reactRoot
    if (!reactRoot) throw new Error('No react root provided')
    performance.mark(`react-root:start:${this.name}`)

    let hydrationError = false
    const onError = (error: Error, context: ErrorContext = {}) => {
      hydrationError = true

      const ctx = {
        critical: true,
        reactAppName: this.name,
        ...context,
      }
      setTimeout(() => {
        reportError(error, ctx)
      })
    }
    const embeddedData = this.embeddedDataJSON
    const ssrErrorText = this.ssrError?.textContent

    // Await SW prefetch before rendering — data must be available synchronously in routes loadSync.
    if (this.#swPrefetchPromise) {
      await this.#swPrefetchPromise
    }

    performance.mark(`react-root:get-node-start:${this.name}`)
    const node = await this.getReactNode(embeddedData, onError)
    performance.measure(`react-root:get-node(${this.name})`, {
      start: `react-root:get-node-start:${this.name}`,
      ...reactTrackDetail(`Get node (${this.name})`),
    })

    if (ssrErrorText) {
      this.#logSSRError(ssrErrorText)
    }

    const collectRenderPerformanceStats = this.#startInitialRenderPerformanceMeasure()
    const classList = this.classList
    const appName = this.name
    const Application = this.#createWrapperForReactRoot()

    const baseNode = (
      <StrictMode>
        <Application
          onCommit={() => {
            performance.mark(`react-root:commit:${appName}`)
            safeMeasureWithStartMark(
              `react-root:commit(${appName})`,
              `react-root:render-start:${appName}`,
              reactTrackDetail(`Commit (${appName})`, 'secondary'),
            )
            safeMeasureWithStartMark(
              `react-root:total(${appName})`,
              `react-root:start:${appName}`,
              reactTrackDetail(`Total (${appName})`),
            )
            collectRenderPerformanceStats()

            let idle: number | undefined
            const frame = window.requestAnimationFrame(() => {
              idle = window.requestIdleCallback(() => {
                classList.add('loaded')
              })
            })

            return () => {
              cancelAnimationFrame(frame)
              if (idle !== undefined) cancelIdleCallback(idle)
            }
          }}
        >
          {node}
        </Application>
      </StrictMode>
    )

    if (this.hasSSRContent) {
      /**
       * When using Vite, we inject temporary <link> tags into the SSRd content to provide CSS Module styles on page
       * load. These tags can be removed after hydration, but need to be moved to the <head> initially to avoid
       * hydration errors. After hydration, the JS version of these CSS modules will be loaded, providing the same
       * styles with HMR support.
       */
      const viteTemporaryTags = [...this.querySelectorAll<HTMLLinkElement>('link[data-remove-after-hydration="true"]')]

      // Move Vite tags to head (these will be removed after hydration)
      for (const tag of viteTemporaryTags) {
        document.head.appendChild(tag)
      }

      // Await profiling import after DOM prep — it's been resolving since module load
      const reactDom: ReactDOM = reactDomProfilingPromise ? await reactDomProfilingPromise : {createRoot, hydrateRoot}

      // Hydrate the react app
      // React 19 provides three error callbacks for comprehensive error handling:
      // - onCaughtError: errors caught by Error Boundaries (replaces componentDidCatch logging)
      // - onUncaughtError: errors NOT caught by any Error Boundary
      // - onRecoverableError: hydration mismatches React recovers from
      const hydrateApp = () => {
        performance.mark(`react-root:render-start:${this.name}`)
        this.#root = reactDom.hydrateRoot(
          reactRoot,
          baseNode,
          createReactRootErrorHandlers({
            appName: this.name,
            onHydrationError: () => {
              hydrationError = true
            },
          }),
        )
      }
      startTransition(hydrateApp)

      // Remove the Vite temporary link tags after hydration
      if (viteTemporaryTags.length > 0) {
        // Wait until things are idle to remove the style tag. If we do it immediately, we can cause a flash of unstyled content.
        requestIdleCallback(() => {
          // styles could have already been removed by Turbo if a navigation happens quickly. Only remove it from the DOM if it's still there.
          for (const tag of viteTemporaryTags) {
            tag.parentElement?.removeChild(tag)
          }
        })
      }

      sendStats({
        incrementKey: 'REACT_RENDER',
        incrementTags: {
          appName: this.name,
          csr: false,
          error: hydrationError,
          ssr: true,
          ssrError: false,
        },
      })
    } else {
      const reactDom: ReactDOM = reactDomProfilingPromise ? await reactDomProfilingPromise : {createRoot, hydrateRoot}
      // React 19 provides error callbacks for CSR as well
      const root = reactDom.createRoot(reactRoot, createReactRootErrorHandlers({appName: this.name}))
      this.#root = root
      startTransition(() => {
        performance.mark(`react-root:render-start:${this.name}`)
        root.render(baseNode)
      })

      sendStats({
        incrementKey: 'REACT_RENDER',
        incrementTags: {
          appName: this.name,
          csr: true,
          error: hydrationError,
          ssr: this.attemptedSSR,
          ssrError: !!this.ssrError,
        },
      })
    }
  }

  #logSSRError(ssrErrorText: string) {
    if (!isDevelopmentOrStaffUser()) return
    if (EXPECTED_ERRORS[ssrErrorText]) {
      // eslint-disable-next-line no-console
      return console.error('SSR failed with an expected error:', EXPECTED_ERRORS[ssrErrorText])
    }

    try {
      const error = JSON.parse(ssrErrorText) as PlatformJavascriptError
      const stacktrace = parseFailbotStacktrace(error)
      // eslint-disable-next-line no-console
      console.error(
        'Error During Alloy SSR:',
        `${this.tagName.toLowerCase()}[${this.name}]`,
        `${error.type}: ${error.value}\n`,
        error,
        stacktrace,
      )
    } catch {
      /**
       * In the event we couldn't log the error, we should not break the application
       */
      // eslint-disable-next-line no-console
      console.error(
        'Error During Alloy SSR:',
        `${this.tagName.toLowerCase()}[${this.name}]`,
        ssrErrorText,
        'unable to parse as json',
      )
    }
  }
}

function parseFailbotStacktrace(error: PlatformJavascriptError) {
  if (!error.stacktrace) return ''
  let prefix = '\n '
  const stack = error.stacktrace.map((frame: PlatformStackframe) => {
    const {function: func, filename, lineno, colno} = frame
    const line = `${prefix} at ${func} (${filename}:${lineno}:${colno})`
    prefix = ' '
    return line
  })
  return stack.join('\n')
}
