import {isFeatureEnabled} from '@github-ui/feature-flags'
import type {JSFeatureFlag} from '@github-ui/feature-flags/client-feature-flags'
import type {NormalizedSequenceString} from '@github-ui/hotkey'
import {normalizeSequence, splitHotkeyString} from '@github-ui/hotkey'

import jsonMetadata from './__generated__/ui-commands.json'

const {commands, services} = jsonMetadata

const serviceCommandIds = new Set(Object.keys(commands) as CommandId[])

export type ServiceId = keyof typeof services

/** Full joined command ID (in `serviceId:commandId` form). */
export type CommandId = keyof typeof commands
export const CommandId = {
  is: (str: string): str is CommandId => serviceCommandIds.has(str as CommandId),
  getServiceId: (commandId: CommandId) => commandId.split(':')[0] as ServiceId,
}

export interface CommandMetadata {
  name: string
  description: string
  defaultBinding?: string
  featureFlag?: JSFeatureFlag
}

/**
 * Get the documentation metadata for the given command. Returns `undefined` if the command is
 * disabled via feature flag.
 */
export const getCommandMetadata = (commandId: CommandId) => {
  const metadata = commands[commandId] as CommandMetadata
  return !metadata?.featureFlag || isFeatureEnabled(metadata.featureFlag) ? metadata : undefined
}

/** Get the documentation metadata for the given service. */
export const getServiceMetadata = (serviceId: ServiceId) => services[serviceId]

/** Get all normalized keybindings for a command. */
export const getKeybindings = (commandId: CommandId): NormalizedSequenceString[] => {
  const commandMeta = getCommandMetadata(commandId)
  if (!commandMeta?.defaultBinding) return []
  return splitHotkeyString(commandMeta.defaultBinding).map(normalizeSequence)
}

/**
 * Get the primary keybinding for a command.
 * @note Most of the time, external consumers should not need this. Do not use this to bind keyboard event listeners
 * (use `ScopedCommands` or `GlobalCommands` instead). If possible, do not use this to display keybinding hints (use
 * `CommandKeybindingHint` instead). This is typically for cases where you need to display a keybinding hint but the
 * destination can only take a plain string, as in the case of `IconButton`'s `keybindingHint` prop (but even then,
 * prefer `CommandIconButton` if possible).
 */
export const getPrimaryKeybinding = (commandId: CommandId): NormalizedSequenceString | undefined =>
  getKeybindings(commandId)[0]

/**
 * Get all `[commandId, keybinding]` pairs. When a command has multiple comma-separated
 * keybindings, multiple pairs are returned for that command.
 */
export const getKeybindingsForCommands = (commandIds: CommandId[]): Array<[CommandId, NormalizedSequenceString]> => {
  const output: Array<[CommandId, NormalizedSequenceString]> = []
  for (const id of commandIds) {
    for (const keybinding of getKeybindings(id)) {
      output.push([id, keybinding])
    }
  }
  return output
}

/** Get keybindings as a map of keybindings to command IDs, for fast reverse lookup. */
export const getKeybindingMap = (commandIds: CommandId[]) => {
  const result = new Map<NormalizedSequenceString, CommandId>()

  const keybindings = getKeybindingsForCommands(commandIds)
  for (const [commandId, keybinding] of keybindings) result.set(keybinding, commandId)

  return result
}
