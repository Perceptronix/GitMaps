import type {UseQueryOptions} from '@github-ui/react-query'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'

export interface APICommand {
  id: string
  name: string
  description: string
  keybinding?: string | string[]
  hold?: boolean
}

export interface APICommandGroup {
  service: {id: string; name: string}
  commands: APICommand[]
}

export interface APIShortcuts {
  commands: Record<string, APICommandGroup>
}

async function fetchKeyboardShortcuts(contexts: string | undefined): Promise<APIShortcuts | null> {
  if (contexts === undefined) return null

  const params = new URLSearchParams({contexts})
  const resp = await verifiedFetchJSON(`/site/keyboard_shortcuts?${params}`, {method: 'GET'})
  return resp.ok ? resp.json() : null
}

export function getQueryOptions(contexts: string | undefined) {
  const normalizedContexts = contexts?.replace(/-/g, '_')
  return {
    queryKey: ['keyboard-shortcuts', normalizedContexts] as const,
    queryFn: () => fetchKeyboardShortcuts(normalizedContexts),
    staleTime: Infinity,
  } satisfies UseQueryOptions
}
