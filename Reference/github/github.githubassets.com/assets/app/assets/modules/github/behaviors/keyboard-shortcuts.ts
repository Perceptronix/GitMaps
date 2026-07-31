import {dialog} from '@github-ui/details-dialog'
import {fetchSafeDocumentFragment} from '@github-ui/fetch-utils'
import {observe} from '@github-ui/selector-observer'
import {on} from 'delegated-events'

let shortcutModalShown = false

async function showKeyboardShortcuts() {
  if (shortcutModalShown) return
  shortcutModalShown = true

  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const metaKeyboardShortcuts = document.querySelector<HTMLMetaElement>('meta[name=github-keyboard-shortcuts]')!
  const options = {contexts: metaKeyboardShortcuts.content}
  const url = `/site/keyboard_shortcuts?${new URLSearchParams(options).toString()}`

  const shortcutModal = await dialog({
    content: fetchSafeDocumentFragment(document, url),
    labelledBy: 'keyboard-shortcuts-heading',
  })
  shortcutModal.style.width = '800px'
  shortcutModal.addEventListener(
    'dialog:remove',
    function () {
      shortcutModalShown = false
    },
    {once: true},
  )
}

// Toggles ajax request to display keyboard shortcuts.
//
// Add a class of `js-keyboard-shortcuts` to get this behavior on your page.
on('click', '.js-keyboard-shortcuts', showKeyboardShortcuts)

observe('.js-modifier-key', {
  constructor: HTMLElement,
  add(container) {
    if (/Macintosh/.test(navigator.userAgent)) {
      let shortcut = container.textContent
      if (shortcut) {
        shortcut = shortcut.replace(/ctrl/, '⌘')
        shortcut = shortcut.replace(/alt/, '⌥')
        container.textContent = shortcut
      }
    }
  },
})
