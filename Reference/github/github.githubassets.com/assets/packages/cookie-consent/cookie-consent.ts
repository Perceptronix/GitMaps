import {setCookie, getCookie} from '@github-ui/cookies'
import type {ICookieCategoriesPreferences, ConsentControl} from 'consent-banner'

import {DefaultCookieConsentPreferences} from './lib/configuration'

import {languageConfigs} from './lib/language-configs'

type CookieConsentPreferencesType = {
  [key: string]: boolean | undefined
}

export const CONSENT_COOKIE_NAME = 'GHCC'

const SIX_MONTHS = 1000 * 60 * 60 * 24 * 180 // 180 days in milliseconds
const CONSENT_COOKIE_EXPIRATION_DATE = new Date(Date.now() + SIX_MONTHS) // 6 months from now

let consentControlInstance: ConsentControl | undefined
let consentControlPromise: Promise<ConsentControl> | undefined
let consentControlLocale = 'en'

const onPreferenceChange = async (preferences: ICookieCategoriesPreferences) => {
  setPreferencesToCookie(preferences)
  consentControlInstance?.hideBanner()
}

// Record the locale so the ConsentControl can be constructed lazily the first
// time the banner or preferences UI actually needs to be shown. Constructing it
// eagerly on every page load inserts banner DOM and invalidates layout even for
// visitors who never see a banner (already consented, or accept-all regions).
export function setConsentLocale(locale = 'en') {
  consentControlLocale = locale
}

export async function initializeConsentControl(locale = consentControlLocale): Promise<ConsentControl> {
  consentControlLocale = locale

  if (consentControlInstance) {
    return consentControlInstance
  }

  if (!consentControlPromise) {
    consentControlPromise = createConsentControl(locale)
  }

  try {
    return await consentControlPromise
  } catch (err) {
    consentControlPromise = undefined
    throw err
  }
}

async function createConsentControl(locale: string): Promise<ConsentControl> {
  const {ConsentControl} = await import('consent-banner')

  const baseLocale = locale.split('-')[0] || 'en'

  // Always fallback to English config, which should always exist in the map
  const config = languageConfigs[baseLocale] ? languageConfigs[baseLocale] : languageConfigs['en']

  if (!config) {
    throw new Error(`No language config found for locale: ${locale}`)
  }

  const cookieCategories = config.cookieCategories
  const consentControlOptions = config.consentControlOptions

  consentControlInstance = new ConsentControl(
    'ghcc',
    locale,
    onPreferenceChange,
    cookieCategories,
    consentControlOptions,
  )

  return consentControlInstance
}

export async function showPreferences() {
  const instance = await initializeConsentControl()
  instance.showPreferences(getPreferencesFromCookie() || {})
}

export async function showCookieBanner() {
  const instance = await initializeConsentControl()
  instance.showBanner(DefaultCookieConsentPreferences.Required)
}

export function setConsentToAcceptAll() {
  setPreferencesToCookie(DefaultCookieConsentPreferences.NotRequired)
}

export function hasNoCookiePreferences() {
  return getPreferencesFromCookie() === null
}

const consentPromiseWithResolvers = Promise.withResolvers<CookieConsentPreferencesType>()

export function waitForConsentPreferences(): Promise<CookieConsentPreferencesType> {
  return consentPromiseWithResolvers.promise
}

function setPreferencesToCookie(preferences: CookieConsentPreferencesType): void {
  const consentPreferences = Object.keys(preferences)
    .map(cookieCategoryId => `${cookieCategoryId}:${preferences[cookieCategoryId] ? '1' : '0'}`)
    .join('-')

  setCookie(CONSENT_COOKIE_NAME, consentPreferences, CONSENT_COOKIE_EXPIRATION_DATE.toUTCString())
  consentPromiseWithResolvers.resolve(preferences)
}

export function getPreferencesFromCookie(): CookieConsentPreferencesType | null {
  const preferencesCookie = getCookie(CONSENT_COOKIE_NAME)

  if (!preferencesCookie) {
    return null
  }

  const preferences = preferencesCookie.value.split('-')
  const cookieCategoriesPreferences: CookieConsentPreferencesType = {}

  for (const cookieParts of preferences) {
    const [cookieCategoryId, preference] = cookieParts.split(':')

    if (cookieCategoryId) {
      cookieCategoriesPreferences[cookieCategoryId] = preference === '1'
    }
  }

  return cookieCategoriesPreferences
}

const initialConsent = getPreferencesFromCookie()

if (initialConsent) {
  consentPromiseWithResolvers.resolve(initialConsent)
}
