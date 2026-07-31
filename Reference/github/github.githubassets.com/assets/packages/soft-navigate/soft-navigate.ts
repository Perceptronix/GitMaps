import {ssrSafeWindow} from '@github-ui/ssr-utils'

interface SoftNavigateOptions {
  action?: 'replace' | 'assign'
}

export const softNavigate = (url: string | URL, options?: SoftNavigateOptions) => {
  let parsed: URL
  try {
    parsed = new URL(String(url), ssrSafeWindow?.location.href)
  } catch {
    return
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return
  }
  if (options?.action === 'replace') {
    ssrSafeWindow?.location.replace(parsed.href)
  } else {
    ssrSafeWindow?.location.assign(parsed.href)
  }
}
