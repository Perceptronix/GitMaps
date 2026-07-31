import {useLoaderData as useLoaderDataTanStack, type AnyRouter} from '@tanstack/react-router'
import {useMatches} from './use-matches'

// Mirror React Router's any default for compatibility with legacy call sites without generic.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useLoaderData<T = any>() {
  return useLoaderDataTanStack<AnyRouter, undefined, false, T>({strict: false})
}

// Mirror React Router's any default for compatibility with legacy call sites without generic.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useRouteLoaderData<T = any>(reactRouterRouteId: string) {
  // Use shimmed useMatches which already mapped TanStack match.id to React Router dataRouterId.
  const matches = useMatches()
  const match = matches.find(m => m.id === reactRouterRouteId)

  return match?.loaderData as T | undefined
}
