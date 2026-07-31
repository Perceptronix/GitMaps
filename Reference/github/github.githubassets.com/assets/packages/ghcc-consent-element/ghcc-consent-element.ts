import {controller, attr} from '@github/catalyst'
import {
  setConsentLocale,
  hasNoCookiePreferences,
  showCookieBanner,
  setConsentToAcceptAll,
} from '@github-ui/cookie-consent'

@controller('ghcc-consent')
export class GhccConsentElement extends HTMLElement {
  @attr declare initialCookieConsentAllowed: string
  @attr declare cookieConsentRequired: string
  @attr declare locale: string

  connectedCallback() {
    setConsentLocale(this.locale || 'en')

    if (this.initialCookieConsentAllowed === 'true' && hasNoCookiePreferences()) {
      this.#setInitialCookieConsent()
    }
  }

  #setInitialCookieConsent() {
    if (this.cookieConsentRequired === 'true') {
      showCookieBanner()
    } else {
      setConsentToAcceptAll()
    }
  }
}
