// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {useEffect, useEffectEvent} from 'react'

import {EXPECTED_ERRORS} from './expected-errors'

export function SSRErrorToast({ssrError}: {ssrError: HTMLScriptElement}) {
  const {addToast} = useToastContext()
  const isExpectedError = EXPECTED_ERRORS[ssrError.textContent || '']

  const showErrorToastIfNeeded = useEffectEvent(() => {
    if (!isExpectedError) {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        type: 'error',
        message: 'SSR failed, see console for error details (Staff Only)',
      })
    }
  })

  useEffect(() => {
    showErrorToastIfNeeded()
  }, [])

  return null
}
