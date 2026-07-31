import {CLIENT_VERSION_HTTP_HEADER, getClientVersion} from '@github-ui/client-version'
import {getFetchNonceHeaders} from '@github-ui/fetch-nonce'

export function getBaseFetchHeaders(nonceToValidate?: string) {
  let headers: HeadersInit = {
    'X-Requested-With': 'XMLHttpRequest',
    ...getFetchNonceHeaders(nonceToValidate),
  }

  headers = {
    ...headers,
    [CLIENT_VERSION_HTTP_HEADER]: getClientVersion(),
  }

  return headers
}

export function addBaseFetchHeaders(headers: Headers, nonceToValidate?: string) {
  const fetchHeaders = getBaseFetchHeaders(nonceToValidate)

  for (const [header, value] of Object.entries(fetchHeaders)) {
    headers.set(header, value)
  }
}

export function getAppTypeHeader(appType: 'navigator' | 'dataRouter'): HeadersInit {
  return {'X-GitHub-App-Type': appType}
}
