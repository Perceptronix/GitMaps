import {defaultStringifySearch} from '@tanstack/react-router'
import type {URLSearchParamsInit} from './use-navigate'

/**
 * Converts a broadly typed TanStack search object to a URLSearchParams instance
 * using TanStack's defaultStringifySearch function to normalize the search object.
 */
export function tanStackSearchToURLSearchParams(search: Record<string, unknown>): URLSearchParams {
  const normalizedSearch = defaultStringifySearch(search)
  return createSearchParams(normalizedSearch)
}

export function createSearchParams(init?: URLSearchParamsInit): URLSearchParams {
  if (!init) return new URLSearchParams()
  if (typeof init === 'string' || init instanceof URLSearchParams || Array.isArray(init))
    return new URLSearchParams(init)

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(init)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item)
      }
    } else {
      params.set(key, value)
    }
  }

  return params
}
