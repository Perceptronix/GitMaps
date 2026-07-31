import {useParams as useParamsTanStack} from '@tanstack/react-router'

/**
 * Uses TanStack Router's useParams but maps _splat to * for react-router compatibility.
 */
export function useParams() {
  const params = useParamsTanStack({strict: false})

  if ('_splat' in params) {
    return {...params, '*': params._splat}
  }

  return params
}
