import {useState, useCallback, useEffect, Suspense} from 'react'
import {useQueryClient} from '@github-ui/react-query'
import {GlobalCommands} from '@github-ui/ui-commands'
import {getQueryOptions} from './keyboard-shortcuts-query-options'
import {lazyWithPreload} from '@github-ui/react-core/lazy-with-preload'
import {Dialog, Spinner} from '@primer/react'
import strings from './strings'
import styles from './KeyboardShortcutsDialog.module.css'
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {Blankslate} from '@primer/react/experimental'
import {AlertIcon} from '@primer/octicons-react'

const LazyDialogContent = lazyWithPreload(() => import('./components/ShortcutsDialogContent'))

interface KeyboardShortcutsDialogProps {
  docsUrl: string
}

/**
 * Read keyboard shortcut contexts from meta tag. Returns a comma-separated list of contexts. If an empty string, the
 * only context is global so we will still fetch site-wide shortcuts. If `undefined`, the meta tag was not found and
 * shortcut fetching is skipped.
 */
function getContexts() {
  return document.querySelector<HTMLMetaElement>('meta[name=github-keyboard-shortcuts]')?.content
}

const LoadingState = () => (
  <div role="status" className={styles.LoadingStateContainer}>
    <Spinner size="large" />
    <span className="sr-only">{strings.loading}</span>
  </div>
)

export function KeyboardShortcutsDialog({docsUrl}: KeyboardShortcutsDialogProps) {
  /** `null` when the dialog is closed, `undefined` when the dialog is open but the meta tag was not found. */
  const [contexts, setContexts] = useState<string | null | undefined>(null)
  const queryClient = useQueryClient()

  // Preload the dialog component during idle time
  useEffect(() => {
    const id = requestIdleCallback(() => {
      void LazyDialogContent.preload()
    })
    return () => cancelIdleCallback(id)
  }, [])

  // Seed contexts from DOM meta tag and kick off prefetch when opening the dialog
  const showDialog = useCallback(() => {
    const ctx = getContexts()
    setContexts(ctx)
    void queryClient.prefetchQuery(getQueryOptions(ctx))
  }, [queryClient])

  return (
    <>
      <GlobalCommands commands={{'global-navigation:show-shortcuts-dialog': showDialog}} />
      {contexts !== null && (
        <Dialog
          title={strings.keyboardShortcuts}
          aria-modal="true"
          width="xlarge"
          height="large"
          onClose={() => setContexts(null)}
          className={styles.ShortcutsDialogRoot}
        >
          <ErrorBoundary
            fallback={
              <Blankslate narrow>
                <Blankslate.Visual>
                  <AlertIcon size="medium" />
                </Blankslate.Visual>
                <Blankslate.Heading>{strings.errorTitle}</Blankslate.Heading>
                <Blankslate.Description>{strings.errorMessage}</Blankslate.Description>
              </Blankslate>
            }
          >
            <Suspense fallback={<LoadingState />}>
              <LazyDialogContent contexts={contexts} docsUrl={docsUrl} />
            </Suspense>
          </ErrorBoundary>
        </Dialog>
      )}
    </>
  )
}
