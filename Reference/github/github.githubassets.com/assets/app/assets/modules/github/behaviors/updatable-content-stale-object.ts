import {registerStaleRecords, replaceContent, shouldRestoreStaleData} from '@github-ui/updatable-content'
import {ready} from '@github-ui/document-ready'
import {currentState, updateUrl} from '@github-ui/history'

async function reapplyPreviouslyUpdatedContent() {
  const state = currentState()
  if (!state.staleRecords) return
  await ready
  for (const url in state.staleRecords) {
    for (const urlTarget of document.querySelectorAll(
      `.js-updatable-content [data-url='${url}'], .js-updatable-content[data-url='${url}']`,
    )) {
      const data = state.staleRecords[url]
      if (urlTarget instanceof HTMLElement && data) {
        if (shouldRestoreStaleData(data)) {
          replaceContent(urlTarget, data, true)
        } else {
          delete state.staleRecords[url]
        }
      }
    }
  }

  updateUrl(location.href)
}

window.addEventListener('pagehide', registerStaleRecords)

try {
  reapplyPreviouslyUpdatedContent()
} catch {
  // ignore
}
