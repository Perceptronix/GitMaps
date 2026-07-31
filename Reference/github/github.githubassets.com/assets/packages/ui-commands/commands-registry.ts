import type {NormalizedSequenceString} from '@github-ui/hotkey'
import {useEffect, useId} from 'react'

import {CommandEventHandlersMap} from './command-event'
import {CommandId, getCommandMetadata, getKeybindings, getServiceMetadata, type ServiceId} from './commands'
import type {ScopeType} from './utils'

/**
 * Registered commands. The key is a globally unique key for each source that will be used to unregister or update
 * the registry.
 */
const registeredCommands = new Map<string, {commands: CommandEventHandlersMap; scopeType: ScopeType}>()

export interface RegisteredUIService {
  id: string
  name: string
}

export interface RegisteredUICommand {
  id: CommandId
  name: string
  description: string
  keybinding: NormalizedSequenceString | NormalizedSequenceString[]
}

export interface RegisteredUICommandGroup {
  service: RegisteredUIService
  commands: RegisteredUICommand[]
}

/**
 * Get the set of IDs of all commands currently registered on the page, regardless of scope. From these IDs the
 * command metadata can be obtained with `getCommandMetadata(commandId)`, and the service metadata can be obtained with
 * `getServiceMetadata(CommandId.getServiceId(commandId))`.
 */
export function getAllRegisteredCommands(): RegisteredUICommandGroup[] {
  const uiCommandGroupMap = new Map<ServiceId, RegisteredUICommandGroup>()
  const allRegisteredCommandIds = new Set(
    Array.from(registeredCommands.values()).flatMap(entry => CommandEventHandlersMap.keys(entry.commands)),
  )

  for (const commandId of allRegisteredCommandIds) {
    const serviceId = CommandId.getServiceId(commandId)
    if (!uiCommandGroupMap.has(serviceId)) {
      const service = getServiceMetadata(serviceId)
      uiCommandGroupMap.set(serviceId, {
        service: {id: service.id, name: service.name},
        commands: [],
      })
    }

    const command = getCommandMetadata(commandId)
    const keybindings = getKeybindings(commandId)
    if (command && keybindings.length > 0) {
      uiCommandGroupMap.get(serviceId)?.commands.push({
        id: commandId,
        name: command.name,
        description: command.description,
        /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
        keybinding: keybindings.length > 1 ? keybindings : keybindings[0]!,
      })
    }
  }

  return Array.from(uiCommandGroupMap.values())
}

/** Register commands into the command registry. */
export const useRegisterCommands = (scopeType: ScopeType, commands: CommandEventHandlersMap) => {
  const sourceId = useId()

  useEffect(() => {
    registeredCommands.set(sourceId, {commands, scopeType})

    return () => {
      registeredCommands.delete(sourceId)
    }
  }, [commands, scopeType, sourceId])
}

export const getAllRegisteredGlobalCommands = () => {
  const result: CommandEventHandlersMap = {}

  for (const entry of registeredCommands.values())
    if (entry.scopeType === 'global')
      for (const [key, handler] of CommandEventHandlersMap.entries(entry.commands)) result[key] = handler

  return result
}
