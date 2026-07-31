import {loaded} from '@github-ui/document-ready'
import {sendPageView} from '@github-ui/hydro-analytics'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {getSoftNavMechanism} from '@github-ui/soft-nav/utils'
import {getCurrentReactAppName} from '@github-ui/stats-metadata'
import type {Context} from '@github/hydro-analytics-client'

function getContext(context: Context = {}) {
  const reactAppName = getCurrentReactAppName()
  if (!reactAppName) return context

  return {
    ...context,
    react_app: reactAppName,
  }
}

;(async function () {
  // Turbo loads should be treated like pageloads
  document.addEventListener(SOFT_NAV_STATE.FRAME_UPDATE, () => sendPageView(getContext({turbo: 'true'})))

  document.addEventListener(SOFT_NAV_STATE.SUCCESS, () => {
    if (getSoftNavMechanism() === 'turbo.frame') {
      return
    } else {
      sendPageView(getContext({turbo: 'true'}))
    }
  })

  // Send a page view as soon as the page is loaded
  await loaded
  sendPageView(getContext())
})()
