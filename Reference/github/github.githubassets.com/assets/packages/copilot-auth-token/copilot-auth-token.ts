import {AuthToken, type AuthTokenResult, type SerializedAuthToken} from './auth-token'
import safeStorage from '@github-ui/safe-storage'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'

export const COPILOT_AUTH_TOKEN_KEY = 'COPILOT_AUTH_TOKEN'

export class CopilotAuthTokenProvider {
  readonly #tokenEndpoint: string
  readonly #storageKey: string
  ssoOrgIDs: string[]
  currentAuthTokenRequest: Promise<AuthToken> | null // request deduplication
  protected isUnlicensed: boolean
  copilotLocalStorage: {
    getItem: (key: string, now?: number) => string | null
    setItem: (key: string, value: string, now?: number) => void
    removeItem: (key: string) => void
  }

  constructor(
    ssoOrgIDs: string[],
    tokenEndpoint: string = '/github-copilot/chat/token',
    storageKey: string = COPILOT_AUTH_TOKEN_KEY,
  ) {
    this.ssoOrgIDs = ssoOrgIDs
    this.currentAuthTokenRequest = null
    this.isUnlicensed = false
    this.copilotLocalStorage = safeStorage('localStorage', {
      throwQuotaErrorsOnSet: false,
      ttl: 1000 * 60 * 60 * 24,
    })
    this.#storageKey = storageKey
    this.#tokenEndpoint = tokenEndpoint
  }

  /**
   * The endpoint used to mint a new auth token. Exposed as a getter so subclasses
   * can compute it lazily (e.g. from a client-only feature flag) rather than at
   * construction time, keeping construction safe in SSR/server contexts where
   * client env is not yet loaded.
   */
  protected get tokenEndpoint(): string {
    return this.#tokenEndpoint
  }

  /** The local storage key for the cached auth token. See {@link tokenEndpoint}. */
  protected get storageKey(): string {
    return this.#storageKey
  }

  /**
   * Get the current auth token, either from local storage or by minting a new one from dotcom.
   */
  async getAuthToken(): Promise<AuthToken> {
    if (this.isUnlicensed) {
      throw new CopilotAuthTokenUnlicensedError('User is not licensed for Copilot')
    }

    const token = this.getLocalStorageAuthToken()

    return token ? this.validateAuthToken(token) : this.fetchAuthToken()
  }

  setLocalStorageAuthToken(token: AuthToken) {
    this.copilotLocalStorage.setItem(this.storageKey, JSON.stringify(token.serialize()))
  }

  getLocalStorageAuthToken(): AuthToken | null {
    const value = this.copilotLocalStorage.getItem(this.storageKey)

    return value ? AuthToken.deserialize(JSON.parse(value) as SerializedAuthToken) : null
  }

  removeLocalStorageAuthToken(): void {
    this.copilotLocalStorage.removeItem(this.storageKey)
  }

  /**
   * Validate the given auth token.  If it's all good, return it, otherwise, go mint a new one from
   * dotcom and return it instead.
   */
  protected async validateAuthToken(token: AuthToken): Promise<AuthToken> {
    return token.needsRefreshing(this.ssoOrgIDs) ? this.fetchAuthToken() : token
  }

  /**
   * Return the current auth token request, or start a new one.
   *
   * The inner workings of the chat app can cause multiple requests to CAPI in quick succession.  If we
   * do not have an auth token available in local storage, each of those requests will trigger their own
   * token fetch, hence the storing of the current request on `this`.
   *
   * @param forceRefresh - If true, bypasses server-side caching (e.g., after a 401 due to token eviction)
   */
  protected fetchAuthToken(forceRefresh: boolean = false): Promise<AuthToken> {
    if (forceRefresh) {
      this.currentAuthTokenRequest = null
    }

    if (!this.currentAuthTokenRequest) {
      this.currentAuthTokenRequest = this._fetchAuthToken(forceRefresh)
    }

    return this.currentAuthTokenRequest
  }

  /**
   * Start a new auth token request, parsing the result, persisting it in local storage,
   * and clearing the current request once finished.
   *
   * @param forceRefresh - If true, appends force_refresh=true to the request URL
   */
  protected async _fetchAuthToken(forceRefresh: boolean = false): Promise<AuthToken> {
    try {
      const url = forceRefresh ? `${this.tokenEndpoint}?force_refresh=true` : this.tokenEndpoint
      const response = await verifiedFetchJSON(url, {method: 'POST'})

      if (response.ok) {
        const result = (await response.json()) as AuthTokenResult
        const token = AuthToken.fromResult(result, this.ssoOrgIDs)
        this.ssoOrgIDs = token.ssoOrgIDs // Keep provider up-to-date
        this.setLocalStorageAuthToken(token)
        this.isUnlicensed = false // User is licensed

        return token
      } else {
        if (response.status === 404) {
          // Token endpoint missing means Copilot is not enabled for this user
          this.isUnlicensed = true
          throw new CopilotAuthTokenUnlicensedError('Copilot auth token endpoint not found (404)')
        }
        throw new Error('Failed to mint new auth token')
      }
    } finally {
      this.currentAuthTokenRequest = null
    }
  }
}

export class CopilotAuthTokenUnlicensedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CopilotAuthTokenUnlicensedError'
  }
}
