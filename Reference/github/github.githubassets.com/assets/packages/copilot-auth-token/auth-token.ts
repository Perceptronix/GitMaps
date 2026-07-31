import {isFeatureEnabled} from '@github-ui/feature-flags'

/**
 * How far in advance of a token's expiration we consider it expired and trigger a refresh,
 * Keep in sync with `COPILOT_CHAT_TOKEN_TTL_PADDING` on github/github - above this will cause a refresh loop.
 */
const COPILOT_CHAT_TOKEN_TTL_PADDING = 5 * 60 * 1000 // 5 minutes in milliseconds
const DEFAULT_TOKEN_TTL_PADDING = 15 * 1000 // 15 seconds in milliseconds

export type AuthTokenResult = {
  token: string
  expiration: string
  ssoOrgIDs?: string[]
}

export type SerializedAuthToken = {
  value: string
  expiration: string
  ssoOrgIDs: string[]
}

/**
 * AuthToken represents an authentication token that is passed to CAPI, which is used to pull resources
 * from the monolith.
 *
 * It is capable of determining which authorization scheme to use (Bearer for SSATs or our own
 * GitHub-Bearer for user tokens).
 *
 * It also can tell if it needs refreshing, i.e. if it is expired or if the SSO orgs have changed since
 * it was minted.
 *
 * AuthToken doesn't care where the list of SSO orgs comes from.  Typically they are hydrated into a React
 * partial/component via props sent from the server, which would require a page refresh to receive the
 * current list, but they could theoretically come from other places too, like API calls...
 *
 * Finally, it can convert itself to/from ordinary JS objects that can be stored/retrieved from
 * local storage.
 */
export class AuthToken {
  value: string
  expiration: string
  ssoOrgIDs: string[] // The token has the most up-to-date list of *unauthenticated* SSO orgs

  constructor(value: string, expiration: string, ssoOrgIDs: string[]) {
    this.value = value
    this.expiration = expiration
    this.ssoOrgIDs = ssoOrgIDs
  }

  /**
   * Returns a formatted string to be used as the value of an `Authorization` header
   * to be "GitHub-Bearer <encrypted token>"
   */
  get authorizationHeaderValue() {
    return `GitHub-Bearer ${this.value}`
  }

  /**
   * Returns true if this auth token needs to be refreshed.
   */
  needsRefreshing(providerSsoOrgIds: string[]) {
    return this.isExpired || this.ssoChanged(providerSsoOrgIds)
  }

  /**
   * Returns true if this auth token is expired.
   */
  get isExpired() {
    const expirationDateString = new Date(this.expiration)

    const expirationDate = new Date(
      Date.UTC(
        expirationDateString.getUTCFullYear(),
        expirationDateString.getUTCMonth(),
        expirationDateString.getUTCDate(),
        expirationDateString.getUTCHours(),
        expirationDateString.getUTCMinutes(),
        expirationDateString.getUTCSeconds(),
        expirationDateString.getUTCMilliseconds(),
      ),
    )

    const padding = isFeatureEnabled('copilot_chat_increase_token_padding')
      ? COPILOT_CHAT_TOKEN_TTL_PADDING
      : DEFAULT_TOKEN_TTL_PADDING

    return expirationDate < new Date(Date.now() + padding)
  }

  /**
   * Returns true if the session's SSO'd organizations have changed since the token was originally issued.
   *
   * Technically the set of orgs is inverted, representing the orgs that are *not* SSO'd, but functionally
   * it will operate the same.
   */
  ssoChanged(providerSsoOrgIds: string[]) {
    return !(
      this.ssoOrgIDs.every(org => providerSsoOrgIds.includes(org)) &&
      providerSsoOrgIds.every(org => this.ssoOrgIDs.includes(org))
    )
  }

  /**
   * Build a new AuthToken from the results of a call to the token API endpoint.
   */
  static fromResult(result: AuthTokenResult, providerSsoOrgIds: string[]) {
    return new AuthToken(result.token, result.expiration, result.ssoOrgIDs ?? providerSsoOrgIds)
  }

  /**
   * Convert this token into a plain JS object, which can be stringified and put into localStorage.
   */
  serialize(): SerializedAuthToken {
    return {
      value: this.value,
      expiration: this.expiration,
      ssoOrgIDs: this.ssoOrgIDs,
    }
  }

  /**
   * Build a new auth token from a plain JS object, i.e. one parsed from localStorage.
   */
  static deserialize(serialized: SerializedAuthToken): AuthToken {
    return new AuthToken(serialized.value, serialized.expiration, serialized.ssoOrgIDs)
  }
}
