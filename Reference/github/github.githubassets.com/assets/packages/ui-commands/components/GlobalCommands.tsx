import {useEffect, useEffectEvent, useRef} from 'react'

import {CommandEvent, CommandEventHandlersMap} from '../command-event'
import {CommandId, getKeybindingMap} from '../commands'
import {getAllRegisteredGlobalCommands, useRegisterCommands} from '../commands-registry'
import {recordCommandTriggerEvent} from '../metrics'
import {useDetectConflicts} from '../use-detect-conflicts'
import {useKeyDownHandler} from '../use-key-down-handler'
import {getActiveModal, isInsideModal} from '../utils'

export interface GlobalCommandsProps {
  /** Map of command IDs to the corresponding event handler. */
  commands: CommandEventHandlersMap
}

class UiCommandTriggerEvent extends Event {
  commandId: CommandId
  domEvent: KeyboardEvent | MouseEvent
  constructor(commandId: CommandId, domEvent: KeyboardEvent | MouseEvent) {
    super(customDomEventName)
    this.commandId = commandId
    this.domEvent = domEvent
  }
}

/**
 * There's no context for global commands because they can be defined in any react app on the page. So to be able to
 * trigger them without keyboard events, we emit and listen for custom DOM events instead.
 */
const customDomEventName = 'ui-command-trigger'

/** Trigger a global command without a keyboard event. */
export function dispatchGlobalCommand(commandId: CommandId, domEvent: KeyboardEvent | MouseEvent) {
  document.dispatchEvent(new UiCommandTriggerEvent(commandId, domEvent))
}

const triggerCommand = <T extends CommandId>(commandId: T, domEvent: KeyboardEvent | MouseEvent) => {
  const handler = getAllRegisteredGlobalCommands()[commandId]

  if (handler) {
    const event = new CommandEvent(commandId)
    try {
      handler(event)
    } finally {
      recordCommandTriggerEvent(event, domEvent)
    }
  } else {
    // Return false to indicate the command was not handled, allowing the event to propagate
    // and the browser default behavior to occur (e.g., Cmd+S to save the page)
    return false
  }
}

/**
 * Provide command handlers that are activatable when focus is anywhere on the current page, including outside this
 * React app.
 *
 * @example
 * <GlobalCommands commands={{'issues:navigateToCode': navigateToCode}} />
 */
export const GlobalCommands = ({commands}: GlobalCommandsProps) => {
  const elementRef = useRef<HTMLDivElement>(null)

  const onCustomEvent = useEffectEvent((event: Event) => {
    if (!isValidCommandEvent(event) || wasAlreadyHandled(event)) return

    const {commandId, domEvent} = event
    triggerCommand(commandId, domEvent)
  })

  const keyDownHandler = useKeyDownHandler(triggerCommand)

  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    // When a modal dialog is open, global commands should not be able to trigger 'underneath' that dialog. This
    // prevents unexpected things from happening in the page behind the active modal. For example, you shouldn't
    // be able to navigate the underlying page when there is a dialog taking over the whole view.
    const activeModal = getActiveModalForEvent(event)
    if (activeModal && !isInsideModal(activeModal, elementRef.current)) return

    if (wasAlreadyHandled(event)) return

    // For global commands we have to recalculate the map on every event because the registry is a mutable map, not a
    // reactive value - we have no way of knowing when it changed
    const keybindingMap = getKeybindingMap(CommandEventHandlersMap.keys(getAllRegisteredGlobalCommands()))

    keyDownHandler(event, keybindingMap)
  })

  useDetectConflicts('global', commands)

  useRegisterCommands('global', commands)

  useEffect(() => {
    const unmountController = new AbortController()
    document.addEventListener('keydown', onKeyDown, {signal: unmountController.signal})
    document.addEventListener(customDomEventName, onCustomEvent, {signal: unmountController.signal})

    return () => unmountController.abort()
  }, [])

  return <div ref={elementRef} className="d-none" />
}

function isValidCommandEvent(event: Event): event is UiCommandTriggerEvent {
  return event instanceof UiCommandTriggerEvent
}

const activeModalCache = new WeakMap<Event, Element | null>()

/**
 * `getActiveModal` scans the whole document (`querySelectorAll`) and, when a modal is present, forces a layout read.
 * Every mounted `GlobalCommands` adds its own document `keydown` listener, so without caching this would run once per
 * instance per keystroke. The active modal cannot change during a single synchronous event dispatch, so we compute it
 * once and cache it for the remaining listeners to reuse, keyed on the event in a WeakMap. Keying on the event (rather
 * than mutating it) avoids touching the browser-owned object; the entry is released once the event is garbage-collected.
 */
function getActiveModalForEvent(event: Event): Element | null {
  const cached = activeModalCache.get(event)
  if (cached !== undefined) return cached

  const activeModal = getActiveModal() ?? null
  activeModalCache.set(event, activeModal)
  return activeModal
}

const handledEvents = new WeakMap<Event, true>()

/**
 * GlobalCommands event handlers act as a singleton, unifying all the mounted handlers into one for better conflict
 * resolution and performance. To avoid handling the same event twice, the first handler to see it records it and
 * subsequent handlers completely ignore recorded events. The record is kept in a WeakMap keyed on the event (shared
 * across all listeners in one dispatch) rather than mutating the browser-owned event; the entry is released once the
 * event is garbage-collected.
 */
function wasAlreadyHandled(event: Event): boolean {
  if (handledEvents.has(event)) {
    return true
  }

  // Record the event as handled so that if another GlobalCommands component receives it, it will know not to handle it again
  handledEvents.set(event, true)
  return false
}
