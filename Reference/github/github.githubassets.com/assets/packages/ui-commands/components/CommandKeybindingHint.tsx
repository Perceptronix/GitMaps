import {KeybindingHint, type KeybindingHintProps} from '@primer/react/experimental'

import type {CommandId} from '../commands'
import {getPrimaryKeybinding} from '../commands'

interface CommandKeybindingHintProps extends Omit<KeybindingHintProps, 'keys'> {
  commandId: CommandId
}

/** Renders a visual representing the keybinding for a command. If no keybinding is present, renders nothing. */
export const CommandKeybindingHint = ({commandId, ...props}: CommandKeybindingHintProps) => {
  const keys = getPrimaryKeybinding(commandId)
  return keys ? <KeybindingHint keys={keys} {...props} /> : null
}
