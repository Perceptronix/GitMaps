import {isShortcutAllowed} from '@github-ui/hotkey/keyboard-shortcuts-helper'
import {on} from 'delegated-events'

// Support 'c' key to open commits too
on('navigation:keydown', '.js-commits-list-item', function (event) {
  if (!isShortcutAllowed(event.detail.originalEvent)) return

  if (!(event.target instanceof Element)) return
  if (event.detail.hotkey === 'c') {
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    event.target.querySelector<HTMLElement>('.js-navigation-open')!.click()
  }
})
