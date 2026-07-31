import {addGitHubToTitle, setTitle} from '@github-ui/document-metadata'
import type {QueryClient, QueryKey} from '@github-ui/react-query'
import {useQueryClient} from '@github-ui/react-query'
import {useEffect} from 'react'

import {isDevelopmentOrStaffUser} from '../is-development-or-is-staff-user'
import {useRouteMatches} from './query-route'

export function TitleManager() {
  const matches = useRouteMatches()
  const queryClient = useQueryClient()
  useEffect(() => {
    // Avoid Array.prototype.toReversed until it's been around a bit longer for the
    // sake of older browsers (e.g. Chrome <=109)
    for (const match of [...matches].reverse()) {
      if (!match.handle?.queryRoute) continue
      const config = match.loaderData?.queries.mainQuery
      if (!config) continue
      const title = getTitleFromQueryClient(queryClient, config.queryKey)
      if (title) {
        setTitle(addGitHubToTitle(title))
        break
      }
    }
  }, [matches, queryClient])

  return null
}

type QueryDataForTitle = {title?: string} | {meta?: {title: string}}

export function getTitleFromQueryClient(queryClient: QueryClient, queryKey: QueryKey): string | undefined {
  const cached = queryClient.getQueryData<QueryDataForTitle>(queryKey)

  if (!cached) {
    // If we're trying to look up data for a query key that does not exist in the query
    // client, we should not throw an error. Just don't set a title in this case.
    if (isDevelopmentOrStaffUser()) {
      // eslint-disable-next-line no-console
      console.error(
        'Unexpected attempt to read title for a query that is not in the query client. If you encounter this error in your application, please reach out to #react to help diagnose the issue.',
      )
    }
    return undefined
  } else if ('title' in cached && cached.title) {
    return cached.title
  } else if ('meta' in cached && cached.meta) {
    return cached.meta.title
  }
}
