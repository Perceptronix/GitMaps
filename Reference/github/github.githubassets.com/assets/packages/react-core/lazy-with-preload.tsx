import {type ComponentProps, type ComponentType, lazy, useState} from 'react'

/**
 * Extends `React.lazy` with a `preload()` method to begin fetching the component chunk ahead of use
 * (e.g. on hover/focus), which avoids a request waterfall.
 *
 * It also avoids the Suspense fallback "flash": a bare `React.lazy` commits its fallback for one frame
 * on first render even when the chunk is already loaded, because its payload promise settles on a
 * microtask. Here, once the component has been preloaded (or previously rendered) it renders
 * synchronously on mount with no fallback. A cold mount still shows the nearest Suspense fallback
 * while the chunk loads.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyWithPreload<T extends ComponentType<any>>(
  load: () => Promise<{default: T}>,
): T & {preload: () => Promise<void>} {
  let loadedComponent: T | undefined
  let loadPromise: Promise<{default: T}> | undefined

  const loadOnce = (): Promise<{default: T}> => {
    if (!loadPromise) {
      loadPromise = (async () => {
        const importedModule = await load()
        loadedComponent = importedModule.default
        return importedModule
      })()
    }
    return loadPromise
  }

  const LazyComponent = lazy(loadOnce)

  function PreloadableComponent(props: ComponentProps<T>) {
    // Captured once per mount: if the chunk is already loaded, render the component synchronously (no
    // fallback flash); otherwise commit to the lazy path for this instance so it never swaps mid-life.
    const [preloadedComponent] = useState(() => loadedComponent)
    const ResolvedComponent = (preloadedComponent ?? LazyComponent) as ComponentType<ComponentProps<T>>
    return <ResolvedComponent {...props} />
  }

  return Object.assign(PreloadableComponent as unknown as T, {
    preload: async (): Promise<void> => {
      await loadOnce()
    },
  })
}
