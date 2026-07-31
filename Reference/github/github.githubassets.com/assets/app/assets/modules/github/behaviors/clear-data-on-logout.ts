import {deleteCookie, getCookies} from '@github-ui/cookies'
import {clearIndexedDBPersisterData} from '@github-ui/safe-indexed-db-storage'

// This module detects a logout that has just occurred and clears browser data
// for the origin that might contain sensitive things such as localstorage.

// Set by lib/github/authentication/logout_result.rb on logout
export const JustLoggedOutCookieName = 'logout-was-successful'

function clearData() {
  for (const storage of [sessionStorage, localStorage]) {
    try {
      storage.clear()
    } catch {
      // ignore failure to clear
    }
  }

  // Fire-and-forget IndexedDB clearing - don't block on this
  clearIndexedDBPersisterData()
}

export function clearDataIfJustLoggedOut() {
  if (getCookies(JustLoggedOutCookieName).length > 0) {
    clearData()
    deleteCookie(JustLoggedOutCookieName)
  }
}

clearDataIfJustLoggedOut()
