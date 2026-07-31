/**
 * Simple localization utility for microcopy
 * Uses English text as the translation key and default value
 */

import de from './translations/de'
import es from './translations/es'
import fr from './translations/fr'
import ja from './translations/ja'
import ko from './translations/ko'
import pt from './translations/pt'

const supportedLocales = ['de', 'en', 'es', 'fr', 'ja', 'ko', 'pt'] as const
export type SupportedLocale = (typeof supportedLocales)[number]

interface Translations {
  [key: string]: string
}

type LocaleTranslations = {
  [key in Exclude<SupportedLocale, 'en'>]: Translations
}

const translations: LocaleTranslations = {
  // English uses the keys themselves
  de,
  es,
  fr,
  ja,
  ko,
  pt,
}

/**
 * Get a localized string based on the provided English text
 * The English text serves as both the key and the default value
 * if no translation is available
 *
 * @param text The English text to translate
 * @param locale Optional locale override (uses cached locale if not provided)
 * @returns The localized string or the original English text if no translation exists
 */
export function t(text: string, locale?: SupportedLocale): string {
  // Use provided locale or get from cache
  const currentLocale = locale || getLocale()

  // For English, just return the original text
  if (currentLocale === 'en') {
    return text
  }

  // For other locales, look up the translation
  if (translations[currentLocale]?.[text]) {
    return translations[currentLocale][text]
  }

  // If no translation exists, return the original English text
  return text
}

// Cached locale value - will be set on first getLocale() call
let cachedLocale: SupportedLocale | null = null

/**
 * Determine the user's locale
 *
 * The locale is detected once and then cached for subsequent calls
 *
 * @returns The detected locale code
 */
export function getLocale(): SupportedLocale {
  // Return cached value if available and not forcing refresh
  if (cachedLocale !== null) {
    return cachedLocale
  }

  // Server-side rendering check
  if (typeof window === 'undefined') {
    cachedLocale = 'en'
    return cachedLocale
  }

  // Try to get the locale from the HTML lang attribute
  const htmlLang = document?.documentElement.lang

  if (htmlLang) {
    const normalizedLang = htmlLang.slice(0, 2).toLowerCase() as SupportedLocale
    if (supportedLocales.includes(normalizedLang)) {
      cachedLocale = normalizedLang
      return cachedLocale
    }
  }

  // Default fallback
  cachedLocale = 'en'
  return cachedLocale
}

/**
 * Manually reset the cached locale (useful for testing)
 *
 * @param locale The locale to set
 */
export function resetLocale(): void {
  cachedLocale = null
}

export default t
