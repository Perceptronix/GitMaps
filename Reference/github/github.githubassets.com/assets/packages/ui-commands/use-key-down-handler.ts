import type {NormalizedSequenceString} from '@github-ui/hotkey'
import {SequenceTracker} from '@github-ui/hotkey'
import {isShortcutAllowed} from '@github-ui/hotkey/keyboard-shortcuts-helper'
import {useCallback, useMemo, useRef} from 'react'

import type {CommandId} from './commands'
import {getSubsequences} from './utils'

interface UseKeyDownHandlerOptions {
  triggerOnDefaultPrevented?: boolean
}

/**
 * @param triggerCommand Callback to trigger the command handler. Explicitly return `false` to indicate that the
 * command was ignored and the event should be allowed to propagate as normal.
 */
export function useKeyDownHandler(
  triggerCommand: (id: CommandId, event: KeyboardEvent) => false | void,
  {triggerOnDefaultPrevented = false}: UseKeyDownHandlerOptions = {},
) {
  const sequenceTracker = useMemo(() => new SequenceTracker(), [])

  const lastEventRef = useRef<KeyboardEvent | null>(null)

  return useCallback(
    // The keybinding map must be passed at event time because for global commands it's a mutable registry, not a reactive value
    (event: React.KeyboardEvent | KeyboardEvent, keybindingMap: Map<NormalizedSequenceString, CommandId>) => {
      const nativeEvent = 'nativeEvent' in event ? event.nativeEvent : event
      if (!triggerOnDefaultPrevented && nativeEvent.defaultPrevented) return

      // This handler may be registered at both the DOM and React levels; in that case we want to avoid registering /
      // handling the same event twice.
      if (lastEventRef.current === nativeEvent) return
      lastEventRef.current = nativeEvent

      if (!isShortcutAllowed(nativeEvent)) {
        sequenceTracker.reset()
        return
      }

      sequenceTracker.registerKeypress(nativeEvent)

      let commandId
      for (const sequence of getSubsequences(sequenceTracker.sequence)) {
        commandId = keybindingMap.get(sequence)
        if (commandId) break
      }
      if (!commandId) return

      const handled = triggerCommand(commandId, nativeEvent) ?? true

      if (handled) {
        sequenceTracker.reset()
        event.preventDefault()
        event.stopPropagation()
        // avoids double triggering an event if an element is rendered twice
        // for example when a mobile version is hidden by CSS
        nativeEvent.stopImmediatePropagation()
      }
    },
    [sequenceTracker, triggerCommand, triggerOnDefaultPrevented],
  )
}
