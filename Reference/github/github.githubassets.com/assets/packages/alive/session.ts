import {AliveSession as BaseAliveSession} from '@github/alive-client'
import type {AliveSessionOptions, Notifier} from '@github/alive-client'

type AliveSessionConfig<T> = {
  url: string
  refreshUrl: string
  shared: boolean
  notify: Notifier<T>
  options: AliveSessionOptions
}

export class AliveSession<T> extends BaseAliveSession<T> {
  #refreshUrl: string

  constructor({url, refreshUrl, shared, notify, options}: AliveSessionConfig<T>) {
    super(url, () => this.#getUrlFromRefreshUrl(), shared, notify, undefined, options)
    this.#refreshUrl = refreshUrl
  }

  #getUrlFromRefreshUrl() {
    return fetchRefreshUrl(this.#refreshUrl)
  }
}

export async function fetchRefreshUrl(url: string): Promise<string | null> {
  return post(url, {'GitHub-Verified-Fetch': 'true'})
}

async function post(url: string, headers: Record<string, string>): Promise<string | null> {
  const response = await fetch(url, {
    method: 'POST',
    mode: 'same-origin',
    headers,
  })
  if (response.ok) {
    return response.text()
  } else {
    throw new Error('fetch error')
  }
}
